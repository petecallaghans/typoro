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
                "Cookie": "AQEDAVXNXBQB76zUAAABlFa6SmUAAAGUesbOZU4AZV6jfLYGpJJllRxRueZc7SwZfzFz7d-hx9byt4PJVQRrJkj7kmryg78d5UWhZEW2fnbcMQK70L5-4NpzD7cTFl8eRmvCFIiYFyV0MG7mf8q7uoTk",
            },
        });

        const html = response.data;

        // Match the JSON in <script type="application/ld+json">
        const jsonMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/);
        if (jsonMatch && jsonMatch[1]) {
            const jsonData = JSON.parse(jsonMatch[1]);
            if (jsonData.contentUrl) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ videoUrl: jsonData.contentUrl }),
                };
            }
        }

        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Video URL not found" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch video", details: error.message }),
        };
    }
};