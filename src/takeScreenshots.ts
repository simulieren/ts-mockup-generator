import puppeteer from "puppeteer";
import fs from "fs";
import { parse } from 'url';

const takeScreenshots = async ({
	device,
    url,
    folder = "mockups",
    scroll = 20
}: {
	device?: string;
    url: string;
    folder?: string;
    scroll?: number;
}): Promise<string[]> => {
	const selectedDevice = puppeteer.devices[device || "iPhone X"];
    const args = ['--lang=en-US,en']

	const browser = await puppeteer.launch({args});

	const screenshots = [];

    const hostname = parse(url).hostname
    
    fs.stat(folder, function(err) {
		if (!err) {
			console.log(`🖼 Screenshots will be created at: ${folder}`);
		} else if (err.code === "ENOENT") {
            if (fs.existsSync(folder)) return;
            fs.mkdirSync(folder)
            console.log(`🆕 : 📁 New folder: ${folder}`)
		}
    });

	fs.stat(`${folder}/${hostname}`, function(err) {
		if (!err) {
			console.log(`🖼 Screenshots will be created at: ${folder}/${hostname}`);
		} else if (err.code === "ENOENT") {
            if (fs.existsSync(`${folder}/${hostname}`)) return;
            fs.mkdirSync(`${folder}/${hostname}`)
            console.log(`🆕 : 📁 New folder: ${folder}/${hostname}`)
		}
    });
    
    let scrolling = true;
    let screenshotNumber = 1;

	try {
        const page = await browser.newPage();
        await page.emulate(selectedDevice);
        
        // Set the browser Language
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en'
        });

        // Set the language forcefully on javascript
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "language", {
                get: function() {
                    return ["en-US"];
                }
            });
            Object.defineProperty(navigator, "languages", {
                get: function() {
                    return ["en-US", "en"];
                }
            });
        });

		await page.goto(url, {
			waitUntil: "networkidle2"
        });
        
        // Remove cookie dialog from DOM
        try {
            await page.$$eval('#CybotCookiebotDialog', (el) => el[0] ? el[0].remove() : undefined);
        } catch (error) {
            if (error) console.log(error)
        }

		while (scrolling) {
			await page.waitFor(300);

			const filename = `${hostname}-${selectedDevice.name
				.toLowerCase()
                .replace(" ", "_")}-${screenshotNumber}.png`;
            screenshotNumber++;

            const filePath = `${folder}/${hostname}/${filename}`

            screenshots.push(filename);

            await page.screenshot({ path: filePath });
            
			console.log(`📸 Screenshot captured of: ${url}`);
            console.log(`🖼 Image filename: ${filename}`);

            for (let i = 0; i < scroll; i++) {
                await page.keyboard.press("ArrowDown");
            }
            
            await page.waitFor(300);
            
            const reachedEnd = await page.evaluate(() => {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                    return Promise.resolve(true)
                }
            })

            if (reachedEnd) {scrolling = false;}
        }

        console.log(`✅ Reached the end of the page: ${url}`);
        
	} catch (err) {
		console.error(`🔴 Unable to capture screenshot of: ${url}`);
	}

	await browser.close();

	return screenshots;
};

export default takeScreenshots;
