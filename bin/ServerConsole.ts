import * as net from "net";
import { Server } from "./Server";

export class ServerConsole {

    private context: typeof Server;

    public constructor(context: typeof Server) {
        this.context = context;
    }

    public beginSocket(){
        net.createServer((socket : net.Socket) => {
            console.log("socket start");

            socket.on("data", (d_: Buffer) => {
                const data = d_.toString();

                if (data == "end") {
                    socket.end();
                    return;
                }

                console.log(data);

            });
            socket.on("error", (error)=>{});

        }).listen(this.context.init.sclPort);
    }
}