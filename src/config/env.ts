import dotenv from 'dotenv';

// Load environment variables from .env.local first (higher priority), then .env
dotenv.config({ path: '.env.local' });
dotenv.config(); // This will load .env but won't override .env.local values

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || '3001';

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required in environment variables');
}

export { OPENAI_API_KEY, PORT };

