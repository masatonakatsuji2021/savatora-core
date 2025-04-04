"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadMessageMode = void 0;
var ThreadMessageMode;
(function (ThreadMessageMode) {
    ThreadMessageMode[ThreadMessageMode["Start"] = 0] = "Start";
    ThreadMessageMode[ThreadMessageMode["Listen"] = 1] = "Listen";
    ThreadMessageMode[ThreadMessageMode["ListenFromThread"] = 2] = "ListenFromThread";
    ThreadMessageMode[ThreadMessageMode["Event"] = 3] = "Event";
    ThreadMessageMode[ThreadMessageMode["EventReceive"] = 4] = "EventReceive";
    ThreadMessageMode[ThreadMessageMode["Close"] = 5] = "Close";
})(ThreadMessageMode || (exports.ThreadMessageMode = ThreadMessageMode = {}));
