import { parentPort } from "worker_threads";
import * as Comlink from "comlink"
import nodeEndpoint from "comlink/dist/umd/node-adapter";

const api = {
  doMath() {
    return 4;
  }
};
Comlink.expose(api, nodeEndpoint(parentPort));