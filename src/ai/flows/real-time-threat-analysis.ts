'use server';

/**
 * @fileOverview Analyzes real-time data streams for potential threats, prioritizes them, and provides a report.
 *
 * - analyzeRealTimeThreats - Analyzes data streams for threats, prioritizes them and provides a report.
 * - RealTimeThreatAnalysisInput - The input type for the analyzeRealTimeThreats function.
 * - RealTimeThreatAnalysisOutput - The return type for the analyzeRealTimeThreats function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeThreatAnalysisInputSchema = z.object({
  dataStream: z.string().describe('Real-time data stream to analyze.'),
});

export type RealTimeThreatAnalysisInput = z.infer<
  typeof RealTimeThreatAnalysisInputSchema
>;

const ThreatReportSchema = z.object({
  threatType: z.string().describe('The type of threat detected.'),
  priority: z.enum(['High', 'Medium', 'Low']).describe('The priority of the threat.'),
  description: z.string().describe('A detailed description of the threat.'),
  confidenceLevel: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence level of the threat detection (0 to 1).'),
});

const RealTimeThreatAnalysisOutputSchema = z.object({
  report: z.array(ThreatReportSchema).describe('A prioritized report of potential threats.'),
  summary: z.string().describe('A summary of the real-time threat analysis.'),
});

export type RealTimeThreatAnalysisOutput = z.infer<
  typeof RealTimeThreatAnalysisOutputSchema
>;

export async function analyzeRealTimeThreats(
  input: RealTimeThreatAnalysisInput
): Promise<RealTimeThreatAnalysisOutput> {
  return analyzeRealTimeThreatsFlow(input);
}

const analyzeRealTimeThreatsPrompt = ai.definePrompt({
  name: 'analyzeRealTimeThreatsPrompt',
  input: {schema: RealTimeThreatAnalysisInputSchema},
  output: {schema: RealTimeThreatAnalysisOutputSchema},
  prompt: `You are a real-time threat analysis expert. Analyze the provided data stream for potential threats, prioritize them based on their potential impact, and generate a report.

  Data Stream: {{{dataStream}}}

  Prioritize threats as High, Medium, or Low.
  Include a confidence level (0 to 1) for each threat detection.
  Provide a summary of the overall threat landscape.

  Ensure the report is well-structured and easy to understand.

  Output in JSON format:
  {{output schema=RealTimeThreatAnalysisOutputSchema}}
  `,
});

const analyzeRealTimeThreatsFlow = ai.defineFlow(
  {
    name: 'analyzeRealTimeThreatsFlow',
    inputSchema: RealTimeThreatAnalysisInputSchema,
    outputSchema: RealTimeThreatAnalysisOutputSchema,
  },
  async input => {
    const {output} = await analyzeRealTimeThreatsPrompt(input);
    return output!;
  }
);
