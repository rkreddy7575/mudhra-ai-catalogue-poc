import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import SearchBar from '@/components/catalogue/SearchBar';
import ProductGrid from '@/components/catalogue/ProductGrid';
import * as productService from '@/services/product.service';
import type { CategoryInfo } from '@/types';

interface CataloguePageProps {
  searchParams: { query?: string; page?: string; category?: string };
}

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  let categories: CategoryInfo[] = [];
  let productsResult: Awaited<ReturnType<typeof productService.getProducts>> = {
    data: [],
    total: 0,
    page: 1,
    pageSize: 24,
    totalPages: 0,
  };

  try {
    categories = await productService.getCategories();
    productsResult = await productService.getProducts({
      query: searchParams.query,
      category: searchParams.category,
      page: parseInt(searchParams.page || '1', 10),
      pageSize: 24,
      active: true,
    });
  } catch {
    // Supabase not configured
  }

  const currentPage = productsResult.page;
  const totalPages = productsResult.totalPages;

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="bg-gradient-to-b from-surface-50 to-white border-b border-surface-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-surface-400 mb-4">
            <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-surface-600 font-medium">Catalogue</span>
            {searchParams.category && (
              <>
                <ChevronRight size={12} />
                <span className="text-brand-600 font-medium">{searchParams.category}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-surface-900">
                {searchParams.category || 'All Products'}
              </h1>
              <p className="text-sm text-surface-500 mt-1">
                {productsResult.total} product{productsResult.total !== 1 ? 's' : ''}
                {searchParams.query && (
                  <span>
                    {' '}matching &ldquo;<strong className="text-surface-700">{searchParams.query}</strong>&rdquo;
                  </span>
                )}
              </p>
            </div>
            <div className="w-full sm:w-auto sm:max-w-md">
              <SearchBar defaultValue={searchParams.query || ''} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar — Categories */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="sticky top-20">
              <h3 className="font-semibold text-surface-900 text-sm mb-3 flex items-center gap-2">
                Categories
                <span className="text-xs font-normal text-surface-400 bg-surface-100 rounded-full px-2 py-0.5">
                  {categories.length}
                </span>
              </h3>
              <nav className="space-y-0.5">
                <Link
                  href="/catalogue"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                    ${!searchParams.category
                      ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/5'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
                    }`}
                >
                  <span>All Products</span>
                  <span className={`text-xs rounded-full px-2 py-0.5 ${
                    !searchParams.category ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-400'
                  }`}>
                    {categories.reduce((sum, c) => sum + c.productCount, 0)}
                  </span>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/catalogue?category=${encodeURIComponent(cat.name)}`}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                      ${searchParams.category === cat.name
                        ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/5'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
                      }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${
                      searchParams.category === cat.name ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-400'
                    }`}>
                      {cat.productCount}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid products={productsResult.data} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                {/* Previous */}
                {currentPage > 1 && (
                  <Link
                    href={`/catalogue?${new URLSearchParams({
                      ...(searchParams.query ? { query: searchParams.query } : {}),
                      ...(searchParams.category ? { category: searchParams.category } : {}),
                      page: String(currentPage - 1),
                    }).toString()}`}
                    className="flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors"
                  >
                    ← Prev
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    href={`/catalogue?${new URLSearchParams({
                      ...(searchParams.query ? { query: searchParams.query } : {}),
                      ...(searchParams.category ? { category: searchParams.category } : {}),
                      page: String(page),
                    }).toString()}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                      ${page === currentPage
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                        : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-brand-200'
                      }`}
                  >
                    {page}
                  </Link>
                ))}

                {/* Next */}
                {currentPage < totalPages && (
                  <Link
                    href={`/catalogue?${new URLSearchParams({
                      ...(searchParams.query ? { query: searchParams.query } : {}),
                      ...(searchParams.category ? { category: searchParams.category } : {}),
                      page: String(currentPage + 1),
                    }).toString()}`}
                    className="flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
