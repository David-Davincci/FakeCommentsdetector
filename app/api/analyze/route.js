import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
    try {
        const { comment, postCaption } = await request.json();

        // Validate inputs
        if (!comment || !postCaption) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log("Analyzing comment via Gemini API...");

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `You are an expert at detecting fake, spam, and bot comments on social media. Analyze this Instagram comment and determine if it's genuine or fake/spam.

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
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text().trim();

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
