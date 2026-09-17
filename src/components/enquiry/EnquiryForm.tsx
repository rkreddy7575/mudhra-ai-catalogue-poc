'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import QuotationPreview from './QuotationPreview';
import type { EnquiryCreateRequest, Enquiry } from '@/types';

interface EnquiryFormProps {
  productCode?: string;
  productName?: string;
  onSuccess?: () => void;
}

export default function EnquiryForm({ productCode, productName, onSuccess }: EnquiryFormProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<Enquiry | null>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState<EnquiryCreateRequest>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerCompany: '',
    customerCity: '',
    productCode: productCode || '',
    quantity: undefined,
    brandingRequired: false,
    brandingNotes: '',
    deliveryLocation: '',
  });

  const updateForm = (field: keyof EnquiryCreateRequest, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit enquiry');
      }

      const createdEnquiry = (await response.json()) as Enquiry;
      setSubmittedEnquiry(createdEnquiry);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (success && submittedEnquiry) {
    return (
      <QuotationPreview
        quotationNumber={submittedEnquiry.quotation?.quotation_number || 'MUD-QUOTE-ESTIMATE'}
        customerName={submittedEnquiry.customer?.name || form.customerName}
        companyName={submittedEnquiry.customer?.company || form.customerCompany}
        phone={submittedEnquiry.customer?.phone || form.customerPhone}
        deliveryLocation={submittedEnquiry.delivery_location || form.deliveryLocation}
        productCode={submittedEnquiry.product_code || form.productCode || 'XG-ITEM'}
        productName={submittedEnquiry.product?.name || productName}
        category={submittedEnquiry.product?.category}
        quantity={submittedEnquiry.quantity || form.quantity || 100}
        brandingRequired={!!submittedEnquiry.branding_required}
        brandingNotes={submittedEnquiry.branding_notes || form.brandingNotes}
        unitPrice={submittedEnquiry.quotation?.unit_price_inr ?? submittedEnquiry.product?.price_inr}
        subtotal={submittedEnquiry.quotation?.subtotal_inr}
        brandingCost={submittedEnquiry.quotation?.branding_inr}
        gstAmount={submittedEnquiry.quotation?.gst_inr}
        total={submittedEnquiry.quotation?.total_inr}
        isCommercialFinal={submittedEnquiry.quotation?.quote_type === 'commercial'}
        isDemo={submittedEnquiry.quotation?.is_demo ?? true}
        quoteType={submittedEnquiry.quotation?.quote_type ?? 'demo_poc'}
        onReset={() => {
          setSuccess(false);
          setSubmittedEnquiry(null);
          setStep(0);
        }}
      />
    );
  }

  const steps = [
    // Step 0: Product & Quantity
    <div key="product" className="space-y-4 animate-fade-in">
      <h3 className="font-semibold text-surface-900">Product Details</h3>
      {productName && (
        <p className="text-sm text-surface-600 bg-surface-50 rounded-xl px-3 py-2">
          Product: <strong>{productName}</strong> ({productCode})
        </p>
      )}
      {!productCode && (
        <Input
          label="Product Code"
          placeholder="e.g., XG-BT-001"
          value={form.productCode || ''}
          onChange={(e) => updateForm('productCode', e.target.value)}
        />
      )}
      <Input
        label="Quantity"
        type="number"
        placeholder="e.g., 100"
        value={form.quantity || ''}
        onChange={(e) => updateForm('quantity', parseInt(e.target.value) || undefined)}
      />
      <Button onClick={() => setStep(1)} className="w-full">
        Next: Branding
      </Button>
    </div>,

    // Step 1: Branding
    <div key="branding" className="space-y-4 animate-fade-in">
      <h3 className="font-semibold text-surface-900">Branding Requirements</h3>
      <div className="flex gap-3">
        <button
          onClick={() => updateForm('brandingRequired', true)}
          className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all
            ${form.brandingRequired
              ? 'border-brand-500 bg-brand-50 text-brand-700'
              : 'border-surface-200 text-surface-600 hover:border-surface-300'
            }`}
        >
          Yes, need branding
        </button>
        <button
          onClick={() => updateForm('brandingRequired', false)}
          className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all
            ${!form.brandingRequired
              ? 'border-brand-500 bg-brand-50 text-brand-700'
              : 'border-surface-200 text-surface-600 hover:border-surface-300'
            }`}
        >
          No branding
        </button>
      </div>
      {form.brandingRequired && (
        <Input
          label="Branding Notes"
          placeholder="Logo placement, colors, etc."
          value={form.brandingNotes || ''}
          onChange={(e) => updateForm('brandingNotes', e.target.value)}
        />
      )}
      <Input
        label="Delivery Location"
        placeholder="City / Address"
        value={form.deliveryLocation || ''}
        onChange={(e) => updateForm('deliveryLocation', e.target.value)}
      />
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setStep(0)} className="flex-1">
          Back
        </Button>
        <Button onClick={() => setStep(2)} className="flex-1">
          Next: Contact
        </Button>
      </div>
    </div>,

    // Step 2: Contact
    <div key="contact" className="space-y-4 animate-fade-in">
      <h3 className="font-semibold text-surface-900">Your Contact Details</h3>
      <Input
        label="Name *"
        placeholder="Your full name"
        value={form.customerName}
        onChange={(e) => updateForm('customerName', e.target.value)}
      />
      <Input
        label="Phone *"
        type="tel"
        placeholder="+91 XXXXX XXXXX"
        value={form.customerPhone}
        onChange={(e) => updateForm('customerPhone', e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        value={form.customerEmail || ''}
        onChange={(e) => updateForm('customerEmail', e.target.value)}
      />
      <Input
        label="Company"
        placeholder="Your company name"
        value={form.customerCompany || ''}
        onChange={(e) => updateForm('customerCompany', e.target.value)}
      />
      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!form.customerName || !form.customerPhone}
          className="flex-1"
        >
          Submit Enquiry
        </Button>
      </div>
    </div>,
  ];

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Product', 'Branding', 'Contact'].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-semibold transition-colors
                ${i <= step
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-100 text-surface-400'
                }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                i <= step ? 'text-surface-900' : 'text-surface-400'
              }`}
            >
              {label}
            </span>
            {i < 2 && (
              <div
                className={`flex-1 h-0.5 ${
                  i < step ? 'bg-brand-500' : 'bg-surface-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {steps[step]}
    </div>
  );
}
