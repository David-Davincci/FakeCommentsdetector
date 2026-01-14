const fs = require('fs');
const path = require('path');
const https = require('https');

let apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/OPENROUTER_API_KEY=(.*)/);
            if (match && match[1]) apiKey = match[1].trim();
        }
    } catch (e) { }
}

const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/models',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${apiKey}` }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            if (res.statusCode === 200) {
                console.log("Available Free Models:");
                const free = json.data.filter(m => m.id.includes('free') || (m.pricing && m.pricing.prompt === '0'));
                free.slice(0, 10).forEach(m => console.log(`- ${m.id}`));
            } else {
                console.log("Error:", json);
            }
        } catch (e) { console.error(e); }
    });
});
req.end();
