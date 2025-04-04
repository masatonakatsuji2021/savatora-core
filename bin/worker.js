"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const ThreadMessage_1 = require("./ThreadMessage");
if (!worker_threads_1.isMainThread)
    new ThreadMessage_1.ThreadMessage();
