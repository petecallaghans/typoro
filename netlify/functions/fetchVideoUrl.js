const puppeteer = require("puppeteer");

exports.handler = async (event) => {
    const { url } = JSON.parse(event.body);

    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "No URL provided" }),
        };
    }

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Netlify
        });
        const page = await browser.newPage();

        // Go to the LinkedIn video URL
        await page.goto(url, { waitUntil: "networkidle2" });

        // Evaluate the rendered page to extract the video URL
        const videoUrl = await page.evaluate(() => {
            const videoDiv = document.querySelector('.vjs-poster'); // Match the element
            if (videoDiv) {
                const style = videoDiv.style.backgroundImage;
                const match = style.match(/url\("(.+?)"\)/);
                return match ? match[1] : null;
            }
            return null;
        });

        await browser.close();

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
    }
};