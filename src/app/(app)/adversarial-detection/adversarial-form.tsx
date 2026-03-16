'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useActionState, useState } from 'react';
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

const initialState = {
  data: null,
  error: null,
};

const sampleAdversarialData = {
  modelInput: `A photo of a stop sign with a small, almost invisible sticker on it.`,
  modelOutput: `The model identifies the image as a "Speed Limit 80" sign.`,
  expectedBehavior: `The model should have identified the image as a "Stop Sign".`,
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
        'Detect Attack'
      )}
    </Button>
  );
}

export function AdversarialForm() {
  const [state, formAction] = useActionState(
    runAdversarialDetection,
    initialState
  );
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [modelInput, setModelInput] = useState('');
  const [modelOutput, setModelOutput] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');

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
      setModelOutput('');
      setExpectedBehavior('');
    }
  }, [state, toast]);

  const loadSampleData = () => {
    setModelInput(sampleAdversarialData.modelInput);
    setModelOutput(sampleAdversarialData.modelOutput);
    setExpectedBehavior(sampleAdversarialData.expectedBehavior);
  };

  return (
    <form ref={formRef} action={formAction}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Attack Parameters</CardTitle>
              <CardDescription>
                Provide the AI model's input, output, and its expected behavior
                to check for adversarial manipulation.
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
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="modelInput">Model Input</Label>
              <Textarea
                id="modelInput"
                name="modelInput"
                placeholder="Enter the input provided to the model..."
                className="h-32"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelOutput">Model Output</Label>
              <Textarea
                id="modelOutput"
                name="modelOutput"
                placeholder="Enter the actual output from the model..."
                className="h-32"
                value={modelOutput}
                onChange={(e) => setModelOutput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedBehavior">Expected Behavior</Label>
              <Textarea
                id="expectedBehavior"
                name="expectedBehavior"
                placeholder="Describe the model's expected behavior..."
                className="h-32"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
              />
            </div>
          </div>
          {useFormStatus().pending && (
            <div className="flex flex-col items-center justify-center space-y-4 pt-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                AI is analyzing the model behavior...
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
                  ? 'Adversarial Attack Detected'
                  : 'No Attack Detected'}
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
