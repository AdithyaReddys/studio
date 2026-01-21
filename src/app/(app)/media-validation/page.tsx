import { PageHeader } from '@/components/page-header';
import { MediaForm } from './media-form';

export default function MediaValidationPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Media Authenticity Validation"
        description="Analyze media content to detect deepfakes using advanced AI models."
      />
      <MediaForm />
    </div>
  );
}
