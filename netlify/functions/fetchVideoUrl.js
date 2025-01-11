const axios = require("axios");

exports.handler = async (event) => {
    try {
        // Parse the incoming request
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
                "User-Agent": "Mozilla/5.0",
            },
        });

        const html = response.data;

        // Extract the video URL (adjust regex if LinkedIn changes its structure)
        const videoMatch = html.match(/<video[^>]+src="([^"]+)"/);
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