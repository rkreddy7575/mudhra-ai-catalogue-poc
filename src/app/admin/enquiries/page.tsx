'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Badge, { statusBadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import type { Enquiry, PaginatedResponse, EnquiryStatus } from '@/types';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/enquiries?${params.toString()}`);
      const data: PaginatedResponse<Enquiry> = await res.json();
      setEnquiries(data.data);
      setTotal(data.total);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: EnquiryStatus) => {
    try {
      await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchEnquiries();
    } catch {
      // Handle error
    }
  };

  const statuses: EnquiryStatus[] = ['new', 'contacted', 'quoted', 'closed', 'cancelled'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-600 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-surface-900">
          Enquiries ({total})
        </h1>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors
            ${!statusFilter ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
        >
          All
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors
              ${statusFilter === s ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-400 animate-pulse-soft">Loading...</div>
      ) : enquiries.length === 0 ? (
        <EmptyState title="No enquiries yet" description="Enquiries submitted by customers will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-surface-200/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-left text-surface-500 text-xs font-medium uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Quotation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {enquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3 text-surface-600">
                    {new Date(enq.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-surface-900">
                      {(enq.customer as { name?: string })?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-surface-500">
                      {(enq.customer as { phone?: string })?.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-600">
                    {enq.product_code || '—'}
                  </td>
                  <td className="px-4 py-3 text-surface-600">{enq.quantity || '—'}</td>
                  <td className="px-4 py-3">
                    {enq.quotation?.quotation_number ? (
                      <div>
                        <span className="font-mono text-xs font-semibold text-surface-800">
                          {enq.quotation.quotation_number}
                        </span>
                        <div className="text-xs text-emerald-600 font-medium">
                          {enq.quotation.total_inr ? `₹${enq.quotation.total_inr.toLocaleString('en-IN')}` : 'Estimate'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-surface-400 italic">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(enq.status)}>
                      {enq.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={enq.status}
                      onChange={(e) => updateStatus(enq.id, e.target.value as EnquiryStatus)}
                      className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:border-brand-400 focus:outline-none"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
