'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { runDeepfakeDetection } from '@/app/lib/actions';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Shield, ShieldAlert, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const initialState = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
        </>
      ) : (
        'Analyze Media'
      )}
    </Button>
  );
}

export function MediaForm() {
  const [state, formAction] = useFormState(runDeepfakeDetection, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUri, setDataUri] = useState<string>('');

  const placeholderImage = PlaceHolderImages.find(
    (img) => img.id === 'media-validation-placeholder'
  );

  useEffect(() => {
    if (state.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(URL.createObjectURL(file));
        setDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setDataUri('');
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <form ref={formRef} action={formAction}>
          <Card>
            <CardHeader>
              <CardTitle>Upload Media</CardTitle>
              <CardDescription>
                Select an image or video file to check for manipulation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="mediaFile">Media File</Label>
                  <Input
                    id="mediaFile"
                    name="mediaFile"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="file:text-foreground"
                  />
                  <input type="hidden" name="mediaDataUri" value={dataUri} />
                </div>
                {preview && (
                  <div className="relative">
                    <Image
                      src={preview}
                      alt="Media preview"
                      width={1280}
                      height={720}
                      className="rounded-lg object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/50 hover:bg-background/75"
                      onClick={handleClear}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {!preview && placeholderImage && (
                  <div className="relative aspect-video w-full">
                     <Image
                      src={placeholderImage.imageUrl}
                      alt={placeholderImage.description}
                      fill
                      data-ai-hint={placeholderImage.imageHint}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </Card>
        </form>
      </div>

      <div>
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>
              The AI's assessment of the media's authenticity will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {useFormStatus().pending && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  AI is analyzing the media... this may take a moment.
                </p>
              </div>
            )}
            {state.data && (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card-foreground/5 p-6">
                  {state.data.isDeepfake ? (
                    <ShieldAlert className="h-16 w-16 text-destructive" />
                  ) : (
                    <Shield className="h-16 w-16 text-green-500" />
                  )}
                  <Badge
                    variant={state.data.isDeepfake ? 'destructive' : 'default'}
                    className={
                      !state.data.isDeepfake
                        ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                        : ''
                    }
                  >
                    {state.data.isDeepfake
                      ? 'Deepfake Detected'
                      : 'Authentic Media'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between font-mono text-sm">
                      <span>Confidence Score</span>
                      <span>{(state.data.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={state.data.confidence * 100}
                      className={
                        state.data.isDeepfake
                          ? '[&>div]:bg-destructive'
                          : '[&>div]:bg-green-500'
                      }
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold">Explanation</h4>
                    <p className="text-sm text-muted-foreground">
                      {state.data.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!state.data && !useFormStatus().pending && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Upload a media file to begin analysis.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
