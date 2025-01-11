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

        // Log the first 2000 characters of the HTML for debugging
        console.log("HTML snippet:", html.slice(0, 2000));

        // Match the JSON in <script type="application/ld+json">
        const jsonMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/);
        if (jsonMatch && jsonMatch[1]) {
            console.log("JSON block found, parsing...");

            try {
                const jsonData = JSON.parse(jsonMatch[1]);
                console.log("Parsed JSON data:", jsonData);

                if (jsonData.contentUrl) {
                    console.log("Video URL found:", jsonData.contentUrl);
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ videoUrl: jsonData.contentUrl }),
                    };
                } else {
                    console.error("No contentUrl found in JSON.");
                }
            } catch (parseError) {
                console.error("Failed to parse JSON block:", parseError.message);
            }
        } else {
            console.error("No JSON block found in the HTML.");
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