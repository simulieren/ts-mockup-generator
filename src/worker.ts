import { parentPort, workerData } from "worker_threads";
import takeScreenshots from "./takeScreenshots";

// You can do any heavy stuff here, in a synchronous way
// without blocking the "main thread"

/* async ({ device, url, folder, scroll}: any) => {
    console.log("TCL: url", url)
    
	let newScreenshots = await takeScreenshots({
		device: device || "iPhone X",
		url: url || 'https://www.google.com/',
		folder: folder || "mockups",
		scroll: scroll || 20
    });

    return newScreenshots
    
}) */

parentPort.postMessage(async x => {
	console.log("TCL: x", x);
	takeScreenshots({
		device: workerData.options.device || "iPhone X",
		url: workerData.options.url || "https://www.google.com/",
		folder: workerData.options.folder || "mockups",
		scroll: workerData.options.scroll || 20
	});
});

/* function factorial(n: number, ...rest): number {
    console.log("TCL: rest", rest)
  if(n === 1 || n === 0){
    return 1;
  }
  return factorial(n - 1) * n;
}
 
parentPort.postMessage(
  factorial(workerData.value)

); */
