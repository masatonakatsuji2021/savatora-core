import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { ChildProcess, fork } from "child_process";
import { ServerInit } from "./ServerInit";
import { ServerSector } from "./ServerSector";
import { ThreadMessageMode } from "./ThreadMessageMode";
import { ThreadMessageDataOnStart } from "./ThreadMessageDataOnStart";
import { ThreadMessageDataOnEvent } from "./ThreadMessageDataOnEvent";
import { ThreadMessageDataOnListen } from "./ThreadMessageDataOnListen";
import { ServerPluginBase } from "./ServerPluginBase";
import { ServerConsole } from "./ServerConsole";

export class Server {

    public static readonly sdefaultSclPort : number = 42529;

    public static sectors : Array<ServerSector> = [];

    public static sectorIndex : number = 0;

    public static usePorts : Array<number> = [];

    public static init : ServerInit;

    public static httpListenBuffer : {[id: number] : { req: http.IncomingMessage, res: http.ServerResponse }} = {};

    public static httpServers : Array<http.Server> = [];

    public static processs : Array<ChildProcess> = [];

    public static processIndex : number = 0;

    public static scl : ServerConsole;

    /** begin  */
    public static async begin() {
        console.log("Server Begin");

        this.getInit();

        this.beginSCL();

        this.searchSector();

        await this.processStart();
        
        this.listenHttp();
    }        

    public static getInit() {
        const initPath = process.cwd() + "/sectors/init.json";
        let init : ServerInit = {};
        try {
            init = require(initPath);
        }catch(error){}

        if (!init.serverName) init.serverName = "Savatora";
        if (!init.process) init.process = 1;
        if (!init.thread) init.thread = 1;
        if (!init.sclPort) init.sclPort = this.sdefaultSclPort;
        this.init = init;
    }

    public static beginSCL() {
        this.scl = new ServerConsole(this);
        this.scl.beginSocket();
    }

    /** sector検索 */
    private static searchSector(){
        const sectorBasePath = process.cwd() + "/sectors";
        const list = fs.readdirSync(sectorBasePath);
        for (let n = 0 ; n < list.length ; n++) {
            const sectorPath = sectorBasePath + "/" + list[n];
            if (fs.statSync(sectorPath).isFile()) continue;
            this.requireServer(sectorPath);
        }
    }

    private static sectorTargetHostIndexs = {};

    /** server.json読込 */
    private static requireServer(sectorPath : string) {
        let server;
        try {
            server = require(sectorPath + "/server.json");
        } catch(error) {
            return;
        }
        if (!server.name) server.name = path.basename(sectorPath);

        // port number
        if (!server.port) server.port = [ 80 ];
        if (typeof server.port == "number") server.port = [ server.port ];

        // host
        if (!server.host) server.host = [ "*" ];
        if (typeof server.host == "string") server.host = [ server.host ];

        server.targetHost = [];
        for (let n = 0 ; n < server.port.length ; n++) {
            const port = server.port[n];
            if (this.usePorts.indexOf(port) === -1) this.usePorts.push(port);
            for (let n2 = 0 ; n2 < server.host.length ; n2++) {
                let targetHost = server.host[n2];
                if (port !== 80) targetHost += ":" + port;
                server.targetHost.push(targetHost);
            }
        }

        if (!server.plugins) server.plugins = [];
        if (typeof server.plugins == "string") server.plugins = [ server.plugins ];

        server.rootDir = sectorPath;
        server.index = this.sectorIndex++;        
        this.sectors.push(server);
        for(let n = 0 ; n < server.targetHost.length ; n++) {
            const sh_ = server.targetHost[n];
            this.sectorTargetHostIndexs[sh_] = this.sectors.length - 1;
        }
    }

    /** listen http */
    private static async listenHttp() {

        console.log("");
        console.log(
            " " + 
            "name".padEnd(20) + 
            "port".padEnd(15) + 
            "host".padEnd(20)
        );
        console.log("------------------------------------------------");
        
        for (let n = 0 ; n < this.sectors.length ; n++) {
            const sector = this.sectors[n];

            console.log(
                " " + 
                sector.name.padEnd(20) + 
                sector.port.join(",").padEnd(15) + 
                sector.host.join(",").padEnd(20)
            );

            sector.pluginsClass = [];
            
            for (let n2 = 0 ; n2 < sector.plugins.length ; n2++) {
                const pluginName = sector.plugins[n2];
                
                let plugin : ServerPluginBase;
                try {
                    const plugin_ = require(process.cwd() + "/node_modules/" + pluginName).ServerPlugin;
                    plugin = new plugin_();
                } catch(error) {
                    console.log(error);
                    continue;
                }
                await plugin.onBeginNative(sector);
                sector.pluginsClass.push(plugin);
            }
        }

        console.log("\nListen!");

        for(let n = 0 ; n < this.usePorts.length ; n++) {
            const port = this.usePorts[n];
            const h = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {

                const host = req.headers.host;

                let sectorIndex : number;
                if (this.sectorTargetHostIndexs[host] !== undefined){
                    sectorIndex = this.sectorTargetHostIndexs[host];
                }

                if (sectorIndex === undefined) {
                    res.statusCode = 404;
                    res.end();
                    return;
                }

                const decisionSector : ServerSector = this.sectors[sectorIndex];

                for(let n = 0 ; n < decisionSector.pluginsClass.length ; n++) {
                    const plugin = decisionSector.pluginsClass[n];
                    const status = await plugin.onListenNative(req, res, decisionSector);
                    if (!status) return;
                }

                this.threadSendListen(sectorIndex, req, res);
            }).listen(port);
            this.httpServers.push(h);
        }

