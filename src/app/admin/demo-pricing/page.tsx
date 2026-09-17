'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, CheckCircle2, ShieldAlert, Sparkles, Tag } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { DEMO_PRICING_CONFIG } from '@/config/demo-pricing.config';
import { getDemoProductPrice, calculateDemoBrandingCost } from '@/services/demo-pricing.service';
import { calculateQuotation } from '@/services/quotation.service';
import { formatPrice } from '@/lib/utils';

export default function DemoPricingAdminPage() {
  const [testCode, setTestCode] = useState('XG-BT-001');
  const [testQuantity, setTestQuantity] = useState(100);
  const [testBranding, setTestBranding] = useState('logo_printing');

  // Compute test quotation dynamically
  let testQuote = null;
  let testError = null;

  try {
    testQuote = calculateQuotation({
      productCode: testCode,
      quantity: testQuantity,
      brandingType: testBranding,
      useDemoPricing: true,
    });
  } catch (err: any) {
    testError = err?.message || 'Calculation error';
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-surface-500 hover:text-surface-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Admin Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-2xl text-surface-900">
              Demo Pricing Configuration (PoC)
            </h1>
            <Badge variant="warning" className="px-3 py-1 font-semibold">
              Demo Mode Active
            </Badge>
          </div>
          <p className="text-sm text-surface-500 mt-1">
            Deterministic mock pricing rules, category ranges, and branding charges for PoC quotation simulation.
          </p>
        </div>
      </div>

      {/* Safety & Integrity Notice */}
      <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm space-y-1">
          <p className="font-bold text-amber-950 uppercase tracking-wide text-xs sm:text-sm">
            PRODUCTION DATA INTEGRITY SAFEGUARD
          </p>
          <p className="text-amber-900 leading-relaxed">
            All 299 production product records in Supabase remain strictly <code>price_inr = NULL</code>.
            Demo pricing is evaluated deterministically in-memory by product code and is <strong>never written to the production products table</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Category Ranges & Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Category Ranges Table */}
          <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-brand-600" />
              <h2 className="font-display font-bold text-lg text-surface-900">
                Category Price Ranges
              </h2>
            </div>
            <p className="text-xs text-surface-500 mb-4">
              Product codes deterministically map to rounded retail intervals (₹99, ₹149, ₹199, ₹299, etc.) within each category range.
            </p>

            <div className="border border-surface-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-50 text-surface-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Min Price</th>
                    <th className="p-3 text-right">Max Price</th>
                    <th className="p-3 text-center">Rounding Steps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {Object.entries(DEMO_PRICING_CONFIG.categoryRanges).map(([cat, range]) => (
                    <tr key={cat} className="hover:bg-surface-50/50 transition-colors">
                      <td className="p-3 font-medium text-surface-900">{cat}</td>
                      <td className="p-3 text-right text-surface-700 font-mono">₹{range.min}</td>
                      <td className="p-3 text-right text-surface-700 font-mono">₹{range.max}</td>
                      <td className="p-3 text-center text-xs text-surface-500">
                        {range.max < 100 ? 'Steps of ₹10 (9s)' : range.max <= 1000 ? 'Steps of ₹50 (49/99)' : 'Steps of ₹100 (99s)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Branding Charges Table */}
          <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="font-display font-bold text-lg text-surface-900">
                Configured Demo Branding Rates
              </h2>
            </div>

            <div className="border border-surface-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-50 text-surface-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3">Branding Method</th>
                    <th className="p-3">Rate (INR / Unit)</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {Object.entries(DEMO_PRICING_CONFIG.brandingCharges).map(([key, opt]) => (
                    <tr key={key} className="hover:bg-surface-50/50 transition-colors">
                      <td className="p-3 font-medium text-surface-900">{opt.name}</td>
                      <td className="p-3 font-mono text-brand-600 font-bold">
                        {opt.ratePerUnit === 0 ? '₹0 (Free)' : `₹${opt.ratePerUnit} / unit`}
                      </td>
                      <td className="p-3 text-xs text-surface-500">{opt.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax & Terms Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1">
                Configured GST Rate
              </h3>
              <p className="text-2xl font-bold text-surface-900 font-mono">
                {Math.round(DEMO_PRICING_CONFIG.gstRate * 100)}%
              </p>
              <p className="text-xs text-surface-400 mt-1">
                Configurable in <code>demo-pricing.config.ts</code>
              </p>
            </div>
            <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1">
                Demo Quote Validity
              </h3>
              <p className="text-2xl font-bold text-surface-900 font-mono">
                {DEMO_PRICING_CONFIG.validityDays} Days
              </p>
              <p className="text-xs text-surface-400 mt-1">
                Subject to stock and commercial confirmation
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Demo Quotation Sandbox */}
        <div className="space-y-6">
          <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-100">
              <Calculator className="w-5 h-5 text-brand-600" />
              <h2 className="font-display font-bold text-lg text-surface-900">
                Live Pricing Sandbox
              </h2>
            </div>
            <p className="text-xs text-surface-500 mb-4">
              Test deterministic demo pricing calculation for any product code and order quantity.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 uppercase mb-1">
                  Product Code
                </label>
                <input
                  type="text"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder="e.g. XG-BT-001, XG-MG-004, XG-GS-059"
                  className="w-full px-3 py-2 text-sm border border-surface-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 uppercase mb-1">
                  Quantity
                </label>
                <div className="flex gap-2 mb-2">
                  {[50, 100, 250, 500].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setTestQuantity(qty)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                        testQuantity === qty
                          ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                          : 'border-surface-200 text-surface-600 hover:bg-surface-50'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={testQuantity}
                  onChange={(e) => setTestQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-sm border border-surface-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 uppercase mb-1">
                  Branding Method
                </label>
                <select
                  value={testBranding}
                  onChange={(e) => setTestBranding(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-surface-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  <option value="none">No Branding (₹0)</option>
                  <option value="logo_printing">Logo Printing (+₹10/unit)</option>
                  <option value="engraving">Laser Engraving (+₹15/unit)</option>
                  <option value="premium">Premium 3D / Foil (+₹20/unit)</option>
                </select>
              </div>

              {testError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {testError}
                </div>
              )}

              {testQuote && !testError && (
                <div className="mt-4 p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-surface-200">
                    <span className="font-semibold text-surface-700">Category Detected</span>
                    <span className="font-medium text-surface-900">{testQuote.category || 'General'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600">Demo Unit Price</span>
                    <span className="font-mono font-bold text-surface-900">
                      {testQuote.unitPrice ? formatPrice(testQuote.unitPrice) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600">
                      Demo Product Subtotal ({testQuote.quantity} units)
                    </span>
                    <span className="font-mono text-surface-900">
                      {testQuote.subtotal ? formatPrice(testQuote.subtotal) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600">
                      Demo Branding ({testQuote.brandingType})
                    </span>
                    <span className="font-mono text-surface-900">
                      {testQuote.brandingCost ? formatPrice(testQuote.brandingCost) : '₹0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600">Demo GST (18%)</span>
                    <span className="font-mono text-surface-900">
                      {testQuote.gstAmount ? formatPrice(testQuote.gstAmount) : 'N/A'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-surface-200 flex justify-between items-center text-sm font-bold">
                    <span className="text-surface-900">Demo Total</span>
                    <span className="font-mono text-brand-700">
                      {testQuote.total ? formatPrice(testQuote.total) : 'N/A'}
                    </span>
                  </div>

                  <div className="pt-2 text-[10px] text-surface-400 italic">
                    ⚠️ Deterministic PoC calculation for testing only.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
