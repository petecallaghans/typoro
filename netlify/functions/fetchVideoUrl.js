const axios = require("axios");

exports.handler = async (event) => {
    try {
        // Log the incoming event
        console.log("Event received:", event);

        const { url } = JSON.parse(event.body);

        if (!url) {
            console.error("No URL provided.");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No URL provided" }),
            };
        }

        console.log("Fetching LinkedIn page for URL:", url);

        // Perform a simple GET request without cookies
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        const html = response.data;
        console.log("HTML content length:", html.length);

        // Extract the video URL directly from the HTML
        const videoMatch = html.match(/"contentUrl":"(https:\/\/dms\.licdn\.com\/playlist\/vid\/v2\/[^"]+)"/);

        if (videoMatch && videoMatch[1]) {
            const videoUrl = videoMatch[1];
            console.log("Video URL found:", videoUrl);
            return {
                statusCode: 200,
                body: JSON.stringify({ videoUrl }),
            };
        } else {
            console.error("Video URL not found in HTML.");
        }

        // If no video URL is found
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