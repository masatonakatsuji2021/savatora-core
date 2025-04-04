"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const http = require("http");
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
const ThreadMessageMode_1 = require("./ThreadMessageMode");
const ServerConsole_1 = require("./ServerConsole");
class Server {
    /** begin  */
    static begin() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Server Begin");
            this.getInit();
            this.beginSCL();
            this.searchSector();
            yield this.processStart();
            this.listenHttp();
        });
    }
    static getInit() {
        const initPath = process.cwd() + "/sectors/init.json";
        let init = {};
        try {
            init = require(initPath);
        }
        catch (error) { }
        if (!init.serverName)
            init.serverName = "Savatora";
        if (!init.process)
            init.process = 1;
        if (!init.thread)
            init.thread = 1;
        if (!init.sclPort)
            init.sclPort = this.sdefaultSclPort;
        this.init = init;
    }
    static beginSCL() {
        this.scl = new ServerConsole_1.ServerConsole(this);
        this.scl.beginSocket();
    }
    /** sector検索 */
    static searchSector() {
        const sectorBasePath = process.cwd() + "/sectors";
        const list = fs.readdirSync(sectorBasePath);
        for (let n = 0; n < list.length; n++) {
            const sectorPath = sectorBasePath + "/" + list[n];
            if (fs.statSync(sectorPath).isFile())
                continue;
            this.requireServer(sectorPath);
        }
    }
    /** server.json読込 */
    static requireServer(sectorPath) {
        let server;
        try {
            server = require(sectorPath + "/server.json");
        }
        catch (error) {
            return;
        }
        if (!server.name)
            server.name = path.basename(sectorPath);
        // port number
        if (!server.port)
            server.port = [80];
        if (typeof server.port == "number")
            server.port = [server.port];
        // host
        if (!server.host)
            server.host = ["*"];
        if (typeof server.host == "string")
            server.host = [server.host];
        server.targetHost = [];
        for (let n = 0; n < server.port.length; n++) {
            const port = server.port[n];
            if (this.usePorts.indexOf(port) === -1)
                this.usePorts.push(port);
            for (let n2 = 0; n2 < server.host.length; n2++) {
                let targetHost = server.host[n2];
                if (port !== 80)
                    targetHost += ":" + port;
                server.targetHost.push(targetHost);
            }
        }
        if (!server.plugins)
            server.plugins = [];
        if (typeof server.plugins == "string")
            server.plugins = [server.plugins];
        server.rootDir = sectorPath;
        server.index = this.sectorIndex++;
        this.sectors.push(server);
        for (let n = 0; n < server.targetHost.length; n++) {
            const sh_ = server.targetHost[n];
            this.sectorTargetHostIndexs[sh_] = this.sectors.length - 1;
        }
    }
    /** listen http */
    static listenHttp() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("");
            console.log(" " +
                "name".padEnd(20) +
                "port".padEnd(15) +
                "host".padEnd(20));
            console.log("------------------------------------------------");
            for (let n = 0; n < this.sectors.length; n++) {
                const sector = this.sectors[n];
                console.log(" " +
                    sector.name.padEnd(20) +
                    sector.port.join(",").padEnd(15) +
                    sector.host.join(",").padEnd(20));
                sector.pluginsClass = [];
                for (let n2 = 0; n2 < sector.plugins.length; n2++) {
                    const pluginName = sector.plugins[n2];
                    let plugin;
                    try {
                        const plugin_ = require(process.cwd() + "/node_modules/" + pluginName).ServerPlugin;
                        plugin = new plugin_();
                    }
                    catch (error) {
                        console.log(error);
                        continue;
                    }
                    yield plugin.onBeginNative(sector);
                    sector.pluginsClass.push(plugin);
                }
            }
            console.log("\nListen!");
            for (let n = 0; n < this.usePorts.length; n++) {
                const port = this.usePorts[n];
                const h = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
                    const host = req.headers.host;
                    let sectorIndex;
                    if (this.sectorTargetHostIndexs[host] !== undefined) {
                        sectorIndex = this.sectorTargetHostIndexs[host];
                    }
                    if (sectorIndex === undefined) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    const decisionSector = this.sectors[sectorIndex];
                    for (let n = 0; n < decisionSector.pluginsClass.length; n++) {
                        const plugin = decisionSector.pluginsClass[n];
                        const status = yield plugin.onListenNative(req, res, decisionSector);
                        if (!status)
                            return;
                    }
                    this.threadSendListen(sectorIndex, req, res);
                })).listen(port);
                this.httpServers.push(h);
            }
            process.on("SIGINT", () => __awaiter(this, void 0, void 0, function* () {
                for (let n = 0; n < this.httpServers.length; n++) {
                    const h = this.httpServers[n];
                    h.close();
                }
                for (let n = 0; n < this.sectors.length; n++) {
                    const sector = this.sectors[n];
                    for (let n2 = 0; n2 < sector.pluginsClass.length; n2++) {
                        const plugin = sector.pluginsClass[n2];
                        yield plugin.onCloseNative(sector);
                    }
                }
            }));
        });
    }
    static processStart() {
        return new Promise((resolve) => {
            console.log("Total thread = " + (this.init.process * this.init.thread) + " (process = " + this.init.process + ", Worker = " + this.init.thread + ")");
            let processCheck = 0;
            for (let n = 0; n < this.init.process; n++) {
                const ip = (0, child_process_1.fork)(__dirname + "/process.js", [n.toString()]);
                this.processs.push(ip);
                ip.send(JSON.stringify({
                    mode: ThreadMessageMode_1.ThreadMessageMode.Start,
                    thread: this.init.thread,
                    sectors: this.sectors,
                    serverName: this.init.serverName,
                }));
                // intermediateProcess --> main listen event handle
                ip.on("message", (message) => {
                    const data = JSON.parse(message.toString());
                    if (!data)
                        return;
                    if (data.mode == ThreadMessageMode_1.ThreadMessageMode.Start) {
                        processCheck++;
                        if (processCheck == this.init.process)
                            resolve(true);
                    }
                    else if (data.mode == ThreadMessageMode_1.ThreadMessageMode.Close) {
                        console.log("...... Server Exit.");
                        process.exit();
                    }
                    if (!data.id)
                        return;
                    if (data.mode == ThreadMessageMode_1.ThreadMessageMode.Listen) {
                        this.onListenResponse(data);
                    }
                    else if (data.mode == ThreadMessageMode_1.ThreadMessageMode.Event) {
                        this.onListenOnEvent(data, ip);
                    }
                });
            }
        });
    }
    static getProcess() {
        const index = this.processIndex;
        this.processIndex++;
        if (this.processIndex >= this.init.process)
            this.processIndex = 0;
        return this.processs[index];
    }
    static threadSendListen(sectorIndex, req, res) {
        const id = Math.round(Math.random() * 10000000);
        this.httpListenBuffer[id] = { req, res };
        // @ts-ignore
        const data = {
            mode: ThreadMessageMode_1.ThreadMessageMode.Listen,
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
        };
        const ip = this.getProcess();
        ip.send(JSON.stringify(data));
    }
    static onListenOnEvent(data, ip) {
        if (!this.httpListenBuffer[data.id])
            return;
        const req = this.httpListenBuffer[data.id].req;
        req.on(data.event, (any) => {
            ip.send(JSON.stringify({
                mode: ThreadMessageMode_1.ThreadMessageMode.EventReceive,
                thread: data.thread,
                process: data.process,
                eventId: data.eventId,
                data: any,
            }));
        });
    }
    static onListenResponse(data) {
        if (!this.httpListenBuffer[data.id])
            return;
        const res = this.httpListenBuffer[data.id].res;
        if (data.res._headers) {
            const c = Object.keys(data.res._headers);
            for (let n = 0; n < c.length; n++) {
                const name = c[n];
                const value = data.res._headers[name];
                res.setHeader(name, value);
            }
        }
        if (data.res._statusMessage)
            res.statusMessage = data.res._statusMessage;
        if (data.res._statusCode)
            res.statusCode = data.res._statusCode;
        if (data.res._write) {
            if (typeof data.res._write == "object") {
                if (data.res._write.type == "Buffer")
                    data.res._write = new Uint8Array(data.res._write.data);
            }
            res.write(data.res._write);
        }
        res.end();
        delete this.httpListenBuffer[data.id];
    }
}
exports.Server = Server;
Server.sdefaultSclPort = 42529;
Server.sectors = [];
Server.sectorIndex = 0;
Server.usePorts = [];
Server.httpListenBuffer = {};
Server.httpServers = [];
Server.processs = [];
Server.processIndex = 0;
Server.sectorTargetHostIndexs = {};
