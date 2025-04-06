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
        if (this._req._timeoutTick)
            clearTimeout(this._req._timeoutTick);
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
