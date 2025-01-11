const axios = require("axios");

exports.handler = async (event) => {
    try {
        const { url } = JSON.parse(event.body);

        if (!url) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No URL provided" }),
            };
        }

        // Fetch the LinkedIn page
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        const html = response.data;

// Log the raw HTML
console.log(html);

        // Extract the video URL from the background-image style
        const videoMatch = html.match(/background-image:\s*url\(&quot;(https:\/\/media\.licdn\.com\/dms\/image\/[^\s]+?)&quot;\)/);

        if (videoMatch && videoMatch[1]) {
            return {
                statusCode: 200,
                body: JSON.stringify({ videoUrl: videoMatch[1] }),
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