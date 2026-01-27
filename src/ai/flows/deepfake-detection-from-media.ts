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
  prompt: `You are a world-class digital forensic expert with a specialization in identifying AI-generated and manipulated media (deepfakes). You are highly skeptical and your primary goal is to uncover any evidence of digital forgery, no matter how subtle. You are examining a piece of media for a high-stakes investigation where accuracy is paramount.

Media to analyze: {{media url=mediaDataUri}}

Execute a rigorous, multi-layered forensic analysis. Scrutinize the media for any of the following tell-tale signs of AI generation or deepfake manipulation. Document your findings for each point.

1.  **Pixel-Level & Compression Artifacts:**
    *   Look for unnatural smoothness or blotchy patches where details should be sharp (e.g., skin, fabric).
    *   Examine for "checkerboard" or blocky artifacts, especially in low-contrast or background areas.
    *   Check for inconsistencies in digital noise or grain across different parts of the image.

2.  **Anatomical & Physical Inconsistencies:**
    *   **Facial Features:** Are the eyes, ears, and teeth symmetrical and consistent? Look for misshapen pupils, incorrect reflections in the eyes, or poorly formed teeth.
    *   **Hair:** Are individual strands logical, or do they merge unnaturally? Does the hair behave correctly at the edges and boundaries?
    *   **Hands and Fingers:** Count the fingers. Do they bend naturally? Are the joints and proportions correct? This is a common failure point for AI generators.

3.  **Lighting, Shadows, and Reflections:**
    *   **Inconsistent Lighting:** Does the light source seem consistent across the entire scene? Is one part of a face lit from the left while another object is lit from the right?
    *   **Unnatural Shadows:** Are shadows cast correctly? Look for missing shadows or shadows that don't match the object's shape or the light source.
    *   **Reflections:** Check reflective surfaces (eyes, glasses, windows). Do the reflections accurately represent the surrounding environment?

4.  **Contextual & Logical Flaws:**
    *   Does the style of objects in the image match? (e.g., a modern smartphone in a medieval setting).
    *   Is there any nonsensical or garbled text in the background?
    *   Are there any repeating patterns that look unnatural?

**Conclusion:**

After your thorough analysis, you MUST make a determination.
- If you find **any significant evidence** of manipulation or AI generation from the checks above, you must classify it as a deepfake.
- The confidence score reflects your certainty of forgery. A score of 0.0 means you are absolutely certain it's authentic. A score of 1.0 means you are absolutely certain it's a deepfake. Do not be overly cautious; if you find flaws, the score should be high (e.g., > 0.8).

Your output MUST be in the specified JSON format. Your explanation must be a summary of your forensic findings.`,
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
