import { biasAnalysisPrompt } from './biasAnalysisPrompt';
import { simulationPrompt } from './simulationPrompt';
import { buildPrompt as linkedinEvaluatorPrompt } from './linkedinEvaluatorPrompt';

// Type for enhanced prompt result with model hints
export type EnhancedPromptResult = {
  promptName: string;
  prompt: string;
  modelHints: {
    model: string;
    temperature: number;
    response_format?: "json_object" | "text";
  };
};

// Type for prompt functions - can return either a string (old format) or EnhancedPromptResult (new format)
export type PromptFunction = (
  variables: Record<string, any>
) => string | EnhancedPromptResult;

// Type guard to check if result is enhanced format
export function isEnhancedPromptResult(
  result: string | EnhancedPromptResult
): result is EnhancedPromptResult {
  return typeof result === 'object' && result !== null && 'prompt' in result && 'modelHints' in result;
}

// Prompt registry - maps prompt names to their functions
export const promptRegistry: Record<string, PromptFunction> = {
  biasAnalysis: biasAnalysisPrompt,
  simulation: simulationPrompt,
  linkedin_post_evaluator_demo: linkedinEvaluatorPrompt,
};

// Get available prompt names
export const getAvailablePrompts = (): string[] => {
  return Object.keys(promptRegistry);
};

// Get prompt function by name
export const getPrompt = (name: string): PromptFunction | undefined => {
  return promptRegistry[name];
};

