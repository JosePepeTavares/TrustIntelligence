// src/prompts/linkedinEvaluatorPrompt.ts

export type LinkedInEvalVars = {
  post_text: string;
  image_description?: string;
};

export const promptName = "linkedin_post_evaluator_demo";

/**
 * Simple demo prompt for evaluating a LinkedIn post.
 * Builds a single text string you can send to the OpenAI model.
 */
export function buildPrompt({ post_text, image_description = "" }: LinkedInEvalVars) {
  const prompt = `
You are a LinkedIn Post Evaluator Agent.

Analyze the following LinkedIn post and provide:

1. A score from 0-100 for each factor:
   - Culture
   - Income
   - Gender
   - Age
   - Region
   - Education
   - Access
   - Language
   - Literacy
   - Trust

2. An overall score (average of all factors).

3. A comprehensive paragraph of insights about the post. This should analyze:
   - The post's strengths and weaknesses
   - How it might be perceived by different audiences
   - Potential trust and bias concerns
   - Overall effectiveness and engagement potential
   - Specific recommendations for improvement

4. Three improved variants of the post, each with an estimated new overall score.

Post Text:

"${post_text}"

Image Description (if any):

"${image_description}"

Return the result strictly in JSON format like this:

{
  "scores": { "Culture": 0, "Income": 0, "Gender": 0, "Age": 0, "Region": 0, "Education": 0, "Access": 0, "Language": 0, "Literacy": 0, "Trust": 0 },
  "overall_score": 0,
  "insights": "Provide a comprehensive analysis paragraph here (3-5 sentences) covering strengths, weaknesses, audience perception, trust concerns, and recommendations.",
  "improvement_variants": [
    { "variant_text": "new version...", "estimated_overall_score": 0 },
    { "variant_text": "new version...", "estimated_overall_score": 0 },
    { "variant_text": "new version...", "estimated_overall_score": 0 }
  ]
}
`;

  return {
    promptName,
    prompt,
    modelHints: {
      model: "gpt-4-turbo",
      temperature: 0.7,
      response_format: "json_object"
    }
  };
}

export default buildPrompt;

