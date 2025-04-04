import { ServerSector } from "./ServerSector";
import { ThreadMessageMode } from "./ThreadMessageMode";

export interface ThreadMessageDataOnStart {

    mode: ThreadMessageMode.Start,

    thread?: number,

    serverName: string,

    sectors: Array<ServerSector>,
}