'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import type { Product, PaginatedResponse } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '50',
        active: 'true',
      });
      if (statusFilter) params.set('dataStatus', statusFilter);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data: PaginatedResponse<Product> = await res.json();
      setProducts(data.data);
      setTotal(data.total);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter]);

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
          Products ({total})
        </h1>
        <Link href="/admin/import">
          <button className="rounded-xl bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 transition-colors">
            Import CSV
          </button>
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {['', 'needs_review', 'verified', 'archived'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors
              ${statusFilter === s ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-400 animate-pulse-soft">Loading...</div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Import the catalogue CSV to populate products."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-surface-200/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-left text-surface-500 text-xs font-medium uppercase tracking-wider">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/product/${p.code}`}
                      className="font-mono text-xs text-brand-600 hover:underline"
                    >
                      {p.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-surface-600">{p.category}</td>
                  <td className="px-4 py-3 text-surface-900">{p.name || '—'}</td>
                  <td className="px-4 py-3 text-surface-600">{p.material || '—'}</td>
                  <td className="px-4 py-3 text-surface-600">
                    {p.price_inr !== null ? `₹${p.price_inr}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-surface-500">{p.source_page || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        p.data_status === 'VERIFIED_FROM_CATALOGUE' || p.data_status === 'verified'
                          ? 'success'
                          : p.data_status === 'NEEDS_MANUAL_REVIEW' || p.data_status === 'needs_review'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {p.data_status}
                    </Badge>
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
