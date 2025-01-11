const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.handler = async (event) => {
    const { url } = JSON.parse(event.body);

    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "No URL provided" }),
        };
    }

    let browser = null;

    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        const videoUrl = await page.evaluate(() => {
            const videoDiv = document.querySelector('.vjs-poster');
            if (videoDiv) {
                const style = videoDiv.style.backgroundImage;
                const match = style.match(/url\("(.+?)"\)/);
                return match ? match[1] : null;
            }
            return null;
        });

        if (videoUrl) {
            return {
                statusCode: 200,
                body: JSON.stringify({ videoUrl }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Video URL not found" }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch video", details: error.message }),
        };
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};