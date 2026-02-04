import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

console.log('Testing Gemini API Key...');
console.log('API Key:', apiKey ? apiKey.substring(0, 20) + '...' : 'NOT FOUND');

const genAI = new GoogleGenerativeAI(apiKey);

// Try different model names
const modelsToTest = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
];

async function testModel(modelName) {
    try {
        console.log(`\nTesting: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName} WORKS!`);
        console.log(`Response: ${text.substring(0, 50)}...`);
        return true;
    } catch (error) {
        console.log(`❌ ${modelName} FAILED`);
        console.log(`Error: ${error.message}`);
        return false;
    }
}

(async () => {
    console.log('\n--- Testing Models ---\n');

    for (const modelName of modelsToTest) {
        const works = await testModel(modelName);
        if (works) {
            console.log(`\n🎉 Use this model: ${modelName}\n`);
            break;
        }
    }
})();