        process.on("SIGINT", async ()=>{
            for(let n = 0 ; n < this.httpServers.length ; n++) {
                const h = this.httpServers[n];
                h.close();
            }
            for (let n = 0 ; n < this.sectors.length ; n++) {
                const sector = this.sectors[n];
                for (let n2 = 0 ; n2 < sector.pluginsClass.length ; n2++) {
                    const plugin = sector.pluginsClass[n2];
                    await plugin.onCloseNative(sector);
                }
            }
        });
    }

    private static processStart() {
        return new Promise((resolve) => {
            console.log("Total thread = " + (this.init.process * this.init.thread) + " (process = " + this.init.process + ", Worker = " + this.init.thread + ")");
            let processCheck = 0;
            for(let n = 0 ; n < this.init.process ; n++){
                const ip = fork(__dirname + "/process.js", [ n.toString() ]);
                this.processs.push(ip);
    
                ip.send(JSON.stringify({
                    mode: ThreadMessageMode.Start,
                    thread: this.init.thread,
                    sectors: this.sectors,
                    serverName: this.init.serverName,
                } as ThreadMessageDataOnStart));
    
                // intermediateProcess --> main listen event handle
                ip.on("message", (message) => {
                    const data = JSON.parse(message.toString());
                    if (!data) return;

                    if (data.mode == ThreadMessageMode.Start) {
                        processCheck++;
                        if (processCheck == this.init.process) resolve(true);
                    }
                    else if (data.mode == ThreadMessageMode.Close) {
                        console.log("...... Server Exit.");
                        process.exit();   
                    }
    
                    if (!data.id) return;

                    if (data.mode == ThreadMessageMode.Listen) {
                        this.onListenResponse(data);
                    }
                    else if (data.mode == ThreadMessageMode.Event) {
                        this.onListenOnEvent(data, ip);
                    }
                });
            }
        });
    }

    private static getProcess() : ChildProcess {
        const index = this.processIndex;
        this.processIndex++;
        if (this.processIndex >= this.init.process) this.processIndex = 0;
        return this.processs[index];
    }

    private static threadSendListen(sectorIndex : number, req: http.IncomingMessage, res: http.ServerResponse) {
        const id = Math.round(Math.random() * 10000000);
        this.httpListenBuffer[id] = { req, res };
        // @ts-ignore
        const data = {
            mode: ThreadMessageMode.Listen,
            id,
            req: {
                url: req.url,
                method: req.method,
                headers: req.headers,
                httpVersion: req.httpVersion,
                trailers: req.trailers,
                readable: req.readable,
                socket: {
                    localPort: req.socket.localPort,
                    localAddress: req.socket.localAddress,
                    // @ts-ignore
                    localFamily: req.socket.localFamily,
                    remoteAddress: req.socket.remoteAddress,
                    remoteFamily: req.socket.remoteFamily,
                    remotePort: req.socket.remotePort,
                },
            },
            sectorIndex,
        } as ThreadMessageDataOnListen;
        const ip = this.getProcess();
        ip.send(JSON.stringify(data));
    }

    private static onListenOnEvent(data: ThreadMessageDataOnEvent, ip: ChildProcess) {
        if (!this.httpListenBuffer[data.id]) return;
        const req = this.httpListenBuffer[data.id].req;
        req.on(data.event, (any) => {
            ip.send(JSON.stringify({
                mode: ThreadMessageMode.EventReceive,
                thread: data.thread,
                process: data.process,
                eventId: data.eventId,
                data: any,
            }));
        });
    }
    
    private static onListenResponse(data: ThreadMessageDataOnListen) {
        if (!this.httpListenBuffer[data.id]) return;
        const res = this.httpListenBuffer[data.id].res;
        
        if (data.res._headers) {
            const c = Object.keys(data.res._headers);
            for(let n = 0 ; n < c.length ; n++) {
                const name = c[n];
                const value = data.res._headers[name];
                res.setHeader(name, value);
            }
        }

        if (data.res._statusMessage) res.statusMessage = data.res._statusMessage;
        
        if (data.res._statusCode) res.statusCode = data.res._statusCode;
        
        if (data.res._write) {
            if (typeof data.res._write == "object") {
                if (data.res._write.type == "Buffer") data.res._write = new Uint8Array(data.res._write.data);
            }
            res.write(data.res._write);
        }

        res.end();
        delete this.httpListenBuffer[data.id];
    }
}