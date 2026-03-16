'use client';

import { useFormStatus, useActionState } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { runAdversarialDetection } from '@/app/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Loader2, ShieldAlert } from 'lucide-react';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

const initialState = {
  data: null,
  error: null,
};

const sampleScamData = {
  modelInput: `Congratulations! You've won a $1,000 gift card. Click this link to claim your prize: http://bit.ly/totally-safe-link`,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Detecting...
        </>
      ) : (
        'Detect Scam'
      )}
    </Button>
  );
}

export function AdversarialForm() {
  const [state, formAction] = useActionState(runAdversarialDetection, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [modelInput, setModelInput] = useState('');
  const { firestore } = useFirebase();

  useEffect(() => {
    if (state.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
    if (state.data) {
      formRef.current?.reset();
      setModelInput('');
      if (state.data.isAdversarialAttack && firestore) {
        const chatResultsRef = collection(firestore, 'chatDetectionResults');
        const record = {
          messageContent: state.data.modelInput,
          detectionResult: 'Suspicious Message',
          confidenceScore: 0.87, // Example confidence
          detectedAt: new Date().toISOString(),
          alertSeverity: 'Medium',
        };
        addDocumentNonBlocking(chatResultsRef, record);
      }
    }
  }, [state, toast, firestore]);

  const loadSampleData = () => {
    setModelInput(sampleScamData.modelInput);
  };

  return (
    <form ref={formRef} action={formAction}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Message Input</CardTitle>
              <CardDescription>
                Enter a message to check it for malicious patterns or scam
                attempts.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleData}
              type="button"
            >
              Use Sample
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modelInput">Chat Message</Label>
            <Textarea
              id="modelInput"
              name="modelInput"
              placeholder="Enter the message you want to analyze..."
              className="h-32"
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
            />
             <input type="hidden" name="modelOutput" value="N/A" />
            <input type="hidden" name="expectedBehavior" value="N/A" />
          </div>
          {useFormStatus().pending && (
            <div className="flex flex-col items-center justify-center space-y-4 pt-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                AI is analyzing the message...
              </p>
            </div>
          )}

          {state.data && (
            <Alert
              variant={
                state.data.isAdversarialAttack ? 'destructive' : 'default'
              }
              className={
                !state.data.isAdversarialAttack ? 'border-green-500' : ''
              }
            >
              {state.data.isAdversarialAttack ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}

              <AlertTitle>
                {state.data.isAdversarialAttack
                  ? 'Suspicious Message Detected'
                  : 'Message Appears Safe'}
              </AlertTitle>
              <AlertDescription>{state.data.explanation}</AlertDescription>
            </Alert>
          )}

          {!state.data && !useFormStatus().pending && (
            <div className="flex flex-col items-center justify-center space-y-4 pt-8 text-center rounded-lg border-2 border-dashed h-40">
              <Bot className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                Results will be displayed here.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
