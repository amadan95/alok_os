// Test script to verify Together AI API integration
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

dotenv.config();

const apiKey = process.env.TOGETHER_API_KEY;
console.log('API Key available:', !!apiKey, apiKey ? `(starts with: ${apiKey.substring(0, 5)}...)` : '(missing)');

async function testTogetherAPI() {
  try {
    const messages = [
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Hello, how are you?' }
    ];
    
    console.log('Sending request to Together AI...');
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
        messages: messages,
        temperature: 0.85,
        max_tokens: 200,
        stream: false
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('AI response:', data.choices[0].message.content);
    } else {
      console.error('Invalid response format');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testTogetherAPI(); 