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
  prompt: `You are a forensic media analyst specializing in deepfake detection. Your task is to analyze the provided media and determine its authenticity.

Media to analyze: {{media url=mediaDataUri}}

Conduct your analysis by examining the following aspects, just like a CNN-based deepfake detection system would analyze different feature maps:
1.  **Facial and Object Integrity:** Look for unnatural warping, strange blinking patterns (or lack thereof), odd facial expressions, and inconsistencies in features like teeth, hair, or ears.
2.  **Lighting and Shadows:** Analyze the lighting on the subject versus the background. Are there mismatched shadow directions, inconsistent color temperatures, or unnatural highlights?
3.  **Edge and Boundary Artifacts:** Examine the edges of the subject, especially around the hair and face. Look for a "pasted-on" look, unusual blurring, or pixel-level distortion that might indicate digital composition.
4.  **Contextual Coherence:** Does the subject's appearance (age, expression) and the background fit together logically?
5.  **For video:** Analyze movement. Is it fluid? Are there glitches or unnatural transitions between frames?

Based on your step-by-step forensic analysis of these points, make a final determination. Your output MUST be in the specified JSON format. Provide a confidence score from 0.0 (definitely authentic) to 1.0 (definitely a deepfake). Your explanation should summarize your findings from the forensic analysis.`, // prettier-ignore
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
