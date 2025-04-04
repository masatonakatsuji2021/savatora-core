import { ServerPluginBase } from "./ServerPluginBase";
import { ServerSectorJSON } from "./ServerSectorJSON";

export interface ServerSector extends ServerSectorJSON {

    rootDir: string,

    pluginsClass: Array<ServerPluginBase>,
}