const axios = require("axios");

exports.handler = async (event) => {
    try {
        console.log("Event received:", event);

        const { url } = JSON.parse(event.body);
        console.log("URL received:", url);

        if (!url) {
            console.error("No URL provided");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No URL provided" }),
            };
        }

        // Fetch the LinkedIn page
        console.log("Fetching LinkedIn page...");
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        const html = response.data;
        console.log("Fetched HTML content length:", html.length);

        // Check for video metadata
        console.log("Attempting to match contentUrl...");
        const videoMatch = html.match(/"contentUrl":"(https:\/\/media\.licdn\.com\/[^"]+)"/);
        if (videoMatch && videoMatch[1]) {
            console.log("Video URL found via contentUrl:", videoMatch[1]);
            return {
                statusCode: 200,
                body: JSON.stringify({ videoUrl: videoMatch[1] }),
            };
        }

        // Attempt to extract background image URL as a fallback
        console.log("Attempting to match background-image...");
        const backgroundImageMatch = html.match(/background-image:\s*url\(&quot;(https:\/\/media\.licdn\.com\/dms\/image\/[^\s]+?)&quot;\)/);
        if (backgroundImageMatch && backgroundImageMatch[1]) {
            console.log("Video URL found via background-image:", backgroundImageMatch[1]);
            return {
                statusCode: 200,
                body: JSON.stringify({ videoUrl: backgroundImageMatch[1] }),
            };
        }

        // If neither match works, return an error
        console.error("Video URL not found");
        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Video URL not found" }),
        };
    } catch (error) {
        console.error("Error occurred:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch video", details: error.message }),
        };
    }
};