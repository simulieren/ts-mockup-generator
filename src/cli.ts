#!/usr/bin/env node
import fs from "fs";
import { join } from "path";
import { parse } from "url";
import program from "commander";
import { Worker } from "worker_threads";
import * as Comlink from "comlink";
import nodeEndpoint from "comlink/dist/umd/node-adapter";

import si from "systeminformation";
import chunk from "lodash.chunk";

import takeScreenshots from "./takeScreenshots";

program
	.version("0.1.0")
	.option("-D, --debug", "output extra debugging")
	.option("-S, --skip-images", "skip images")
	.option("-u, --url [type]", "URL of the site")
	.option("-w, --wait [type]", "Wait time in ms between each screenshot")
	.option("-d, --device [type]", "Select a device")
	.option("-f, --folder [type]", "Select a folder")
	.option(
		"-s, --scroll [type]",
		"Steps to move between screenshots. More steps will increase the scroll distance between screenshots."
	)
	.parse(process.argv);

async function makeCompositeWithWorker(array: string[], hostname, folder) {
	console.time("Mockups");
	console.log(`👷‍♂️ This process is pid ${process.pid}`);
	const { cores } = await si.cpu();
	const chunksize = array.length / (cores - 2);

	const chunks = chunk(array, chunksize);

	chunks.map(async chunk => {
		const worker = new Worker(join(__dirname, "./comlink-worker.js"), {
			workerData: {
				path: "./comlink-worker.ts"
			}
		});

		//@ts-ignore
		const api = Comlink.wrap(nodeEndpoint(worker));
		let promises = chunk.map(screenshot =>
			//@ts-ignore
			api.makeComposite({ image: screenshot, hostname, folder })
		);
		Promise.all(promises).then(() => {
			console.log(`👷‍♂️: ✅ All images created: ${array.length}`);
		})
		return api[Comlink.releaseProxy]();
	});
	console.timeEnd("Mockups");
	console.timeEnd("Total");
	
}

(async () => {
	console.time("Total");
	const { device, url, folder = "mockups", scroll = 20, wait = 0 } = program;
	const hostname = parse(url).hostname;
	let screenshots: string[] = [];

	const devices = device || ["iPad Pro landscape", "iPhone X"];
	if (program.debug) console.log("Debug:", program.opts());

	if (program.skipImages) console.log("👉 Skipping images...");
	if (!program.skipImages) {
		console.time("Screenshots");
		const promises = await devices.map(device =>
			takeScreenshots({
				device: device || "iPhone X",
				url: url,
				folder,
				scroll,
				wait
			})
		);

		screenshots = await Promise.all(promises);
		console.log(`👷‍♂️: ✅ Finished creating screenshots for: ${device}`);
		console.timeEnd("Screenshots");
	}

	console.log(`👷‍♂️ Starting mockups...`);
	screenshots = fs.readdirSync(`${folder}/${hostname}`);
	console.log(`🖼 Screenshots: ${screenshots.length}`);

	if (screenshots.includes("mockups")) {
		console.log(`Removing "mockups" from screenshots array`);
		screenshots = screenshots.filter(i => i !== "mockups");
	}

	fs.stat(folder, function(err) {
		if (!err) {
			console.log(`🖼 Folder exists: ${folder}`);
		} else if (err.code === "ENOENT") {
			if (fs.existsSync(folder)) return;
			fs.mkdirSync(folder);
			console.log(`🆕 : 📁 New folder: ${folder}`);
		}
	});

	fs.stat(`${folder}/${hostname}/mockups`, function(err) {
		if (!err) {
			console.log(
				`🖼 Mockups will be created at: ${folder}/${hostname}/mockups`
			);
		} else if (err.code === "ENOENT") {
			if (fs.existsSync(`${folder}/${hostname}/mockups`)) return;
			fs.mkdirSync(`${folder}/${hostname}/mockups`);
			console.log(
				`🆕 : 📁 New folder for mockups created: ${folder}/${hostname}/mockups`
			);
		}
	});

	await makeCompositeWithWorker(screenshots, hostname, folder);
})();
