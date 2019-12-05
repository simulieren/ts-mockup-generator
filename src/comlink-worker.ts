import { parentPort, threadId } from "worker_threads";
import * as Comlink from "comlink";
import nodeEndpoint from "comlink/dist/umd/node-adapter";

import makeComposite from "./makeComposite"

const api = {
	makeComposite
};

Comlink.expose(api, nodeEndpoint(parentPort));
