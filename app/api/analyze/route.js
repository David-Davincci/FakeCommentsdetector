export async function POST(request) {
    try {
        const { comment, postCaption } = await request.json();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.1-8b-instruct:free",
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

        const data = await response.json();
        const aiResponse = data.choices[0].message.content.trim();

        // Extract JSON from response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid AI response format");
        }

        const analysis = JSON.parse(jsonMatch[0]);
        return Response.json(analysis);

    } catch (error) {
        console.error('Analysis error:', error);
        return Response.json(
            {
                isFake: false,
                confidence: 50,
                suspicionScore: 50,
                category: "unknown",
                reasons: ["Analysis failed"],
                explanation: "Could not complete analysis"
            },
            { status: 200 }
        );
    }
}
