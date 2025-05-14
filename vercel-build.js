// This script helps ensure environment variables are available during build
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an environment file with the API URL
const envContent = `VITE_API_URL=https://web-production-f03ff.up.railway.app
`;

// Write the file
fs.writeFileSync(path.join(__dirname, '.env.production'), envContent);

console.log('Created .env.production file with required environment variables'); 