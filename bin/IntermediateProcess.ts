/**
 * MIT License
 * 
 * Copyright (c) 2025 Masato Nakatsuji
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Worker } from "worker_threads";
import { ThreadMessageMode } from "./ThreadMessageMode";
import { ThreadMessageDataOnStart } from "./ThreadMessageDataOnStart";
import { ThreadMessageDataOnListen } from "./ThreadMessageDataOnListen";
import { ThreadMessageDataOnEvent } from "./ThreadMessageDataOnEvent";

export class IntermediateProcess {

    private processNo : number;

    private workers : Array<Worker> = [];

    private workerIndex: number = 0;

    private workerLength: number;

    public constructor() {

        this.processNo = parseInt(process.argv[2]);

        // main --> intermediateProcess listen event handle
        process.on("message", (value)=>{
            const data = JSON.parse(value.toString());
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
        });

        
        process.on("SIGINT", async ()=>{
            this.onClose();
        });
    }

    private onStart(data: ThreadMessageDataOnStart) {
        this.workerLength = data.thread;
        let workerCheck = 0;
        for (let n = 0 ; n < data.thread ; n++) {
            const worker = new Worker(__dirname + "/worker.js", {
                argv: [ n , this.processNo ],
            });
            this.workers.push(worker);
            worker.postMessage(JSON.stringify(data));

            // intermediateProcess --> worker_threads listen event handle 
            worker.on("message", (message) => {
                const data2 = JSON.parse(message);
                if (!data2) return;

                if (data2.mode == ThreadMessageMode.Start) {
                    workerCheck++;                    
                    if (workerCheck == data.thread) {
                        process.send(JSON.stringify({
                            mode: ThreadMessageMode.Start,
                        }));
                    }
                }

                if (!data2.id) return;
                else if (data2.mode == ThreadMessageMode.Listen) {
                    this.onListenResponse(data2);
                }
                else if (data2.mode == ThreadMessageMode.Event) {
                    this.onListenOnEvent(data2, worker);
                }
            });
        }
    }

    private onListen(data: ThreadMessageDataOnListen) {
        const worker = this.getWorker();
        worker.postMessage(JSON.stringify(data));
    }

    private onListenResponse(data: ThreadMessageDataOnListen) {
        process.send(JSON.stringify(data));
    }

    private onListenOnEvent(data: ThreadMessageDataOnEvent, worker: Worker) {
        data.process = this.processNo;
        process.send(JSON.stringify(data));
    }

    private onEventReceive(data: ThreadMessageDataOnEvent) {
        const worker = this.workers[data.thread];
        worker.postMessage(JSON.stringify(data));
    }

    private onClose() {
        let closeCheck = 0;
        for(let n = 0 ; n < this.workers.length ; n++) {
            const worker = this.workers[n];
            worker.on("exit", ()=>{
                closeCheck++;
                if(closeCheck == this.workers.length) {
                    process.send(JSON.stringify({
                        mode: ThreadMessageMode.Close,
                    }));
                    process.exit();
                }
            });
            worker.postMessage(JSON.stringify({
                mode: ThreadMessageMode.Close,
            }));
        }
    }

    private getWorker() : Worker {
        const index = this.workerIndex;
        this.workerIndex++;
        if (this.workerIndex >= this.workerLength) this.workerIndex = 0;
        return this.workers[index];
    }
}
