import Jimp from "jimp";
import fs from "fs";

const makeComposite = async ({
	images = [],
    hostname,
    folder = "mockups"
}: {
	images: string[];
    hostname?: string;
    folder?: string;
}) => {
	if (images.length === 0) {
		images = fs.readdirSync(`${folder}/${hostname}`);
	}

	if (images.includes("mockups")) {
		console.log(`Removing "mockups" from images array`);
		images = images.filter(i => i !== "mockups");
    }
    
    fs.stat(folder, function(err) {
		if (!err) {
			console.log(`🖼 Folder exists: ${folder}`);
		} else if (err.code === "ENOENT") {
            fs.mkdirSync(folder)
            console.log(`🆕 : 📁 New folder: ${folder}`)
		}
    });

	fs.stat(`${folder}/${hostname}/mockups`, function(err) {
		if (!err) {
			console.log(`🖼 Mockups will be created at: ${folder}/${hostname}/mockups`);
		} else if (err.code === "ENOENT") {
			fs.mkdirSync(`${folder}/${hostname}/mockups`);
			console.log(
				`🆕 : 📁 New folder for mockups created: ${folder}/${hostname}/mockups`
			);
		}
	});

    console.log(`👷‍♂️ Start working on ${images.length} images ...`);
    let currentImageNumber = 0;
    
    const iPhone_X = await Jimp.read(`device/Apple iPhone X Space Grey.png`);
    const iPad = await Jimp.read(`device/Apple iPad Pro 13" Space Gray - Landscape.png`);

	for (const image of images) {
        let newFile;
		const filePath = `${folder}/${hostname}/${image}`;

        const screenshot = await Jimp.read(filePath);
        
        if (image.includes("iphone")) {
            let { width, height } = iPhone_X.bitmap;
    
            newFile = await new Jimp(width, height, "rgba(0,0,0,0");
    
            await newFile.composite(screenshot, 140, 180);
            await newFile.composite(iPhone_X, 0, 0);
        }

        if (image.includes("ipad")) {
            let { width, height } = iPad.bitmap;
    
            newFile = await new Jimp(width, height, "rgba(0,0,0,0");
    
            await newFile.composite(screenshot, 200, 200);
            await newFile.composite(iPad, 0, 0);
        }

        const newFilePath = `${folder}/${hostname}/mockups/${image}`


        await newFile.write(newFilePath);
        console.log(`👷‍♂️ Image created: ${newFilePath}`);
        currentImageNumber++;
        console.log(`👷‍♂️ Images created: ${currentImageNumber}/${images.length}`);
    }
    
    console.log(`👷‍♂️: ✅ All images created: ${currentImageNumber}/${images.length}`);
};

export default makeComposite;
