import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Content of .env file:');
  console.log(envContent);
  
  if (envContent.includes('HF_API_KEY=')) {
    console.log('\nAPI key found in .env file!');
    const keyMatch = envContent.match(/HF_API_KEY=([^\n]*)/);
    if (keyMatch && keyMatch[1]) {
      const key = keyMatch[1];
      console.log(`API key: ${key.substring(0, 5)}...${key.substring(key.length - 5)}`);
    }
  } else {
    console.log('\nNo API key found in .env file.');
  }
} catch (error) {
  console.error('Error reading .env file:', error);
} 