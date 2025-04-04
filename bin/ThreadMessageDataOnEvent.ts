import { ThreadMessageMode } from "./ThreadMessageMode";

export interface ThreadMessageDataOnEvent {

    mode: ThreadMessageMode.Event,

    event: string,

    id: number,

    eventId: number,

    process: number,

    thread: number,
    
    data: any,
}
