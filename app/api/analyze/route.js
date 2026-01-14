export async function POST(request) {
    try {
        const { comment, postCaption } = await request.json();

        // Validate inputs
        if (!comment || !postCaption) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log("Analyzing comment via OpenRouter...");

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://verce-deployment.com", // Optional, for OpenRouter
                "X-Title": "Instagram Fake Comment Detector", // Optional
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                    {
                        role: "user",
                        content: `You are an expert at detecting fake, spam, and bot comments on social media. Analyze this Instagram comment and determine if it's genuine or fake/spam.

POST CAPTION: "${postCaption}"
COMMENT USERNAME: "${comment.user}"
COMMENT TEXT: "${comment.text}"

Analyze the comment for:
1. Promotional/spam intent (links, follow requests, promotional language)
2. Generic/low-effort content (non-specific praise, copy-paste phrases)
3. Suspicious patterns (excessive emojis, all caps, repeated characters)
4. Engagement quality (relevant to post, asks questions, shows genuine interest)
5. Username patterns (bot-like names)

Respond in this EXACT JSON format with no additional text:
{
  "isFake": true or false,
  "confidence": number between 0-100,
  "suspicionScore": number between 0-100,
  "category": "genuine" or "spam" or "bot" or "promotional" or "generic",
  "reasons": ["reason 1", "reason 2"],
  "explanation": "brief 1-2 sentence explanation"
}`
                    }
                ],
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`OpenRouter API Error: ${response.status} ${response.statusText}`, errorData);
            throw new Error(`OpenRouter API failed: ${response.status} ${errorData}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error("Invalid OpenRouter response structure:", JSON.stringify(data));
            throw new Error("Invalid API response structure");
        }

        const aiResponse = data.choices[0].message.content.trim();

        // Extract JSON from response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Could not find JSON in AI response:", aiResponse);
            throw new Error("Invalid AI response format (no JSON found)");
        }

        const analysis = JSON.parse(jsonMatch[0]);
        return Response.json(analysis);

    } catch (error) {
        console.error('Analysis error details:', error);
        return Response.json(
            {
                isFake: false,
                confidence: 0,
                suspicionScore: 0,
                category: "unknown",
                reasons: ["AI Service Unavailable: " + error.message.substring(0, 100)],
                explanation: "The AI analysis service encountered an error. Please try again later."
            },
            { status: 200 } // Return 200 so frontend displays the fallback instead of crashing
        );
    }
}
