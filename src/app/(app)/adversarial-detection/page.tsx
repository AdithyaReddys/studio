import { PageHeader } from '@/components/page-header';
import { AdversarialForm } from './adversarial-form';

export default function AdversarialDetectionPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Scam Chat Detection"
        description="This module checks messages for malicious patterns and scam attempts."
      />
      <AdversarialForm />
    </div>
  );
}
