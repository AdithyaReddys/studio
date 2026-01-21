import { PageHeader } from '@/components/page-header';
import { AdversarialForm } from './adversarial-form';

export default function AdversarialDetectionPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Adversarial Attack Detection"
        description="Identify adversarial attacks on AI systems by monitoring input data and model behavior."
      />
      <AdversarialForm />
    </div>
  );
}
