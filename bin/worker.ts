import { isMainThread } from "worker_threads";
import { ThreadMessage } from "./ThreadMessage";

if (!isMainThread) new ThreadMessage();
