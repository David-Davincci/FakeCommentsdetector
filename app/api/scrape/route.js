import { ApifyClient } from 'apify-client';

export async function POST(request) {
    try {
        const { postUrl } = await request.json();

        if (!postUrl) {
            return Response.json({ error: 'Post URL is required' }, { status: 400 });
        }

        const apiToken = process.env.APIFY_API_TOKEN;
        if (!apiToken || apiToken.includes('YOUR_APIFY_TOKEN_HERE')) {
            return Response.json({ error: 'Apify API Token not configured on server' }, { status: 500 });
        }

        const client = new ApifyClient({
            token: apiToken,
        });

        console.log(`Starting scrape for: ${postUrl}`);

        // Run the Actor and wait for it to finish
        const run = await client.actor("apify/instagram-comment-scraper").call({
            "directUrls": [postUrl],
            "resultsLimit": 30, // Limit to 30 comments to save credits/time
        });

        console.log(`Scrape finished. Run ID: ${run.id}`);

        // Fetch results from the run's dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // Transform to our app's format
        const comments = items.map(item => ({
            user: item.ownerUsername || 'unknown_user',
            text: item.text || '',
            timestamp: new Date(item.timestamp).toLocaleDateString() || 'recently',
            // Default genuine category for new comments until analyzed
        }));

        const cleanComments = comments.filter(c => c.text && c.user);

        return Response.json({
            comments: cleanComments,
            scrapeId: run.id
        });

    } catch (error) {
        console.error('Scraping failed:', error);
        return Response.json({ error: 'Failed to scrape comments: ' + error.message }, { status: 500 });
    }
}
