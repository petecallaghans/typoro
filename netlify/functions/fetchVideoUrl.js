const axios = require("axios");

exports.handler = async (event) => {
    try {
        // Extract the URL from query parameters
        const url = event.queryStringParameters?.url;
        if (!url) {
            console.error("No URL provided.");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No URL provided" }),
            };
        }

        console.log("Fetching LinkedIn page for URL:", url);

        // Fetch the LinkedIn page with the li_at cookie
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Cookie": "li_at=AQEDAVXNXBQB76zUAAABlFa6SmUAAAGUesbOZU4AZV6jfLYGpJJllRxRueZc7SwZfzFz7d-hx9byt4PJVQRrJkj7kmryg78d5UWhZEW2fnbcMQK70L5-4NpzD7cTFl8eRmvCFIiYFyV0MG7mf8q7uoTk",
            },
        });

        const html = response.data;
        console.log("HTML content length:", html.length);

        // Extract the video URL from the background-image style
        const videoMatch = html.match(/background-image:\s*url\(&quot;(https:\/\/media\.licdn\.com\/dms\/image\/[^\s]+?)&quot;\)/);

        if (videoMatch && videoMatch[1]) {
            const videoUrl = videoMatch[1];
            console.log("Video URL found:", videoUrl);
            return {
                statusCode: 200,
                body: JSON.stringify({ videoUrl }),
            };
        } else {
            console.error("Video URL not found in background-image style.");
        }

        // Log additional information if no match is found
        console.log("Attempted regex match result:", videoMatch);

        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Video URL not found" }),
        };
    } catch (error) {
        console.error("Error occurred while fetching LinkedIn page:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch video", details: error.message }),
        };
    }
};