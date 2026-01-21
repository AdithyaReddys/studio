'use server';
/**
 * @fileOverview An adversarial attack detection AI agent.
 *
 * - detectAdversarialAttack - A function that handles the adversarial attack detection process.
 * - DetectAdversarialAttackInput - The input type for the detectAdversarialAttack function.
 * - DetectAdversarialAttackOutput - The return type for the detectAdversarialAttack function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAdversarialAttackInputSchema = z.object({
  modelInput: z.string().describe('The input to the AI model.'),
  modelOutput: z.string().describe('The output of the AI model.'),
  expectedBehavior: z.string().describe('The expected behavior of the AI model for the given input.'),
});
export type DetectAdversarialAttackInput = z.infer<typeof DetectAdversarialAttackInputSchema>;

const DetectAdversarialAttackOutputSchema = z.object({
  isAdversarialAttack: z.boolean().describe('Whether or not the input is an adversarial attack.'),
  explanation: z.string().describe('The explanation of why the input is an adversarial attack.'),
});
export type DetectAdversarialAttackOutput = z.infer<typeof DetectAdversarialAttackOutputSchema>;

export async function detectAdversarialAttack(input: DetectAdversarialAttackInput): Promise<DetectAdversarialAttackOutput> {
  return detectAdversarialAttackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAdversarialAttackPrompt',
  input: {schema: DetectAdversarialAttackInputSchema},
  output: {schema: DetectAdversarialAttackOutputSchema},
  prompt: `You are an expert in detecting adversarial attacks on AI systems.

You will analyze the input and output of an AI model and determine if the input is an adversarial attack.

Consider the expected behavior of the model and determine if the actual behavior deviates significantly.

Input to the AI model: {{{modelInput}}}
Output of the AI model: {{{modelOutput}}}
Expected behavior of the AI model: {{{expectedBehavior}}}

Based on this information, determine if the input is an adversarial attack and explain why.

Output isAdversarialAttack as true or false.
`,
});

const detectAdversarialAttackFlow = ai.defineFlow(
  {
    name: 'detectAdversarialAttackFlow',
    inputSchema: DetectAdversarialAttackInputSchema,
    outputSchema: DetectAdversarialAttackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
