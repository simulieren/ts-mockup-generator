#!/usr/bin/env node

import program from "commander";

import takeScreenshots from "./takeScreenshots";
import makeComposite from "./makeComposite";

program
	.version("0.1.0")
	.option("-D, --debug", "output extra debugging")
	.option("-S, --skip-images", "skip images")
	.option("-u, --url [type]", "URL of the site")
	.option("-d, --device [type]", "Select a device")
	.option("-f, --folder [type]", "Select a folder")
	.parse(process.argv);

(async () => {
	const { device, url, folder } = program;
	const hostname = new URL(url).hostname.split(".")[1];
	let screenshots = [];

	const devices = device || ["iPad Pro landscape", "iPhone X"];

	if (program.debug) console.log("Debug:", program.opts());

	if (program.skipImages) console.log("👉 Skipping images...");
	if (!program.skipImages) {
		for (const device of devices) {
      console.log(`👷‍♂️ Creating screenshots for: ${device}`);
			let newScreenshots = await takeScreenshots({
        device: device || "iPhone X",
        url: url,
        folder
      });
      
      // Merge array of screenshots
      screenshots = [...screenshots, ...newScreenshots];
      console.log(`👷‍♂️: ✅ Finished creating screenshots for: ${device}`);
		}
	}

	console.log(`👷‍♂️ Starting mockups...`);
	await makeComposite({ images: screenshots, hostname, folder});
})();
