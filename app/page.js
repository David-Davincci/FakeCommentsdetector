'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Search, Instagram, Brain, Loader } from 'lucide-react';

export default function InstagramFakeCommentDetector() {
    const [postUrl, setPostUrl] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    // Sample Instagram posts with comments
    const samplePosts = {
        'post1': {
            username: 'travel_photographer',
            caption: 'Sunset in Santorini 🌅 One of the most breathtaking views I have ever captured. The colors were absolutely magical during golden hour.',
            image: '🏛️🌊',
            comments: [
                { user: 'john_doe', text: 'Absolutely stunning! The colors are incredible. Was this taken from Oia?', timestamp: '2h ago' },
                { user: 'bot_account_123', text: '😍😍😍 Amazing! Check my profile for similar content! 💯💯💯', timestamp: '1h ago' },
                { user: 'sarah_traveler', text: 'This reminds me of my trip there last summer. Did you try the local restaurants in Fira?', timestamp: '3h ago' },
                { user: 'promo_king', text: 'Nice post! 👍 Want more followers? Click link in my bio! 🔥🔥', timestamp: '45m ago' },
                { user: 'real_user_99', text: 'Great shot! What camera settings did you use for this? I struggle with sunset photography.', timestamp: '2h ago' },
                { user: 'spam_bot_x', text: 'WOW AMAZING!!!!! 😍😍😍😍😍😍😍😍😍😍', timestamp: '30m ago' },
                { user: 'emily_photos', text: 'Beautiful composition. The lighting is perfect during golden hour there. I love how you captured the architectural details.', timestamp: '4h ago' },
                { user: 'follow_back_now', text: 'Nice! Follow me back plz!! 🙏🙏🙏', timestamp: '20m ago' }
            ]
        },
        'post2': {
            username: 'foodie_adventures',
            caption: 'Homemade pasta carbonara 🍝 Traditional Roman recipe with guanciale and pecorino. Took me three tries to get the sauce just right!',
            image: '🍝🧀',
            comments: [
                { user: 'italian_chef', text: 'Looks delicious! Did you use guanciale or pancetta? The consistency looks perfect.', timestamp: '1h ago' },
                { user: 'bot_spammer', text: '🔥🔥🔥 CLICK MY BIO FOR FREE RECIPES 🔥🔥🔥', timestamp: '30m ago' },
                { user: 'cooking_love', text: 'The sauce consistency looks perfect! How long did you cook it? I always struggle with getting it creamy without scrambling.', timestamp: '2h ago' },
                { user: 'generic_bot', text: 'Nice post! 👌👌👌', timestamp: '15m ago' },
                { user: 'pasta_lover', text: 'This looks amazing! Traditional carbonara is so hard to master. Did you use the pasta water to emulsify?', timestamp: '1h ago' },
                { user: 'spam_account_99', text: 'FOLLOW FOR FOLLOW!!! CHEAP FOLLOWERS!!! DM NOW!!!', timestamp: '10m ago' }
            ]
        }
    };

    // AI-powered comment analysis
    const analyzeCommentWithAI = async (comment, postCaption) => {
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment: comment,
                    postCaption: postCaption
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const aiAnalysis = await response.json();

            return {
                ...comment,
                ...aiAnalysis,
                analyzedByAI: true
            };
        } catch (err) {
            console.error("AI Analysis error:", err);
            return {
                ...comment,
                isFake: false,
                confidence: 50,
                suspicionScore: 50,
                category: "unknown",
                reasons: ["AI analysis unavailable - check API setup"],
                explanation: "Could not perform AI analysis. Make sure your API is configured.",
                analyzedByAI: false
            };
        }
    };

    const handleAnalyze = async () => {
        if (!postUrl.trim()) {
            setError("Please enter a URL (e.g., 'post1' or 'post2' for demo, or a real Instagram link).");
            return;
        }

        setAnalyzing(true);
        setError(null);
        setResults(null);

        try {
            let postCaption = "Unknown Caption";
            let commentsToAnalyze = [];
            let isRealScrape = false;

            // 1. Determine Source (Mock vs Real)
            if (postUrl.includes('post1') || postUrl.includes('post2') || !postUrl.startsWith('http')) {
                // Demo Mode
                const demoKey = postUrl.includes('post2') ? 'post2' : 'post1';
                const postData = samplePosts[demoKey];
                postCaption = postData.caption;
                commentsToAnalyze = postData.comments;

                // Set initial results with mock data
                setResults({
                    post: postData,
                    comments: [], // Will fill as we analyze
                    fakeCount: 0,
                    totalCount: postData.comments.length,
                    fakePercentage: 0
                });
            } else {
                // Real Scraping Mode
                isRealScrape = true;
                const scrapeResponse = await fetch('/api/scrape', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postUrl })
                });

                if (!scrapeResponse.ok) {
                    const scrapeErr = await scrapeResponse.json();
                    throw new Error(scrapeErr.error || 'Failed to scrape comments');
                }

                const scrapeData = await scrapeResponse.json();
                commentsToAnalyze = scrapeData.comments;

                if (commentsToAnalyze.length === 0) {
                    throw new Error("No comments found on this post (or account is private).");
                }

                // Set initial results structure for real data
                setResults({
                    post: {
                        username: 'Instagram User',
                        caption: 'Real Instagram Post (Caption not visible via basic scrape)',
                        image: '📸',
                    },
                    comments: [],
                    fakeCount: 0,
                    totalCount: commentsToAnalyze.length,
                    fakePercentage: 0
                });
            }

            // 2. Analyze Comments (Common Logic)
            const analyzedComments = [];
            for (const comment of commentsToAnalyze) {
                // Determine caption to use (real posts might miss caption in basic scrape, use valid placeholder)
                const captionContext = isRealScrape ? "Real Instagram Post" : postCaption;

                const analyzed = await analyzeCommentWithAI(comment, captionContext);
                analyzedComments.push(analyzed);

                // Update results incrementally (optional, but good for UX)
                const currentFakes = analyzedComments.filter(c => c.isFake).length;
                setResults(prev => ({
                    ...prev,
                    comments: analyzedComments,
                    fakeCount: currentFakes,
                    fakePercentage: ((currentFakes / analyzedComments.length) * 100).toFixed(1)
                }));
            }

        } catch (err) {
            setError(err.message || "Analysis failed. Please try again.");
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'genuine': return 'bg-green-100 text-green-800 border-green-300';
            case 'spam': return 'bg-red-100 text-red-800 border-red-300';
            case 'bot': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'promotional': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'generic': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 mt-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Instagram className="w-10 h-10 text-pink-600" />
                        <Brain className="w-10 h-10 text-purple-600" />
                        <h1 className="text-4xl font-bold text-gray-800">AI-Powered Fake Comment Detector</h1>
                    </div>
                    <p className="text-gray-600">Using AI to intelligently detect fake and spam comments</p>
                    <div className="mt-2 inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm">
                        <Brain className="w-4 h-4" />
                        <span className="font-semibold">Powered by OpenRouter AI</span>
                    </div>
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram Post URL
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={postUrl}
                            onChange={(e) => setPostUrl(e.target.value)}
                            placeholder="https://www.instagram.com/p/xxxxx/ (or leave empty for demo)"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
                        >
                            {analyzing ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    Analyze with AI
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        💡 Try: Leave empty, type "post1", or "post2" to see different sample posts
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {results && (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Brain className="w-6 h-6 text-purple-600" />
                                <h2 className="text-2xl font-bold">AI Analysis Results</h2>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-blue-600">{results.totalCount}</div>
                                    <div className="text-sm text-gray-600">Total Comments</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-red-600">{results.fakeCount}</div>
                                    <div className="text-sm text-gray-600">Fake/Spam</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-green-600">{results.totalCount - results.fakeCount}</div>
                                    <div className="text-sm text-gray-600">Genuine</div>
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-red-500 h-full transition-all duration-500"
                                    style={{ width: `${results.fakePercentage}%` }}
                                />
                            </div>
                            <p className="text-center text-sm text-gray-600 mt-2">
                                {results.fakePercentage}% of comments flagged as fake or spam
                            </p>
                        </div>

                        {/* Post Preview */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full"></div>
                                <div>
                                    <div className="font-semibold">{results.post.username}</div>
                                    <div className="text-xs text-gray-500">Verified Account</div>
                                </div>
                            </div>
                            <div className="text-4xl mb-3 text-center">{results.post.image}</div>
                            <p className="text-gray-800 mb-4">{results.post.caption}</p>
                        </div>

                        {/* Comments Analysis */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-bold mb-4">Comment Analysis</h3>
                            <div className="space-y-4">
                                {results.comments.map((comment, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-lg border-2 ${comment.isFake
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-green-50 border-green-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                                <div>
                                                    <div className="font-semibold text-sm">{comment.user}</div>
                                                    <div className="text-xs text-gray-500">{comment.timestamp}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {comment.isFake ? (
                                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                                ) : (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                )}
                                                <span className={`text-sm font-semibold ${comment.isFake ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                    {comment.isFake ? 'FAKE/SPAM' : 'GENUINE'}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-800 mb-3">{comment.text}</p>

                                        {/* AI Analysis Details */}
                                        <div className="bg-white bg-opacity-50 rounded-lg p-3 space-y-2">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(comment.category)}`}>
                                                    {comment.category.toUpperCase()}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-semibold text-gray-700">Confidence:</span>
                                                    <span className="font-bold text-purple-600">{comment.confidence}%</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-semibold text-gray-700">Suspicion:</span>
                                                    <span className={`font-bold ${comment.suspicionScore >= 70 ? 'text-red-600' :
                                                        comment.suspicionScore >= 40 ? 'text-orange-600' :
                                                            'text-green-600'
                                                        }`}>
                                                        {comment.suspicionScore}/100
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-gray-200">
                                                <div className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                                    <Brain className="w-3 h-3" />
                                                    AI Explanation:
                                                </div>
                                                <p className="text-sm text-gray-700 italic">{comment.explanation}</p>
                                            </div>

                                            {comment.reasons.length > 0 && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <div className="text-xs font-semibold text-gray-700 mb-1">Detection Signals:</div>
                                                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                                                        {comment.reasons.map((reason, ridx) => (
                                                            <li key={ridx}>{reason}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Educational Note */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Brain className="w-5 h-5" />
                                How AI Makes This Better
                            </h3>
                            <p className="text-sm text-blue-800 mb-2">
                                Unlike simple rule-based detection, this AI-powered analyzer:
                            </p>
                            <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                                <li>Understands context and meaning, not just keywords</li>
                                <li>Detects subtle spam patterns that evolve over time</li>
                                <li>Analyzes relevance to the actual post content</li>
                                <li>Provides confidence scores and detailed explanations</li>
                                <li>Adapts to new types of fake comments automatically</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* How It Works Section */}
                {!results && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Brain className="w-6 h-6 text-purple-600" />
                            How AI Analysis Works
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">1.</span>
                                <span><strong>Context Understanding:</strong> AI reads the post caption and analyzes if comments are actually relevant to the content</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">2.</span>
                                <span><strong>Intent Detection:</strong> Identifies promotional intent, spam patterns, and bot behavior through natural language understanding</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">3.</span>
                                <span><strong>Engagement Quality:</strong> Evaluates if comments show genuine interest through questions, specific details, and meaningful interaction</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">4.</span>
                                <span><strong>Pattern Recognition:</strong> Detects sophisticated spam that simple rules would miss, including subtle promotional tactics</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">5.</span>
                                <span><strong>Confidence Scoring:</strong> Provides transparency with confidence levels and detailed explanations for each decision</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
