'use server';
/**
 * @fileOverview Analyzes media content to detect deepfakes using advanced AI models.
 *
 * - deepfakeDetectionFromMedia - A function that handles the deepfake detection process.
 * - DeepfakeDetectionFromMediaInput - The input type for the deepfakeDetectionFromMedia function.
 * - DeepfakeDetectionFromMediaOutput - The return type for the deepfakeDetectionFromMedia function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeepfakeDetectionFromMediaInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      'The media content to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type DeepfakeDetectionFromMediaInput = z.infer<typeof DeepfakeDetectionFromMediaInputSchema>;

const DeepfakeDetectionFromMediaOutputSchema = z.object({
  isDeepfake: z.boolean().describe('Whether or not the media is a deepfake.'),
  confidence: z
    .number()
    .describe('The confidence level of the deepfake detection (0-1).'),
  explanation: z
    .string()
    .describe('An explanation of why the media is classified as a deepfake.'),
});
export type DeepfakeDetectionFromMediaOutput = z.infer<typeof DeepfakeDetectionFromMediaOutputSchema>;

export async function deepfakeDetectionFromMedia(
  input: DeepfakeDetectionFromMediaInput
): Promise<DeepfakeDetectionFromMediaOutput> {
  return deepfakeDetectionFromMediaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepfakeDetectionFromMediaPrompt',
  input: {schema: DeepfakeDetectionFromMediaInputSchema},
  output: {schema: DeepfakeDetectionFromMediaOutputSchema},
  prompt: `You are an expert in detecting deepfakes. Analyze the provided media content and determine if it is a deepfake.

Media: {{media url=mediaDataUri}}

Consider various factors such as facial anomalies, inconsistencies in lighting, unnatural movements, and audio manipulations.

Provide a confidence level (0-1) for your assessment and explain your reasoning.

Return the output in JSON format.`, // prettier-ignore
});

const deepfakeDetectionFromMediaFlow = ai.defineFlow(
  {
    name: 'deepfakeDetectionFromMediaFlow',
    inputSchema: DeepfakeDetectionFromMediaInputSchema,
    outputSchema: DeepfakeDetectionFromMediaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
