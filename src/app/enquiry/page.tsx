import type { Metadata } from 'next';
import EnquiryForm from '@/components/enquiry/EnquiryForm';

export const metadata: Metadata = {
  title: 'Send Enquiry — Mudhra Branding Solutions',
  description: 'Submit a product enquiry. Our sales team will respond with a quotation.',
};

export default function EnquiryPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-2xl text-surface-900 mb-2">
          Send Enquiry
        </h1>
        <p className="text-sm text-surface-500">
          Tell us what you need and our sales team will get back to you with a quotation.
        </p>
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white p-6 shadow-sm">
        <EnquiryForm />
      </div>
    </div>
  );
}
