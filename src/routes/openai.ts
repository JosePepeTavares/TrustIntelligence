import { Router, Request, Response } from 'express';
import openai from '../utils/openaiClient';
import { getPrompt, getAvailablePrompts } from '../prompts';

const router = Router();

// POST /api/run - Execute a prompt with variables
router.post('/run', async (req: Request, res: Response) => {
  try {
    const { promptName, variables } = req.body;

    // Validate request body
    if (!promptName || typeof promptName !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: promptName is required and must be a string',
      });
    }

    if (!variables || typeof variables !== 'object') {
      return res.status(400).json({
        error: 'Invalid request: variables is required and must be an object',
      });
    }

    // Get prompt function from registry
    const promptFunction = getPrompt(promptName);
    if (!promptFunction) {
      return res.status(404).json({
        error: `Prompt "${promptName}" not found. Available prompts: ${getAvailablePrompts().join(', ')}`,
      });
    }

    // Generate prompt with variables
    const finalPrompt = promptFunction(variables);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: finalPrompt }],
      temperature: 0.7,
    });

    // Extract completion text
    const completion = response.choices[0]?.message?.content || '';

    // Return response
    res.json({
      prompt: finalPrompt,
      completion,
      model: response.model,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error('Error in /api/run:', error);
    
    // Handle OpenAI API errors
    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: 'OpenAI API error',
        message: error.message,
      });
    }

    // Handle other errors
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

// GET /api/prompts - List available prompts
router.get('/prompts', (req: Request, res: Response) => {
  try {
    const prompts = getAvailablePrompts();
    res.json({ prompts });
  } catch (error: any) {
    console.error('Error in /api/prompts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

export default router;

