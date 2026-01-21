import { PageHeader } from '@/components/page-header';
import { ThreatAnalysisForm } from './threat-form';

export default function ThreatAnalysisPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Real-time Threat Analysis"
        description="Analyze real-time data streams for potential threats and malicious activities."
      />
      <ThreatAnalysisForm />
    </div>
  );
}
