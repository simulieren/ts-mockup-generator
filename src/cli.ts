#!/usr/bin/env node
import fs from "fs";
import { parse } from "url";
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
	.option(
		"-s, --scroll [type]",
		"Steps to move between screenshots. More steps will increase the scroll distance between screenshots."
	)
	.parse(process.argv);

(async () => {
	console.time("Total")
	const { device, url, folder = "mockups", scroll = 20 } = program;
	const hostname = parse(url).hostname;
	let screenshots: string[] = [];

	const devices = device || ["iPad Pro landscape", "iPhone X"];

	if (program.debug) console.log("Debug:", program.opts());

	if (program.skipImages) console.log("👉 Skipping images...");
	if (!program.skipImages) {
		console.time("Screenshots")
		const promises = await devices.map(device =>
			takeScreenshots({
				device: device || "iPhone X",
				url: url,
				folder,
				scroll
			})
		);

		screenshots = await Promise.all(promises);
		console.log(`👷‍♂️: ✅ Finished creating screenshots for: ${device}`);
		console.timeEnd("Screenshots")
	}

	console.time("Mockups")
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

	let promises = await screenshots.map(screenshot =>
		makeComposite({ image: screenshot, hostname, folder })
	);
	await Promise.all(promises);
	console.timeEnd("Mockups")
	console.log(`👷‍♂️: ✅ All images created: ${screenshots.length}`);
	console.timeEnd("Total")
})();
