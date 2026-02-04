const https = require('https');
const fs = require('fs');
const path = require('path');

// Hardcoded key from user request to ensure no env var issues
const apiKey = 'AIzaSyDh_fSc6AQT89e4spChdfkh5_BEfePM09g';

console.log('Using API Key:', apiKey);

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${apiKey}`,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            const data = JSON.parse(body);
            if (data.models) {
                console.log('✅ Available Models:');
                data.models.forEach(m => {
                    console.log(` - ${m.name.replace('models/', '')} (${m.displayName})`);
                });
            } else {
                console.log('❌ No models found or error structure:', JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.log('❌ Error parsing response:', body);
        }
    });
});

req.on('error', (e) => {
    console.error('Request failed:', e.message);
});

req.end();
