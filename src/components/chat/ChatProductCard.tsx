'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Send, CheckCircle2, Package } from 'lucide-react';
import type { Product } from '@/types';
import { getCategoryImageUrl } from '@/lib/utils';
import { getDemoProductPrice } from '@/services/demo-pricing.service';

interface ChatProductCardProps {
  product: Product;
}

export default function ChatProductCard({ product }: ChatProductCardProps) {
  const displayImage = product.image_path || getCategoryImageUrl(product.category);
  const demoPrice = getDemoProductPrice(product.code, product.category);

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 p-2.5 rounded-xl bg-white border border-surface-200/80 shadow-xs hover:border-brand-300 hover:shadow-sm transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="relative w-full sm:w-20 sm:h-20 aspect-video sm:aspect-square rounded-lg bg-surface-50 border border-surface-100 flex items-center justify-center overflow-hidden flex-shrink-0">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name || product.code}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <Package size={24} className="text-surface-300" />
        )}

        {product.data_status === 'VERIFIED_FROM_CATALOGUE' && (
          <span
            className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-emerald-500/90 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-medium text-white shadow-2xs"
            title="Verified from catalogue"
          >
            <CheckCircle2 size={8} />
            Verified
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-xs text-surface-900 truncate leading-snug">
              {product.name || product.code}
            </h4>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-100 text-surface-600 font-medium flex-shrink-0">
              {product.code}
            </span>
          </div>

          <p className="text-[11px] text-surface-500 line-clamp-1 mt-0.5">
            {[product.material, product.capacity].filter(Boolean).join(' • ') || product.category}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-surface-100">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-surface-400 font-medium">Demo Price</span>
            <span className="text-xs font-bold text-brand-600">
              ₹{demoPrice.demoUnitPrice.toLocaleString('en-IN')}{' '}
              <span className="text-[10px] font-normal text-surface-500">/unit</span>
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <Link
              href={`/product/${encodeURIComponent(product.code)}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-surface-50 hover:bg-brand-50 text-surface-700 hover:text-brand-700 border border-surface-200/60 hover:border-brand-300 transition-colors"
            >
              <ExternalLink size={11} />
              <span>Details</span>
            </Link>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hi Mudhra Branding Solutions, I'm interested in corporate gifting for ${product.code} - ${product.name || product.category}. Could you share bulk pricing?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-colors"
              title="Chat on WhatsApp about this item"
            >
              <span>WhatsApp</span>
            </a>
            <Link
              href={`/enquiry?productCode=${encodeURIComponent(product.code)}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-700 text-white shadow-2xs transition-colors"
            >
              <Send size={11} />
              <span>Quote</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
