import { parentPort } from "worker_threads";
import { ThreadMessageMode } from "./ThreadMessageMode";

export class ThreadServerResponse {

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