'use client';

import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  ShieldCheck,
  FileScan,
  MessageSquareWarning,
  Loader2,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from 'recharts';
import { useFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';

const chartConfig = {
  deepfake: {
    label: 'Deepfake',
    color: 'hsl(var(--destructive))',
  },
  authentic: {
    label: 'Authentic',
    color: 'hsl(var(--primary))',
  },
  scam: {
    label: 'Scam',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { firestore } = useFirebase();

  const mediaResultsRef = useMemo(
    () => (firestore ? collection(firestore, 'mediaDetectionResults') : null),
    [firestore]
  );
  const chatResultsRef = useMemo(
    () => (firestore ? collection(firestore, 'chatDetectionResults') : null),
    [firestore]
  );

  const { data: mediaResults, isLoading: mediaLoading } =
    useCollection(mediaResultsRef as any);
  const { data: chatResults, isLoading: chatLoading } =
    useCollection(chatResultsRef as any);

  const stats = useMemo(() => {
    const media = mediaResults || [];
    const chats = chatResults || [];

    const deepfakeCount = media.filter(
      (r) => (r as any).detectionResult === 'Deepfake Detected'
    ).length;
    const authenticCount = media.filter(
      (r) => (r as any).detectionResult !== 'Deepfake Detected'
    ).length;
    const scamCount = chats.length;
    const totalScanned = media.length;

    const monthlyData: { [key: string]: any } = {};

    [...media, ...chats].forEach((record: any) => {
      const date = new Date(record.detectedAt);
      const month = date.toLocaleString('default', { month: 'long' });

      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          deepfake: 0,
          authentic: 0,
          scam: 0,
        };
      }
      if (record.mediaFileName) {
        // It's a media record
        if (record.detectionResult === 'Deepfake Detected') {
          monthlyData[month].deepfake++;
        } else {
          monthlyData[month].authentic++;
        }
      } else {
        // It's a chat record
        monthlyData[month].scam++;
      }
    });

    const chartData = Object.values(monthlyData);

    return {
      deepfakeCount,
      authenticCount,
      scamCount,
      totalScanned,
      chartData,
    };
  }, [mediaResults, chatResults]);

  const isLoading = mediaLoading || chatLoading;

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Dashboard"
        description="Overview of system activity and security status."
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  System Status
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Online</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Deepfakes Detected
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.deepfakeCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total deepfakes identified
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Media Scanned
                </CardTitle>
                <FileScan className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalScanned}</div>
                <p className="text-xs text-muted-foreground">
                  Images and videos analyzed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Scam Chats Detected
                </CardTitle>
                <MessageSquareWarning className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.scamCount}</div>
                <p className="text-xs text-muted-foreground">
                  Malicious messages found
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Detections Overview</CardTitle>
                <CardDescription>
                  Monthly summary of detection results.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer
                  config={chartConfig}
                  className="h-[350px] w-full"
                >
                  <RechartsBarChart
                    accessibilityLayer
                    data={stats.chartData}
                  >
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar
                      dataKey="deepfake"
                      stackId="a"
                      fill="var(--color-deepfake)"
                      radius={[0, 0, 4, 4]}
                    />
                    <Bar
                      dataKey="authentic"
                      stackId="a"
                      fill="var(--color-authentic)"
                      radius={[4, 4, 0, 0]}
                    />
                     <Bar
                      dataKey="scam"
                      fill="var(--color-scam)"
                      radius={4}
                    />
                  </RechartsBarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
