import Link from 'next/link';
import { CATEGORY_ICONS, getCategoryImageUrl } from '@/lib/utils';
import type { CategoryInfo } from '@/types';

interface CategoryCardProps {
  category: CategoryInfo;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const icon = CATEGORY_ICONS[category.name] || '📦';
  const categoryImage = getCategoryImageUrl(category.name);

  return (
    <Link
      href={`/catalogue/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-surface-200/60
        hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/8
        transition-all duration-300 hover:-translate-y-1"
    >
      {/* Category preview image */}
      {categoryImage ? (
        <div className="relative h-40 w-full overflow-hidden bg-surface-100">
          <img
            src={categoryImage}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Icon on image */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="text-2xl drop-shadow-lg">{icon}</span>
          </div>

          {/* Product count badge */}
          <div className="absolute top-3 right-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            {category.productCount}
          </div>
        </div>
      ) : (
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center">
          <span className="text-5xl opacity-60 group-hover:scale-110 transition-transform duration-500">{icon}</span>
          {/* Product count badge */}
          <div className="absolute top-3 right-3 rounded-full bg-surface-200 px-2.5 py-0.5 text-xs font-semibold text-surface-600">
            {category.productCount}
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <h3 className="font-display font-semibold text-surface-900 text-base mb-0.5 group-hover:text-brand-700 transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-surface-500 flex items-center gap-1">
          {category.productCount} product{category.productCount !== 1 ? 's' : ''}
          <span className="text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-0.5">
            → Browse
          </span>
        </p>
      </div>
    </Link>
  );
}
