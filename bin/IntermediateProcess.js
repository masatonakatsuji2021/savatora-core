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
exports.IntermediateProcess = void 0;
const worker_threads_1 = require("worker_threads");
const ThreadMessageMode_1 = require("./ThreadMessageMode");
class IntermediateProcess {
    constructor() {
        this.workers = [];
        this.workerIndex = 0;
        this.processNo = parseInt(process.argv[2]);
        // main --> intermediateProcess listen event handle
        process.on("message", (value) => {
            const data = JSON.parse(value.toString());
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
        });
        process.on("SIGINT", () => __awaiter(this, void 0, void 0, function* () {
            this.onClose();
        }));
    }
    onStart(data) {
        this.workerLength = data.thread;
        let workerCheck = 0;
        for (let n = 0; n < data.thread; n++) {
            const worker = new worker_threads_1.Worker(__dirname + "/worker.js", {
                argv: [n, this.processNo],
            });
            this.workers.push(worker);
            worker.postMessage(JSON.stringify(data));
            // intermediateProcess --> worker_threads listen event handle 
            worker.on("message", (message) => {
                const data2 = JSON.parse(message);
                if (!data2)
                    return;
                if (data2.mode == ThreadMessageMode_1.ThreadMessageMode.Start) {
                    workerCheck++;
                    if (workerCheck == data.thread) {
                        process.send(JSON.stringify({
                            mode: ThreadMessageMode_1.ThreadMessageMode.Start,
                        }));
                    }
                }
                if (!data2.id)
                    return;
                else if (data2.mode == ThreadMessageMode_1.ThreadMessageMode.Listen) {
                    this.onListenResponse(data2);
                }
                else if (data2.mode == ThreadMessageMode_1.ThreadMessageMode.Event) {
                    this.onListenOnEvent(data2, worker);
                }
            });
        }
    }
    onListen(data) {
        const worker = this.getWorker();
        worker.postMessage(JSON.stringify(data));
    }
    onListenResponse(data) {
        process.send(JSON.stringify(data));
    }
    onListenOnEvent(data, worker) {
        data.process = this.processNo;
        process.send(JSON.stringify(data));
    }
    onEventReceive(data) {
        const worker = this.workers[data.thread];
        worker.postMessage(JSON.stringify(data));
    }
    onClose() {
        let closeCheck = 0;
        for (let n = 0; n < this.workers.length; n++) {
            const worker = this.workers[n];
            worker.on("exit", () => {
                closeCheck++;
                if (closeCheck == this.workers.length) {
                    process.send(JSON.stringify({
                        mode: ThreadMessageMode_1.ThreadMessageMode.Close,
                    }));
                    process.exit();
                }
            });
            worker.postMessage(JSON.stringify({
                mode: ThreadMessageMode_1.ThreadMessageMode.Close,
            }));
        }
    }
    getWorker() {
        const index = this.workerIndex;
        this.workerIndex++;
        if (this.workerIndex >= this.workerLength)
            this.workerIndex = 0;
        return this.workers[index];
    }
}
exports.IntermediateProcess = IntermediateProcess;
