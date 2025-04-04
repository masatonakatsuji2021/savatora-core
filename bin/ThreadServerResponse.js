"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadServerResponse = void 0;
const worker_threads_1 = require("worker_threads");
const ThreadMessageMode_1 = require("./ThreadMessageMode");
class ThreadServerResponse {
    constructor(id) {
        this._headers = {};
        this._writableFinished = false;
        this._statusMessage = "";
        this._id = id;
    }
    setHeader(name, value) {
        this._headers[name] = value;
    }
    write(content) {
        if (this._writableFinished)
            return;
        if (this._write) {
            this._write += content;
        }
        else {
            this._write = content;
        }
    }
    set statusCode(statusCode) {
        this._statusCode = statusCode;
    }
    get statusCode() {
        return this._statusCode;
    }
    set statusMessage(message) {
        this._statusMessage = message;
    }
    end() {
        this._writableFinished = true;
        worker_threads_1.parentPort.postMessage(JSON.stringify({
            mode: ThreadMessageMode_1.ThreadMessageMode.Listen,
            id: this._id,
            res: this,
        }));
    }
    get writableFinished() {
        return this._writableFinished;
    }
}
exports.ThreadServerResponse = ThreadServerResponse;
