import { biasAnalysisPrompt } from './biasAnalysisPrompt';
import { simulationPrompt } from './simulationPrompt';

// Type for prompt functions
export type PromptFunction = (variables: Record<string, string>) => string;

// Prompt registry - maps prompt names to their functions
export const promptRegistry: Record<string, PromptFunction> = {
  biasAnalysis: biasAnalysisPrompt,
  simulation: simulationPrompt,
};

// Get available prompt names
export const getAvailablePrompts = (): string[] => {
  return Object.keys(promptRegistry);
};

// Get prompt function by name
export const getPrompt = (name: string): PromptFunction | undefined => {
  return promptRegistry[name];
};

