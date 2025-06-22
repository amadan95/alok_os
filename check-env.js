import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('Loading environment variables from .env file');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n');
      
      envVars.forEach(line => {
        // Skip empty lines and comments
        if (!line || line.startsWith('#')) return;
        
        // Remove any trailing comments
        const lineWithoutComment = line.split('#')[0].trim();
        
        // Split by first equals sign
        const equalSignIndex = lineWithoutComment.indexOf('=');
        if (equalSignIndex > 0) {
          const key = lineWithoutComment.substring(0, equalSignIndex).trim();
          let value = lineWithoutComment.substring(equalSignIndex + 1).trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
          }
          
          // Don't override existing environment variables
          if (!process.env[key]) {
            process.env[key] = value;
            console.log(`Set environment variable: ${key}=${value.substring(0, 3)}...`);
          }
        }
      });
    } else {
      console.warn('No .env file found');
    }
  } catch (error) {
    console.error('Error loading .env file:', error);
  }
}

// Load environment variables from .env file
loadEnvFile();

// Check for required environment variables
const requiredEnvVars = [
  'TOGETHER_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Some features may not work correctly without these variables.');
} else {
  console.log('All required environment variables are set.');
  console.log('TOGETHER_API_KEY:', process.env.TOGETHER_API_KEY ? `${process.env.TOGETHER_API_KEY.substring(0, 5)}...` : 'Not set');
}

export default {}; 