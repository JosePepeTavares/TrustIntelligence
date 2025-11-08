export const simulationPrompt = (variables: { content: string; demographic?: string }) => {
  const demographicContext = variables.demographic
    ? `from the perspective of ${variables.demographic}`
    : 'from diverse demographic perspectives';
  
  return `
Simulate how different groups would interpret the following content ${demographicContext}:

${variables.content}

Provide analysis of potential interpretations, biases, and trust implications across different demographic groups.
`;
};

