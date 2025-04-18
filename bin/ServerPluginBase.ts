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

import { IncomingMessage, ServerResponse } from "http";
import { ServerSector } from "./ServerSector";
import { ThreadServerRequest } from "./ThreadServerRequest";
import { ThreadServerResponse } from "./ThreadServerResponse";

export class ServerPluginBase {

    /**
     * ***onBeginNative*** : 
     * @param {ServerSector} sector Server Sector
     */
    public async onBeginNative(sector: ServerSector) {}

    /**
     * ***onCloseNative*** : 
     * @param {ServerSector} sector Server Sector
     */
    public async onCloseNative(sector: ServerSector) {}

    /**
     * ***onListenNative*** : 
     * @param {IncomingMessage} req IncomingMessage
     * @param {ServerResponse} res ServerResponse
     * @param {ServerSector} sector Server Sector
     * @returns {Promise<boolean>}
     */
    public async onListenNative(req : IncomingMessage, res : ServerResponse, sector: ServerSector) : Promise<boolean> { return true; }

    /**
     * ***onBegin*** : 
     * @param {ServerSector} sector Server Sector
     * @param {number} processNo process no
     * @param {number} threadNo thread No
     */
    public async onBegin(sector: ServerSector, threadNo: number, processNo: number){}

    /**
     * ***onClose*** : 
     */
    public async onClose(sector: ServerSector, threadNo : number){}

    /**
     * ***onLiten*** : 
     * @param {ThreadServerRequest} req 
     * @param {ThreadServerResponse} res 
     * @param {ServerSector} sector Server Sector
     * @param {number} threadNo thread no
     */
    public async onListen(req : ThreadServerRequest, res : ThreadServerResponse, sector: ServerSector, threadNo : number){}
}
