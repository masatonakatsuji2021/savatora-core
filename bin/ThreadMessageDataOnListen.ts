import * as http from "http";
import { ThreadMessageMode } from "./ThreadMessageMode";
import { ThreadServerResponse } from "./ThreadServerResponse";

export interface ThreadMessageDataOnListen {

    mode: ThreadMessageMode.Listen,

    id: number,

    req: http.IncomingMessage,

    res: ThreadServerResponse,

    sectorIndex: number,
}
