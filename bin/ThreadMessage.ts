import { ServerPluginBase } from "./ServerPluginBase";
import { ServerSector } from "./ServerSector";
import { ThreadMessageDataOnEvent } from "./ThreadMessageDataOnEvent";
import { ThreadMessageDataOnListen } from "./ThreadMessageDataOnListen";
import { ThreadMessageDataOnStart } from "./ThreadMessageDataOnStart";
import { ThreadMessageMode } from "./ThreadMessageMode";
import { ThreadServerRequest } from "./ThreadServerRequest";
import { ThreadServerResponse } from "./ThreadServerResponse";
import { parentPort } from "worker_threads";

export class ThreadMessage {

    public threadNo : number;

    public processNo : number;

    private sectors : Array<ServerSector> = [];

    private serverName : string;

    public static onEventBuffer = {};

    public constructor() {

        this.threadNo = parseInt(process.argv[2]);
        this.processNo = parseInt(process.argv[3]);

//        console.log(" * Worker PID = " + process.pid.toString().padStart(5) + ", NO = " + this.threadNo.toString());

        parentPort.on("message", (message) => {
            let data = JSON.parse(message);
            if (!data) return;
            if (data.mode == ThreadMessageMode.Start) {
                this.onStart(data);
            }
            else if (data.mode == ThreadMessageMode.Listen) {
                this.onListen(data);
            }
            else if (data.mode == ThreadMessageMode.EventReceive) {
                this.onEventReceive(data);
            }
            else if (data.mode == ThreadMessageMode.Close) {
                this.onClose();    
            }
        });
    }

    private async onStart(data: ThreadMessageDataOnStart) {

        this.serverName = data.serverName;

        this.sectors = data.sectors;
        for(let n = 0 ; n < this.sectors.length ; n++) {
            const sector = this.sectors[n];
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
                await plugin.onBegin(sector, this.threadNo, this.processNo);
                sector.pluginsClass.push(plugin);
            }
        }
        parentPort.postMessage(JSON.stringify({
            mode: ThreadMessageMode.Start,
        }));
    }

    private async onListen(data: ThreadMessageDataOnListen) {

        const res = new ThreadServerResponse(data.id);

        res.setHeader("server", this.serverName);

        const decisionSector: ServerSector = this.sectors[data.sectorIndex];
   
        if (decisionSector.serverName) res.setHeader("server", decisionSector.serverName);

        // sector plugins...
        for(let n = 0 ; n < decisionSector.pluginsClass.length ; n++) {

            const plugin = decisionSector.pluginsClass[n];

            try {
                // @ts-ignore
                const req : ThreadServerRequest = new ThreadServerRequest(data, this);
                await plugin.onListen(req, res, decisionSector, this.threadNo);
            } catch (error) {
                console.error(error);
            }

            if (res.writableFinished) return;
        }

        if (!res.writableFinished) res.end();
    }

    private async onClose() {
        for (let n = 0 ; n < this.sectors.length ; n++) {
            const sector = this.sectors[n];
            for (let n2 = 0 ; n2 < sector.pluginsClass.length ; n2++) {
                const plugin = sector.pluginsClass[n2];
                await plugin.onClose(sector, this.threadNo);
            }
        }
        parentPort.close();
    }

    private async onEventReceive(data: ThreadMessageDataOnEvent) {
        if (!ThreadMessage.onEventBuffer[data.eventId]) return;
        ThreadMessage.onEventBuffer[data.eventId](data.data);
        delete ThreadMessage.onEventBuffer[data.eventId];
    }
}