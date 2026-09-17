import Link from 'next/link';
import { formatPrice, getCategoryImageUrl } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import type { Product } from '@/types';
import { Package, Eye, CheckCircle2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayImage = product.image_path || getCategoryImageUrl(product.category);
  const isCategoryFallback = !product.image_path && !!displayImage;

  return (
    <Link
      href={`/product/${product.code}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-surface-200/60
        hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/8
        transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center overflow-hidden">
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt={product.name || product.code}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {isCategoryFallback && (
              <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-black/60 text-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                Sample visual
              </span>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-surface-300">
            <Package size={40} strokeWidth={1.5} />
            <span className="text-xs font-medium">{product.code}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-surface-900
            opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
            transition-all duration-300 shadow-lg">
            <Eye size={14} />
            View Details
          </div>
        </div>

        {/* Status badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {product.data_status === 'VERIFIED_FROM_CATALOGUE' && (
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              <CheckCircle2 size={10} />
              Verified
            </div>
          )}
          {(product.data_status === 'NEEDS_MANUAL_REVIEW' || product.data_status === 'needs_review') && (
            <Badge variant="warning">Review</Badge>
          )}
          {product.data_status === 'NOT_AVAILABLE' && (
            <Badge variant="default">N/A</Badge>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <span className="text-[11px] font-mono text-brand-600 font-semibold mb-1 tracking-wide">
          {product.code}
        </span>
        <h3 className="font-semibold text-surface-900 text-sm leading-snug mb-1 group-hover:text-brand-700 transition-colors line-clamp-2">
          {product.name || product.category}
        </h3>
        {product.material && (
          <span className="text-xs text-surface-400 mb-2 line-clamp-1">{product.material}</span>
        )}
        <div className="mt-auto pt-2 border-t border-surface-100">
          <span className="text-sm font-semibold text-surface-800">
            {formatPrice(product.price_inr)}
          </span>
        </div>
      </div>
    </Link>
  );
}
