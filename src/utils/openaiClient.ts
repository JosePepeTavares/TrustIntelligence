import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../config/env';

// Initialize OpenAI client singleton
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export default openai;

