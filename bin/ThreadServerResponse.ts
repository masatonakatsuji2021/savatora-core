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

import { parentPort } from "worker_threads";
import { ThreadServerRequest } from "./ThreadServerRequest";
import { ThreadMessageMode } from "./ThreadMessageMode";

export class ThreadServerResponse {

    public _req : ThreadServerRequest;

    private _id : number;

    public _headers = {};

    public _write;

    public _statusCode;

    public _writableFinished : boolean = false;

    public _statusMessage : string = "";

    public constructor(id : number) {
        this._id = id;
    }

    public setHeader(name: string, value: number | string) {
        this._headers[name] = value;
    }

    public write(content: string) {
        if (this._writableFinished) return;
        if (this._write) {
            this._write += content;
        }
        else {
            this._write = content;
        }
    }

    public set statusCode(statusCode : number) {
        this._statusCode = statusCode;
    }

    public get statusCode() : number {
        return this._statusCode;
    }

    public set statusMessage(message: string) {
        this._statusMessage = message;
    }

    public end() {
        this._writableFinished = true;

        if (this._req._timeoutTick) clearTimeout(this._req._timeoutTick); 

        parentPort.postMessage(JSON.stringify({
            mode: ThreadMessageMode.Listen,
            id: this._id,
            res: this,
        }));
    }

    public get writableFinished() : boolean {
        return this._writableFinished
    }
}