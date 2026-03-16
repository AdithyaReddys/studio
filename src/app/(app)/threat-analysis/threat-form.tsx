'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useActionState, useState } from 'react';
import { runThreatAnalysis } from '@/app/lib/actions';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BarChart, FileText, Loader2 } from 'lucide-react';

const initialState = {
  data: null,
  error: null,
};

const sampleLogData = `[2024-07-29 10:00:01] INFO: User 'admin' logged in from 192.168.1.1
[2024-07-29 10:02:30] WARN: Failed login attempt for user 'root' from 203.0.113.55
[2024-07-29 10:02:35] WARN: Failed login attempt for user 'root' from 203.0.113.55
[2024-07-29 10:02:40] WARN: Failed login attempt for user 'root' from 203.0.113.55
[2024-07-29 10:03:00] ERROR: Multiple failed login attempts detected for user 'root'. Locking account.
[2024-07-29 10:05:15] INFO: Starting data transfer of 5.2GB from server 'prod-db-01' to 'external-archive.com'
[2024-07-29 10:06:00] INFO: File '/etc/system/config.xml' modified by process 'unusual_proc_78'`;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Stream...
        </>
      ) : (
        'Analyze Data Stream'
      )}
    </Button>
  );
}

export function ThreatAnalysisForm() {
  const [state, formAction] = useActionState(runThreatAnalysis, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [dataStream, setDataStream] = useState('');

  useEffect(() => {
    if (state.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <form ref={formRef} action={formAction}>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Data Stream Input</CardTitle>
                  <CardDescription>
                    Paste your data stream (e.g., logs, network traffic) below.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDataStream(sampleLogData)}
                  type="button"
                >
                  Use Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Label htmlFor="dataStream" className="sr-only">
                Data Stream
              </Label>
              <Textarea
                id="dataStream"
                name="dataStream"
                placeholder="Paste data here..."
                className="h-64"
                value={dataStream}
                onChange={(e) => setDataStream(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </Card>
        </form>
      </div>

      <div className="lg:col-span-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Threat Report</CardTitle>
            <CardDescription>
              A prioritized report of potential threats will be shown here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {useFormStatus().pending && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-16 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  AI is analyzing the data stream...
                </p>
              </div>
            )}
            {state.data && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {state.data.summary}
                    </p>
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  {state.data.report.map((threat, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="flex items-center gap-3 text-lg">
                            <AlertTriangle
                              className={`h-6 w-6 ${
                                threat.priority === 'High'
                                  ? 'text-destructive'
                                  : threat.priority === 'Medium'
                                  ? 'text-yellow-500'
                                  : 'text-primary'
                              }`}
                            />
                            {threat.threatType}
                          </CardTitle>
                          <Badge
                            variant={
                              threat.priority === 'High'
                                ? 'destructive'
                                : threat.priority === 'Medium'
                                ? 'secondary'
                                : 'default'
                            }
                            className={
                              threat.priority === 'Medium'
                                ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50'
                                : threat.priority === 'Low'
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : ''
                            }
                          >
                            {threat.priority} Priority
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {threat.description}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <p className="text-xs font-mono text-muted-foreground">
                          Confidence: {(threat.confidenceLevel * 100).toFixed(0)}%
                        </p>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {!state.data && !useFormStatus().pending && (
              <div className="flex flex-col items-center justify-center space-y-4 pt-16 text-center rounded-lg border-2 border-dashed h-80">
                <BarChart className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Threat report will be generated here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
