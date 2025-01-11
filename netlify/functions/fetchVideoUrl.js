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

        // Fetch the LinkedIn page with the provided cookie
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Cookie": "li_at=AQEDAVXNXBQB76zUAAABlFa6SmUAAAGUesbOZU4AZV6jfLYGpJJllRxRueZc7SwZfzFz7d-hx9byt4PJVQRrJkj7kmryg78d5UWhZEW2fnbcMQK70L5-4NpzD7cTFl8eRmvCFIiYFyV0MG7mf8q7uoTk",
            },
        });

        const html = response.data;

        console.log("Fetched HTML content length:", html.length);

        // Attempt to extract video URL from metadata
        const videoMatch = html.match(/"contentUrl":"(https:\/\/media\.licdn\.com\/[^"]+)"/);
        if (videoMatch && videoMatch[1]) {
            console.log("Video URL found:", videoMatch[1]);
            return {
                statusCode: 200,
                body: JSON.stringify({ videoUrl: videoMatch[1] }),
            };
        }

        // Attempt to extract background image URL as a fallback
        const backgroundImageMatch = html.match(/background-image:\s*url\(&quot;(https:\/\/media\.licdn\.com\/dms\/image\/[^\s]+?)&quot;\)/);
        if (backgroundImageMatch && backgroundImageMatch[1]) {
            console.log("Background image URL found:", backgroundImageMatch[1]);
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
        console.error("Error fetching LinkedIn page:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch video", details: error.message }),
        };
    }
};