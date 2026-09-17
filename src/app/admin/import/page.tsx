'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { ImportResult } from '@/types';

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Import failed');
      }

      const data: ImportResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-600 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to Admin
      </Link>

      <h1 className="font-display font-bold text-2xl text-surface-900 mb-2">
        Import Products
      </h1>
      <p className="text-sm text-surface-500 mb-8">
        Upload the product CSV from the catalogue extraction. Existing products will be updated (upsert by code).
      </p>

      {/* File upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="rounded-2xl border-2 border-dashed border-surface-300 bg-surface-50 p-12 text-center cursor-pointer
          hover:border-brand-400 hover:bg-brand-50/30 transition-all"
      >
        <Upload size={36} className="mx-auto text-surface-400 mb-4" />
        <p className="text-sm font-medium text-surface-700">
          {file ? file.name : 'Click to select CSV file'}
        </p>
        <p className="text-xs text-surface-400 mt-1">
          Expected format: code, category, source_page, name, description, material, capacity, colors, price_inr, image_path, data_status
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
      </div>

      {file && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-50 border border-surface-200 p-3">
          <FileText size={18} className="text-surface-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-surface-900">{file.name}</p>
            <p className="text-xs text-surface-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button onClick={handleUpload} loading={loading} size="sm">
            Import
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 rounded-2xl border border-surface-200/60 bg-white p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-emerald-500" />
            <h3 className="font-semibold text-surface-900">Import Complete</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <div className="text-lg font-bold text-emerald-700">{result.imported}</div>
              <div className="text-xs text-emerald-600">Imported</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <div className="text-lg font-bold text-amber-700">{result.skipped}</div>
              <div className="text-xs text-amber-600">Skipped</div>
            </div>
            <div className="rounded-xl bg-surface-50 p-3 text-center">
              <div className="text-lg font-bold text-surface-700">{result.total}</div>
              <div className="text-xs text-surface-500">Total Rows</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-surface-700 mb-2">Errors:</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                    Row {err.row}{err.code ? ` (${err.code})` : ''}: {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 rounded-2xl bg-surface-50 border border-surface-200/60 p-6">
        <h3 className="font-semibold text-surface-900 mb-3">Instructions</h3>
        <ol className="space-y-2 text-sm text-surface-600 list-decimal list-inside">
          <li>Use the CSV from <code className="bg-surface-200 rounded px-1 text-xs">mudhra-poc-kit/data/products.csv</code></li>
          <li>Products are matched by their <code className="bg-surface-200 rounded px-1 text-xs">code</code> column (upsert)</li>
          <li>All imported products start with <code className="bg-surface-200 rounded px-1 text-xs">data_status: needs_review</code></li>
          <li>Verify each product against the source PDF before marking as verified</li>
          <li>Prices intentionally left blank — add them separately after verification</li>
        </ol>
      </div>
    </div>
  );
}
