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
  Activity,
  AlertTriangle,
  BarChart,
  ShieldCheck,
  Video,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from 'recharts';

const chartData = [
  { month: 'January', threats: 186 },
  { month: 'February', threats: 305 },
  { month: 'March', threats: 237 },
  { month: 'April', threats: 73 },
  { month: 'May', threats: 209 },
  { month: 'June', threats: 214 },
];

const chartConfig = {
  threats: {
    label: 'Threats',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

const mockAlerts = [
  {
    threatType: 'Anomalous Login Attempt',
    priority: 'High',
    description:
      'Detected a login attempt from an unrecognized IP address (192.168.1.100) outside of normal operating hours.',
    confidenceLevel: 0.95,
  },
  {
    threatType: 'Potential Data Exfiltration',
    priority: 'Medium',
    description:
      'Unusually large data transfer (5GB) observed from server DB-01 to an external endpoint.',
    confidenceLevel: 0.78,
  },
  {
    threatType: 'Suspicious File Modification',
    priority: 'Low',
    description:
      'A system configuration file (/etc/config.conf) was modified by a non-standard user process.',
    confidenceLevel: 0.62,
  },
];

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Dashboard"
        description="Overview of system activity and security status."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alerts (24h)
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +1 since last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Media Scanned
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,257</div>
            <p className="text-xs text-muted-foreground">
              +89 in the last day
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Analysis</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 running</div>
            <p className="text-xs text-muted-foreground">
              Real-time data streams
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Threats Overview</CardTitle>
            <CardDescription>Monthly detected threats.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsBarChart accessibilityLayer data={chartData}>
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
                  dataKey="threats"
                  fill="var(--color-threats)"
                  radius={4}
                />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              Prioritized list of recent potential threats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAlerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-4">
                <AlertTriangle
                  className={`mt-1 h-5 w-5 shrink-0 ${
                    alert.priority === 'High'
                      ? 'text-red-500'
                      : alert.priority === 'Medium'
                      ? 'text-yellow-500'
                      : 'text-blue-500'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{alert.threatType}</p>
                    <Badge
                      variant={
                        alert.priority === 'High'
                          ? 'destructive'
                          : alert.priority === 'Medium'
                          ? 'secondary'
                          : 'outline'
                      }
                      className={
                        alert.priority === 'Medium'
                          ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                          : ''
                      }
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
