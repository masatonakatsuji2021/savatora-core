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
exports.ServerPluginBase = void 0;
class ServerPluginBase {
    /**
     * ***onBeginNative*** :
     * @param {ServerSector} sector Server Sector
     */
    onBeginNative(sector) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * ***onCloseNative*** :
     * @param {ServerSector} sector Server Sector
     */
    onCloseNative(sector) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * ***onListenNative*** :
     * @param {IncomingMessage} req IncomingMessage
     * @param {ServerResponse} res ServerResponse
     * @param {ServerSector} sector Server Sector
     * @returns {Promise<boolean>}
     */
    onListenNative(req, res, sector) {
        return __awaiter(this, void 0, void 0, function* () { return true; });
    }
    /**
     * ***onBegin*** :
     * @param {ServerSector} sector Server Sector
     * @param {number} processNo process no
     * @param {number} threadNo thread No
     */
    onBegin(sector, threadNo, processNo) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * ***onClose*** :
     */
    onClose(sector, threadNo) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * ***onLiten*** :
     * @param {ThreadServerRequest} req
     * @param {ThreadServerResponse} res
     * @param {ServerSector} sector Server Sector
     * @param {number} threadNo thread no
     */
    onListen(req, res, sector, threadNo) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.ServerPluginBase = ServerPluginBase;
