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
