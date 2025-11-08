export const biasAnalysisPrompt = (variables: { model: string; dataset: string }) => `
Analyze potential bias in the ${variables.model} trained on ${variables.dataset}.

Identify fairness risks, underrepresented groups, and mitigation strategies.
`;

