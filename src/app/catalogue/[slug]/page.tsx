import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductGrid from '@/components/catalogue/ProductGrid';
import * as productService from '@/services/product.service';
import { unslugify, CATEGORY_ICONS } from '@/lib/utils';

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categoryName = unslugify(params.slug);
  const icon = CATEGORY_ICONS[categoryName] || '📦';

  let productsResult: Awaited<ReturnType<typeof productService.getProducts>> = {
    data: [],
    total: 0,
    page: 1,
    pageSize: 24,
    totalPages: 0,
  };

  try {
    productsResult = await productService.getProductsByCategory(categoryName, {
      page: parseInt(searchParams.page || '1', 10),
      pageSize: 24,
      active: true,
    });
  } catch {
    // Supabase not configured
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link
        href="/catalogue"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-brand-600 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Catalogue
      </Link>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{icon}</span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-surface-900">
            {categoryName}
          </h1>
        </div>
        <p className="text-surface-500">
          {productsResult.total} product{productsResult.total !== 1 ? 's' : ''}
        </p>
      </div>

      <ProductGrid
        products={productsResult.data}
        emptyMessage={`No products found in ${categoryName}. Products may not be imported yet.`}
      />

      {/* Pagination */}
      {productsResult.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: productsResult.totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/catalogue/${params.slug}?page=${page}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors
                ${page === productsResult.page
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
