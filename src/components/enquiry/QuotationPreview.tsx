'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatPrice, generateWhatsAppShareUrl } from '@/lib/utils';
import { companySettings } from '@/config/company';
import { Printer, MessageSquare, ArrowLeft, CheckCircle2, PhoneCall, AlertCircle, Share2 } from 'lucide-react';
import Link from 'next/link';

export interface QuotationPreviewProps {
  quotationNumber: string;
  customerName: string;
  companyName?: string;
  phone: string;
  deliveryLocation?: string;
  productCode: string;
  productName?: string;
  category?: string;
  quantity: number;
  brandingRequired: boolean;
  brandingNotes?: string;
  unitPrice?: number | null;
  subtotal?: number | null;
  brandingCost?: number | null;
  gstAmount?: number | null;
  total?: number | null;
  isCommercialFinal?: boolean;
  isDemo?: boolean;
  quoteType?: string;
  disclaimer?: string | null;
  onReset?: () => void;
}

export default function QuotationPreview({
  quotationNumber,
  customerName,
  companyName,
  phone,
  deliveryLocation,
  productCode,
  productName,
  category,
  quantity,
  brandingRequired,
  brandingNotes,
  unitPrice,
  subtotal,
  brandingCost,
  gstAmount,
  total,
  isCommercialFinal = false,
  isDemo = false,
  quoteType,
  disclaimer,
  onReset,
}: QuotationPreviewProps) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const isDemoQuote = isDemo || quoteType === 'demo_poc';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      {isDemoQuote ? (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-amber-950 uppercase tracking-wide text-xs sm:text-sm">
              POC DEMO QUOTATION — NOT A COMMERCIAL QUOTE
            </p>
            <p className="text-amber-800 mt-1 text-xs sm:text-sm leading-relaxed">
              Prices shown are sample/demo prices for testing only and are not official Mudhra Branding Solutions prices.
            </p>
          </div>
        </div>
      ) : (
        <div className={`border rounded-2xl p-4 flex items-center gap-3 ${
          isCommercialFinal
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          {isCommercialFinal ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          )}
          <div className="text-sm">
            <p className={`font-semibold ${isCommercialFinal ? 'text-emerald-900' : 'text-amber-900'}`}>
              {isCommercialFinal ? 'Commercial Quotation' : 'Provisional Enquiry Acknowledgement'}
            </p>
            <p className={isCommercialFinal ? 'text-emerald-700' : 'text-amber-700'}>
              {isCommercialFinal
                ? 'This commercial quote has been verified and confirmed.'
                : 'Pricing and branding charges are currently under review. This is an enquiry summary and not a final commercial quotation.'}
            </p>
          </div>
        </div>
      )}

      {/* Quotation Document Card */}
      <div className="bg-white border border-surface-200 rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-surface-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                M
              </span>
              <h2 className="font-display font-bold text-xl text-surface-900">
                {companySettings.name}
              </h2>
            </div>
            <p className="text-xs text-surface-500">
              {companySettings.tagline}
            </p>
            {(companySettings.email || companySettings.website) && (
              <p className="text-xs text-surface-500 mt-1">
                {[
                  companySettings.email ? `Email: ${companySettings.email}` : null,
                  companySettings.website ? `Web: ${companySettings.website}` : null,
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right">
            <Badge
              variant={isDemoQuote ? 'warning' : isCommercialFinal ? 'success' : 'warning'}
              className="text-xs font-mono font-bold"
            >
              {quotationNumber}
            </Badge>
            <div className="mt-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-surface-500">
                {isDemoQuote
                  ? 'POC Demo Quote'
                  : isCommercialFinal
                  ? 'Confirmed Quotation'
                  : 'Provisional Request'}
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-1">Date: <strong>{currentDate}</strong></p>
            <p className="text-xs text-surface-400">
              {isDemoQuote
                ? 'Validity: 15 days (PoC Demo)'
                : 'Validity: Subject to stock and commercial confirmation'}
            </p>
          </div>
        </div>

        {/* Client & Product Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="bg-surface-50 rounded-xl p-4 space-y-1.5">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Enquiry Contact
            </span>
            <p className="font-semibold text-surface-900">{customerName || 'Corporate Client'}</p>
            {companyName && <p className="text-surface-600">Company: {companyName}</p>}
            <p className="text-surface-600">Phone: {phone}</p>
            {deliveryLocation && (
              <p className="text-surface-600">Delivery: {deliveryLocation}</p>
            )}
          </div>

          <div className="bg-surface-50 rounded-xl p-4 space-y-1.5">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Product Requirements
            </span>
            <p className="font-semibold text-surface-900">
              Code: {productCode} {productName ? `— ${productName}` : ''}
            </p>
            {category && <p className="text-surface-600">Category: {category}</p>}
            <p className="text-surface-600">Quantity: <strong>{quantity} units</strong></p>
            <p className="text-surface-600">
              Branding Required: <strong>{brandingRequired ? 'Yes (Custom logo / print)' : 'No (Plain stock)'}</strong>
            </p>
            {brandingNotes && (
              <p className="text-xs text-surface-500 italic mt-1">Branding Notes: "{brandingNotes}"</p>
            )}
          </div>
        </div>

        {/* Pricing Table */}
        <div className="border border-surface-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-100 text-surface-700 text-xs uppercase font-semibold">
              <tr>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">{isDemoQuote ? 'Demo Unit Rate' : 'Unit Rate'}</th>
                <th className="p-3 text-right">{isDemoQuote ? 'Demo Amount (INR)' : 'Amount (INR)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              <tr>
                <td className="p-3">
                  <div className="font-medium text-surface-900">{productCode}</div>
                  <div className="text-xs text-surface-500">{category || 'Catalogue Merchandise'}</div>
                </td>
                <td className="p-3 text-center">{quantity}</td>
                <td className="p-3 text-right text-surface-600">
                  {unitPrice ? formatPrice(unitPrice) : 'Price not available'}
                </td>
                <td className="p-3 text-right font-medium text-surface-900">
                  {subtotal ? formatPrice(subtotal) : 'Price not available'}
                </td>
              </tr>

              {brandingRequired && (
                <tr>
                  <td className="p-3">
                    <div className="font-medium text-surface-900">Custom Corporate Logo Branding</div>
                    <div className="text-xs text-surface-500">
                      {brandingNotes || 'Technique (screen print / laser / embossing) pending artwork confirmation'}
                    </div>
                  </td>
                  <td className="p-3 text-center">{quantity}</td>
                  <td className="p-3 text-right text-surface-600">
                    {brandingCost ? formatPrice(brandingCost / quantity) : 'Pending specs'}
                  </td>
                  <td className="p-3 text-right font-medium text-surface-900">
                    {brandingCost ? formatPrice(brandingCost) : 'To be quoted'}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-surface-50 font-medium">
              {subtotal != null && (
                <>
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-surface-600">
                      {isDemoQuote ? 'Demo Subtotal:' : 'Subtotal:'}
                    </td>
                    <td className="p-3 text-right text-surface-900">
                      {formatPrice((subtotal || 0) + (brandingCost || 0))}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-surface-600">
                      {isDemoQuote ? 'Demo GST (18%):' : 'Applicable GST:'}
                    </td>
                    <td className="p-3 text-right text-surface-900">
                      {gstAmount != null ? formatPrice(gstAmount) : 'Subject to final commercial invoice'}
                    </td>
                  </tr>
                </>
              )}
              <tr className="border-t-2 border-surface-300">
                <td colSpan={3} className="p-3 text-right font-bold text-surface-900 text-base">
                  {isDemoQuote
                    ? 'POC Demo Total (INR):'
                    : isCommercialFinal
                    ? 'Total Amount (INR):'
                    : 'Estimated Commercial Total:'}
                </td>
                <td className="p-3 text-right font-bold text-primary-700 text-base">
                  {total != null ? formatPrice(total) : 'Pending Commercial Confirmation'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Commercial / PoC Notice */}
        {isDemoQuote ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-950 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-amber-900 uppercase">
              ⚠️ POC Demo Testing Notice & Disclaimers
            </p>
            <p>
              1. <strong>Demo Pricing:</strong> All unit rates, branding charges, and totals shown are mock values generated deterministically for testing and do NOT reflect official catalogue prices.
            </p>
            <p>
              2. <strong>Not a Commercial Offer:</strong> This document is strictly for demonstration purposes. Official prices must be confirmed by the Mudhra sales team.
            </p>
          </div>
        ) : (
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 text-xs text-surface-600 space-y-1">
            <p className="font-semibold text-surface-900">
              ⚠️ Commercial Notice & Terms
            </p>
            <p>
              1. <strong>Catalogue Pricing:</strong> Product prices are not confirmed in the preliminary catalogue and are finalized upon batch availability and order quantity.
            </p>
            <p>
              2. <strong>Branding Charges:</strong> Custom branding fees depend on vector artwork complexity, color count, and printing method (Screen, Laser, UV, or Emboss).
            </p>
            <p>
              3. <strong>Commercial Status:</strong> This document is a preliminary enquiry acknowledgement. It is <strong>NOT a final commercial quotation</strong> until signed and confirmed by the Mudhra sales team.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save
          </Button>

          {onReset && (
            <Button variant="ghost" onClick={onReset}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              New Enquiry
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* WhatsApp Quote Share */}
          <a
            href={generateWhatsAppShareUrl({
              phone: companySettings.phone || phone,
              text: `Hello ${companySettings.name},\n\nHere is my enquiry / demo quotation for corporate gifting:\n\n📄 Quote Ref: ${quotationNumber}\n📦 Product: ${productCode} - ${productName || 'Gifting Product'}\n🔢 Quantity: ${quantity} units\n🎨 Branding: ${brandingRequired ? `Yes (${brandingNotes || 'Custom'})` : 'No branding'}\n📍 Delivery: ${deliveryLocation || 'Not specified'}\n${total ? `💰 Estimated Total: ₹${total.toLocaleString('en-IN')}` : ''}\n\nPlease confirm product availability and official commercial quote. Thank you!`,
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <Share2 className="w-4 h-4 mr-1.5" />
              Send to WhatsApp
            </Button>
          </a>

          <Link href="/chat">
            <Button variant="secondary">
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Chat with AI
            </Button>
          </Link>
          {companySettings.phone ? (
            <a href={`tel:${companySettings.phone}`}>
              <Button variant="secondary">
                <PhoneCall className="w-4 h-4 mr-1.5" />
                Call Desk
              </Button>
            </a>
          ) : (
            <Link href="/chat">
              <Button variant="secondary">
                <PhoneCall className="w-4 h-4 mr-1.5" />
                Contact Team
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
