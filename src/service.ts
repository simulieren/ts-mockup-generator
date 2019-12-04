import { workerData, parentPort } from "worker_threads";
import takeScreenshots from "./takeScreenshots";

// You can do any heavy stuff here, in a synchronous way
// without blocking the "main thread"

async (workerData) => {
	let newScreenshots = await takeScreenshots({
		device: device || "iPhone X",
		url: url || 'https://www.google.com/',
		folder: folder || "mockups",
		scroll: scroll || 20
	});
	parentPort.postMessage({ screenshots: newScreenshots });
};
