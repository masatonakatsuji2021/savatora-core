"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerConsole = void 0;
const net = require("net");
class ServerConsole {
    constructor(context) {
        this.context = context;
    }
    beginSocket() {
        net.createServer((socket) => {
            console.log("socket start");
            socket.on("data", (d_) => {
                const data = d_.toString();
                if (data == "end") {
                    socket.end();
                    return;
                }
                console.log(data);
            });
            socket.on("error", (error) => { });
        }).listen(this.context.init.sclPort);
    }
}
exports.ServerConsole = ServerConsole;
