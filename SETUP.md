# Instagram Fake Comment Detector - Setup Guide

## ✅ Project Setup Complete!

All files and folders have been created successfully. Your Next.js application is ready to run!

## 📁 Project Structure

```
FakeCommentsdetector/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.js          # AI analysis API endpoint
│   ├── page.js                    # Main application page
│   ├── layout.js                  # Root layout
│   └── globals.css                # Global styles with Tailwind
├── package.json                   # Project dependencies
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── .gitignore                     # Git ignore rules
└── .env.local                     # Environment variables (YOU NEED TO CREATE THIS)
```

## 🚀 Current Status

✅ Dependencies installed  
✅ Development server running at **http://localhost:3000**

## ⚠️ IMPORTANT: Configure Your API Key

To enable AI-powered comment analysis, you need to add your OpenRouter API key:

### Step 1: Get Your API Key

1. Go to https://openrouter.ai/
2. Sign up for a FREE account
3. Navigate to the "Keys" section
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-...`)

### Step 2: Create `.env.local` File

Since `.env.local` is gitignored, you need to create it manually:

1. In the project root folder, create a new file named `.env.local`
2. Add the following line:

```
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

3. Replace `sk-or-v1-your-actual-key-here` with your actual API key
4. Save the file
5. **Restart the development server** (stop with Ctrl+C and run `npm run dev` again)

## 🎮 How to Use

1. Open http://localhost:3000 in your browser
2. The app works with demo data - you can:
   - Leave the URL field empty (uses post1)
   - Type "post1" for travel photography demo
   - Type "post2" for food photography demo
3. Click "Analyze with AI" to see the magic! ✨

## 🔍 Features

- **AI-Powered Analysis**: Uses Meta's Llama 3.1 model via OpenRouter
- **Context Understanding**: Analyzes comments in relation to post content
- **Confidence Scoring**: Shows how certain the AI is about each classification
- **Detailed Explanations**: AI explains why each comment is flagged
- **Category Classification**: genuine, spam, bot, promotional, or generic

## 📝 Available Scripts

```bash
npm run dev      # Start development server (already running!)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🌐 Deployment to Vercel (Optional)

When ready to deploy:

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# Then:
# 1. Go to https://vercel.com
# 2. Import your GitHub repository
# 3. Add environment variable: OPENROUTER_API_KEY
# 4. Deploy!
```

## 💡 Tips

- The app will work without an API key but will show "AI analysis unavailable" messages
- With the free OpenRouter API, you get access to several free models
- The current implementation uses `meta-llama/llama-3.1-8b-instruct:free`
- Each analysis sends one API request per comment

## 🛠️ Troubleshooting

**Issue**: "AI analysis unavailable"  
**Solution**: Make sure you've created `.env.local` with your API key and restarted the server

**Issue**: Port 3000 already in use  
**Solution**: Stop other Next.js servers or use `npm run dev -- -p 3001` for a different port

**Issue**: Changes not appearing  
**Solution**: Hard refresh (Ctrl+F5) or clear browser cache

---

Enjoy detecting fake comments with AI! 🎉
