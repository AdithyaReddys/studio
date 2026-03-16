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
import { initializeFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

const deepfakeSchema = z.object({
  mediaDataUri: z.string().min(1, 'Media data is required.'),
  fileName: z.string().min(1, 'File name is required.'),
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
    fileName: formData.get('fileName'),
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

    const { firestore } = initializeFirebase();
    const mediaResultsRef = collection(firestore, 'mediaDetectionResults');

    const record = {
      fileName: validatedFields.data.fileName,
      result: result.isDeepfake ? 'Deepfake Detected' : 'Authentic Media',
      confidence: result.confidence,
      timestamp: new Date().toISOString(),
      detectedAt: new Date().toISOString(),
      mediaType: formData.get('mediaFile') ? (formData.get('mediaFile') as File).type.split('/')[0] : 'unknown',
    };
    
    addDocumentNonBlocking(mediaResultsRef, record);

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
    
    if (result.isAdversarialAttack) {
      const { firestore } = initializeFirebase();
      const chatResultsRef = collection(firestore, 'chatDetectionResults');
      
      const record = {
        messageContent: validatedFields.data.modelInput,
        detectionResult: 'Suspicious Message',
        confidenceScore: 0.87, // Example confidence
        detectedAt: new Date().toISOString(),
        alertSeverity: 'Medium',
      };
      
      addDocumentNonBlocking(chatResultsRef, record);
    }

    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'An error occurred during scam detection.' };
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
