import { Router, Request, Response } from 'express';
import openai from '../utils/openaiClient';
import { getPrompt, getAvailablePrompts, isEnhancedPromptResult } from '../prompts';

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
    const promptResult = promptFunction(variables);

    // Handle both old format (string) and new format (EnhancedPromptResult)
    let finalPrompt: string;
    let model = 'gpt-4o';
    let temperature = 0.7;
    let responseFormat: "json_object" | "text" | undefined = undefined;

    if (isEnhancedPromptResult(promptResult)) {
      // New format with model hints
      finalPrompt = promptResult.prompt;
      model = promptResult.modelHints.model;
      temperature = promptResult.modelHints.temperature;
      responseFormat = promptResult.modelHints.response_format;
    } else {
      // Old format - just a string
      finalPrompt = promptResult;
    }

    // Build OpenAI API request options
    const apiOptions: any = {
      model,
      messages: [{ role: 'user', content: finalPrompt }],
      temperature,
    };

    // Add response_format if specified (for JSON responses)
    if (responseFormat) {
      apiOptions.response_format = { type: responseFormat };
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create(apiOptions);

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

// POST /api/analyze-image - Analyze image using OpenAI Vision API
router.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, imageMimeType } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: imageBase64 is required and must be a string',
      });
    }

    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using gpt-4o for vision capabilities
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and provide a detailed description. Focus on what would be relevant for a LinkedIn post caption. Describe the main subject, setting, mood, colors, and any text visible in the image.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMimeType || 'image/jpeg'};base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const imageDescription = response.choices[0]?.message?.content || '';

    res.json({
      description: imageDescription,
      model: response.model,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-image:', error);
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: 'OpenAI API error',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

// POST /api/evaluate-linkedin-post - Evaluate LinkedIn post with optional image
router.post('/evaluate-linkedin-post', async (req: Request, res: Response) => {
  try {
    const { post_text, image_description, imageBase64, imageMimeType } = req.body;

    if (!post_text || typeof post_text !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: post_text is required and must be a string',
      });
    }

    let finalImageDescription = image_description || '';

    // If image is provided but no description, analyze it first
    if (imageBase64 && !image_description) {
      try {
        // Validate imageBase64
        if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
          console.warn('Invalid imageBase64 provided, skipping image analysis');
        } else {
          // Extract base64 data (remove data URL prefix if present)
          let base64Data: string;
          if (imageBase64.includes(',')) {
            base64Data = imageBase64.split(',')[1];
          } else {
            base64Data = imageBase64;
          }

          // Validate base64 data
          if (!base64Data || base64Data.length === 0) {
            console.warn('Empty base64 data after extraction');
          } else {
            // Determine MIME type - use provided or infer from data URL or default to jpeg
            let mimeType = imageMimeType || 'image/jpeg';
            if (imageBase64.includes('data:')) {
              const mimeMatch = imageBase64.match(/data:([^;]+)/);
              if (mimeMatch && mimeMatch[1]) {
                mimeType = mimeMatch[1];
              }
            }

            // Validate image size (OpenAI has limits - roughly 20MB for base64)
            // Base64 is ~33% larger than binary, so ~15MB binary = ~20MB base64
            const base64SizeMB = (base64Data.length * 3) / 4 / 1024 / 1024;
            if (base64SizeMB > 20) {
              console.warn(`Image too large: ${base64SizeMB.toFixed(2)}MB, max is 20MB`);
              return res.status(400).json({
                error: 'Image too large',
                message: `Image size is ${base64SizeMB.toFixed(2)}MB. Maximum size is 20MB.`,
              });
            }

            console.log(`Analyzing image: ${base64SizeMB.toFixed(2)}MB, type: ${mimeType}`);

            const visionResponse = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'Analyze this image and provide a detailed description. Focus on what would be relevant for a LinkedIn post caption. Describe the main subject, setting, mood, colors, and any text visible in the image.',
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:${mimeType};base64,${base64Data}`,
                      },
                    },
                  ],
                },
              ],
              max_tokens: 300,
            });

            finalImageDescription = visionResponse.choices[0]?.message?.content || '';
            console.log('Image analysis successful, description length:', finalImageDescription.length);
          }
        }
      } catch (visionError: any) {
        console.error('Error analyzing image:', visionError);
        // Log detailed error for debugging
        if (visionError.response) {
          console.error('OpenAI API error details:', {
            status: visionError.response.status,
            statusText: visionError.response.statusText,
            data: visionError.response.data,
          });
        }
        // Continue without image description if analysis fails
        // This allows the post evaluation to proceed even if image analysis fails
        console.warn('Continuing with post evaluation without image description');
        finalImageDescription = '';
      }
    }

    // Get LinkedIn evaluator prompt
    const promptFunction = getPrompt('linkedin_post_evaluator_demo');
    if (!promptFunction) {
      return res.status(404).json({
        error: 'LinkedIn evaluator prompt not found',
      });
    }

    // Generate prompt with variables
    const promptResult = promptFunction({
      post_text,
      image_description: finalImageDescription,
    });

    // Handle enhanced prompt result
    let finalPrompt: string;
    let model = 'gpt-4-turbo';
    let temperature = 0.7;
    let responseFormat: "json_object" | "text" | undefined = undefined;

    if (isEnhancedPromptResult(promptResult)) {
      finalPrompt = promptResult.prompt;
      model = promptResult.modelHints.model;
      temperature = promptResult.modelHints.temperature;
      responseFormat = promptResult.modelHints.response_format;
    } else {
      finalPrompt = promptResult;
    }

    // Build OpenAI API request options
    const apiOptions: any = {
      model,
      messages: [{ role: 'user', content: finalPrompt }],
      temperature,
    };

    // Add response_format if specified (for JSON responses)
    if (responseFormat) {
      apiOptions.response_format = { type: responseFormat };
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create(apiOptions);

    // Extract completion text
    const completion = response.choices[0]?.message?.content || '';

    // Parse JSON response if available
    let parsedResult;
    try {
      parsedResult = JSON.parse(completion);
    } catch {
      parsedResult = { raw: completion };
    }

    res.json({
      result: parsedResult,
      image_description: finalImageDescription,
      model: response.model,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error('Error in /api/evaluate-linkedin-post:', error);
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: 'OpenAI API error',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

// POST /api/generate-captions - Generate LinkedIn post captions using OpenAI
router.post('/generate-captions', async (req: Request, res: Response) => {
  try {
    const { imageBase64, imageMimeType, context } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: imageBase64 is required and must be a string',
      });
    }

    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    // First, analyze the image
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image in detail. Describe the main subject, setting, mood, colors, composition, and any text visible. Focus on elements that would be relevant for creating engaging LinkedIn post captions.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMimeType || 'image/jpeg'};base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      max_tokens: 400,
    });

    const imageAnalysis = analysisResponse.choices[0]?.message?.content || '';

    // Generate captions based on image analysis
    const captionPrompt = `Based on this image analysis, generate 5 engaging LinkedIn post captions. Each caption should be:
- Professional yet engaging
- Between 100-200 characters
- Include relevant hashtags (2-3 per caption)
- Optimized for LinkedIn's algorithm
- Varied in tone (some professional, some more casual, some storytelling)

Image Analysis:
${imageAnalysis}

${context ? `Additional Context: ${context}` : ''}

Return the result as a JSON array of objects with this structure:
[
  {
    "caption": "caption text here",
    "tone": "professional|casual|storytelling|inspirational",
    "estimated_engagement": "high|medium|low"
  },
  ...
]`;

    const captionResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: captionPrompt }],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const captionContent = captionResponse.choices[0]?.message?.content || '';
    
    let parsedCaptions;
    try {
      const parsed = JSON.parse(captionContent);
      // Handle both array and object with array property
      parsedCaptions = Array.isArray(parsed) ? parsed : (parsed.captions || parsed);
    } catch {
      // Fallback: try to extract captions from text
      parsedCaptions = [{ caption: captionContent, tone: 'professional', estimated_engagement: 'medium' }];
    }

    res.json({
      captions: parsedCaptions,
      image_analysis: imageAnalysis,
      model: captionResponse.model,
      usage: {
        analysis: analysisResponse.usage,
        generation: captionResponse.usage,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/generate-captions:', error);
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: 'OpenAI API error',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

export default router;

