'use server';

import {
  deepfakeDetectionFromMedia,
  DeepfakeDetectionFromMediaInput,
} from '@/ai/flows/deepfake-detection-from-media';
import {
  detectAdversarialAttack,
  DetectAdversarialAttackInput,
} from '@/ai/flows/adversarial-attack-detection';
import {
  analyzeRealTimeThreats,
  RealTimeThreatAnalysisInput,
} from '@/ai/flows/real-time-threat-analysis';
import { z } from 'zod';

const deepfakeSchema = z.object({
  mediaDataUri: z.string().min(1, 'Media data is required.'),
});

const adversarialSchema = z.object({
  modelInput: z.string().min(1, 'Model input is required.'),
  modelOutput: z.string().min(1, 'Model output is required.'),
  expectedBehavior: z.string().min(1, 'Expected behavior is required.'),
});

const threatAnalysisSchema = z.object({
  dataStream: z.string().min(1, 'Data stream is required.'),
});

export async function runDeepfakeDetection(
  prevState: any,
  formData: FormData
) {
  const validatedFields = deepfakeSchema.safeParse({
    mediaDataUri: formData.get('mediaDataUri'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid input. Please provide a media file.',
    };
  }

  try {
    const result = await deepfakeDetectionFromMedia(
      validatedFields.data as DeepfakeDetectionFromMediaInput
    );
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'An error occurred during deepfake detection.' };
  }
}

export async function runAdversarialDetection(
  prevState: any,
  formData: FormData
) {
  const validatedFields = adversarialSchema.safeParse({
    modelInput: formData.get('modelInput'),
    modelOutput: formData.get('modelOutput'),
    expectedBehavior: formData.get('expectedBehavior'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid input. All fields are required.',
    };
  }

  try {
    const result = await detectAdversarialAttack(
      validatedFields.data as DetectAdversarialAttackInput
    );
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'An error occurred during adversarial attack detection.' };
  }
}

export async function runThreatAnalysis(prevState: any, formData: FormData) {
  const validatedFields = threatAnalysisSchema.safeParse({
    dataStream: formData.get('dataStream'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid input. Data stream cannot be empty.',
    };
  }

  try {
    const result = await analyzeRealTimeThreats(
      validatedFields.data as RealTimeThreatAnalysisInput
    );
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'An error occurred during threat analysis.' };
  }
}
