"use strict";
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
