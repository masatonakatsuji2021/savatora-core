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
exports.ThreadMessage = void 0;
const ThreadMessageMode_1 = require("./ThreadMessageMode");
const ThreadServerRequest_1 = require("./ThreadServerRequest");
const ThreadServerResponse_1 = require("./ThreadServerResponse");
const worker_threads_1 = require("worker_threads");
class ThreadMessage {
    constructor() {
        this.sectors = [];
        this.threadNo = parseInt(process.argv[2]);
        this.processNo = parseInt(process.argv[3]);
        //        console.log(" * Worker PID = " + process.pid.toString().padStart(5) + ", NO = " + this.threadNo.toString());
        worker_threads_1.parentPort.on("message", (message) => {
            let data = JSON.parse(message);
            if (!data)
                return;
            if (data.mode == ThreadMessageMode_1.ThreadMessageMode.Start) {
                this.onStart(data);
            }
            else if (data.mode == ThreadMessageMode_1.ThreadMessageMode.Listen) {
                this.onListen(data);
            }
            else if (data.mode == ThreadMessageMode_1.ThreadMessageMode.EventReceive) {
                this.onEventReceive(data);
            }
            else if (data.mode == ThreadMessageMode_1.ThreadMessageMode.Close) {
                this.onClose();
            }
        });
    }
    onStart(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.serverName = data.serverName;
            this.sectors = data.sectors;
            for (let n = 0; n < this.sectors.length; n++) {
                const sector = this.sectors[n];
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
                    yield plugin.onBegin(sector, this.threadNo, this.processNo);
                    sector.pluginsClass.push(plugin);
                }
            }
            worker_threads_1.parentPort.postMessage(JSON.stringify({
                mode: ThreadMessageMode_1.ThreadMessageMode.Start,
            }));
        });
    }
    onListen(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = new ThreadServerResponse_1.ThreadServerResponse(data.id);
            res.setHeader("server", this.serverName);
            const decisionSector = this.sectors[data.sectorIndex];
            if (decisionSector.serverName)
                res.setHeader("server", decisionSector.serverName);
            // sector plugins...
            for (let n = 0; n < decisionSector.pluginsClass.length; n++) {
                const plugin = decisionSector.pluginsClass[n];
                try {
                    // @ts-ignore
                    const req = new ThreadServerRequest_1.ThreadServerRequest(data, this);
                    yield plugin.onListen(req, res, decisionSector, this.threadNo);
                }
                catch (error) {
                    console.error(error);
                }
                if (res.writableFinished)
                    return;
            }
            if (!res.writableFinished)
                res.end();
        });
    }
    onClose() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let n = 0; n < this.sectors.length; n++) {
                const sector = this.sectors[n];
                for (let n2 = 0; n2 < sector.pluginsClass.length; n2++) {
                    const plugin = sector.pluginsClass[n2];
                    yield plugin.onClose(sector, this.threadNo);
                }
            }
            worker_threads_1.parentPort.close();
        });
    }
    onEventReceive(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ThreadMessage.onEventBuffer[data.eventId])
                return;
            ThreadMessage.onEventBuffer[data.eventId](data.data);
            delete ThreadMessage.onEventBuffer[data.eventId];
        });
    }
}
exports.ThreadMessage = ThreadMessage;
ThreadMessage.onEventBuffer = {};
