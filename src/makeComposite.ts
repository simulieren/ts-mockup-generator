import Jimp from "jimp";
import path from "path";
import { threadId } from "worker_threads";


const makeComposite = async ({
	image,
	hostname,
	folder
}: {
	image: string;
	hostname?: string;
	folder?: string;
}) => {
	console.log(`👷‍♂️ Start working on ${image} ...`);
	console.log(`👷‍♂️ This process is in thread: ${threadId}`);

	let newFile;
	const filePath = `${folder}/${hostname}/${image}`;

	const screenshot = await Jimp.read(filePath);

	if (image.includes("iphone")) {
		const iPhone_X = await Jimp.read(
			path.join(__dirname, `device/Apple iPhone X Space Grey.png`)
		);

		let { width, height } = iPhone_X.bitmap;

		newFile = await new Jimp(width, height, "rgba(0,0,0,0");

		await newFile.composite(screenshot, 140, 180);
		await newFile.composite(iPhone_X, 0, 0);
	}

	if (image.includes("ipad")) {
		const iPad = await Jimp.read(
			path.join(__dirname, `device/Apple iPad Pro 13" Space Gray - Landscape.png`)
		);

		let { width, height } = iPad.bitmap;

		newFile = await new Jimp(width, height, "rgba(0,0,0,0");

		await newFile.composite(screenshot, 200, 200);
		await newFile.composite(iPad, 0, 0);
	}

	const newFilePath = `${folder}/${hostname}/mockups/${image}`;

	await newFile.write(newFilePath);
	console.log(`👷‍♂️ Image created: ${newFilePath}`);

	return newFilePath
};

export default makeComposite;
