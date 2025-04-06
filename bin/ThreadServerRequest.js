"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadServerRequest = void 0;
const worker_threads_1 = require("worker_threads");
const ThreadMessageMode_1 = require("./ThreadMessageMode");
const ThreadMessage_1 = require("./ThreadMessage");
class ThreadServerRequest {
    constructor(data, context) {
        this._threadNo = context.threadNo;
        this._id = data.id;
        this._req = data.req;
        this._processNo = context.processNo;
    }
    get url() {
        return this._req.url;
    }
    get method() {
        return this._req.method;
    }
    get headers() {
        return this._req.headers;
    }
    get httpVersion() {
        return this._req.httpVersion;
    }
    get trailers() {
        return this._req.trailers;
    }
    get readable() {
        return this._req.readable;
    }
    get socket() {
        return this._req.socket;
    }
    setTimeout(msecs, callback) {
        this._timeoutTick = setTimeout(() => {
            callback();
        }, msecs);
        return this;
    }
    on(event, callback) {
        const eventId = Math.round(Math.random() * 10000000);
        worker_threads_1.parentPort.postMessage(JSON.stringify({
            mode: ThreadMessageMode_1.ThreadMessageMode.Event,
            event,
            eventId,
            thread: this._threadNo,
            process: this._processNo,
            id: this._id,
        }));
        ThreadMessage_1.ThreadMessage.onEventBuffer[eventId] = callback;
        return this;
    }
}
exports.ThreadServerRequest = ThreadServerRequest;
