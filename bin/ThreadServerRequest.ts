import * as http from "http";
import { parentPort } from "worker_threads";
import { ThreadMessageDataOnListen } from "./ThreadMessageDataOnListen";
import { ThreadMessageMode } from "./ThreadMessageMode";
import { ThreadMessageDataOnEvent } from "./ThreadMessageDataOnEvent";
import { ThreadMessage } from "./ThreadMessage";

export class ThreadServerRequest {

    private _threadNo : number;

    private _processNo : number;

    private _id : number;

    private _req : http.IncomingMessage;

    public constructor(data : ThreadMessageDataOnListen, context: ThreadMessage) {
        this._threadNo = context.threadNo;
        this._id = data.id;
        this._req = data.req;
        this._processNo = context.processNo;
    }

    public get url(): string {
        return this._req.url;
    }

    public get method() : string {
        return this._req.method;
    }

    public get headers() : http.IncomingHttpHeaders {
        return this._req.headers;
    }

    public get httpVersion() {
        return this._req.httpVersion;
    }

    public get trailers() {
        return this._req.trailers;
    }

    public get readable() {
        return this._req.readable;
    }

    public get socket() {
        return this._req.socket;
    }
    
    public on(event: "close", listener: () => void): this;
    public on(event: "data", listener: (chunk: any) => void): this;
    public on(event: "end", listener: () => void): this;
    public on(event: "error", listener: (err: Error) => void): this;
    public on(event: "pause", listener: () => void): this;
    public on(event: "readable", listener: () => void): this;
    public on(event: "resume", listener: () => void): this;
    public on(event: string | symbol, listener: (...args: any[]) => void): this;

    public on(event, callback) {
        const eventId = Math.round(Math.random() * 10000000)
        parentPort.postMessage(JSON.stringify({
            mode: ThreadMessageMode.Event,
            event,
            eventId,
            thread: this._threadNo,
            process: this._processNo,
            id: this._id,
        } as ThreadMessageDataOnEvent));
        ThreadMessage.onEventBuffer[eventId] = callback;
        return this;
    }
}