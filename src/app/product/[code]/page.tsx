import Link from 'next/link';
import { ArrowLeft, Package, MessageCircle, AlertTriangle, ChevronRight, CheckCircle2, Sparkles, Box, Palette, Ruler } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProductGrid from '@/components/catalogue/ProductGrid';
import EnquiryForm from '@/components/enquiry/EnquiryForm';
import * as productService from '@/services/product.service';
import { formatPrice, CATEGORY_ICONS, getCategoryImageUrl, generateWhatsAppShareUrl } from '@/lib/utils';
import { companySettings } from '@/config/company';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: { code: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product: Awaited<ReturnType<typeof productService.getProductByCode>> = null;
  let relatedProducts: Awaited<ReturnType<typeof productService.getRelatedProducts>> = [];

  try {
    product = await productService.getProductByCode(params.code);
    if (product) {
      relatedProducts = await productService.getRelatedProducts(product, 4);
    }
  } catch {
    // Supabase not configured
  }

  if (!product) {
    notFound();
  }

  const icon = CATEGORY_ICONS[product.category] || '📦';

  return (
    <div className="min-h-screen">
      {/* Top bar with breadcrumb */}
      <div className="bg-gradient-to-b from-surface-50 to-white border-b border-surface-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-xs text-surface-400">
            <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/catalogue" className="hover:text-brand-600 transition-colors">Catalogue</Link>
            <ChevronRight size={12} />
            <Link
              href={`/catalogue?category=${encodeURIComponent(product.category)}`}
              className="hover:text-brand-600 transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight size={12} />
            <span className="text-surface-600 font-medium">{product.code}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ═══ PRODUCT IMAGE ═══ */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-surface-50 to-surface-100 border border-surface-200/60 flex items-center justify-center overflow-hidden group">
              {product.image_path ? (
                <img
                  src={product.image_path}
                  alt={product.name || product.code}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : getCategoryImageUrl(product.category) ? (
                <div className="relative w-full h-full">
                  <img
                    src={getCategoryImageUrl(product.category)!}
                    alt={product.name || product.code}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs text-white/90 text-center">
                    Representative Category Visual • Verified catalog photo pending
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-surface-300">
                  <Package size={64} strokeWidth={1} />
                  <span className="text-sm font-mono">{product.code}</span>
                  <span className="text-xs">Image coming soon</span>
                </div>
              )}

              {/* Status overlay badge */}
              {product.data_status === 'VERIFIED_FROM_CATALOGUE' && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-md">
                  <CheckCircle2 size={12} />
                  Verified from Catalogue
                </div>
              )}
            </div>
          </div>

          {/* ═══ PRODUCT INFO ═══ */}
          <div className="lg:py-2">
            {/* Status alerts */}
            {(product.data_status === 'NEEDS_MANUAL_REVIEW' || product.data_status === 'needs_review') && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200/70 px-4 py-3 text-sm text-amber-700 mb-5">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>Product details need confirmation. Specifications require verification with sales team.</span>
              </div>
            )}
            {product.data_status === 'NOT_AVAILABLE' && (
              <div className="flex items-start gap-2.5 rounded-xl bg-surface-100 border border-surface-200 px-4 py-3 text-sm text-surface-600 mb-5">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>Detailed specifications are not available in the printed catalogue. You can enquire with our sales desk for details.</span>
              </div>
            )}

            {/* Category & Code */}
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={`/catalogue?category=${encodeURIComponent(product.category)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200/50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
              >
                <span>{icon}</span>
                {product.category}
              </Link>
              {product.source_page && (
                <Badge>Page {product.source_page}</Badge>
              )}
            </div>

            <span className="text-sm font-mono text-brand-600 font-bold tracking-wide">{product.code}</span>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-surface-900 mt-1 mb-3 leading-tight">
              {product.name || product.category}
            </h1>

            {/* Price */}
            <div className="text-2xl font-bold text-surface-900 mb-6">
              {formatPrice(product.price_inr)}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-surface-700 mb-1.5">Description</h3>
                <p className="text-sm text-surface-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* ═══ SPECIFICATION CARDS ═══ */}
            {(product.material || product.capacity || product.colors.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {product.material && (
                  <div className="flex items-start gap-3 rounded-xl bg-surface-50 border border-surface-200/60 p-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-surface-200/60 text-surface-500 flex-shrink-0">
                      <Box size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">Material</span>
                      <p className="text-sm font-medium text-surface-800">{product.material}</p>
                    </div>
                  </div>
                )}
                {product.capacity && (
                  <div className="flex items-start gap-3 rounded-xl bg-surface-50 border border-surface-200/60 p-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-surface-200/60 text-surface-500 flex-shrink-0">
                      <Ruler size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">Capacity</span>
                      <p className="text-sm font-medium text-surface-800">{product.capacity}</p>
                    </div>
                  </div>
                )}
                {product.colors.length > 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-surface-50 border border-surface-200/60 p-3.5 sm:col-span-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-surface-200/60 text-surface-500 flex-shrink-0">
                      <Palette size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">Available Colors</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {product.colors.map((color) => (
                          <span
                            key={color}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-surface-200 px-2.5 py-0.5 text-xs font-medium text-surface-700"
                          >
                            <ColorDot color={color} />
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ ACTIONS ═══ */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/chat" className="flex-1">
                <Button variant="secondary" className="w-full group">
                  <Sparkles size={16} className="group-hover:animate-pulse" />
                  Ask AI about this
                </Button>
              </Link>
              <a
                href={generateWhatsAppShareUrl({
                  phone: companySettings.phone,
                  text: `Hello ${companySettings.name},\n\nI am inquiring about the following product from your catalogue:\n\n📦 Product: ${product.code} - ${product.name || product.category}\n📂 Category: ${product.category}\n${product.material ? `🪵 Material: ${product.material}\n` : ''}${product.capacity ? `📏 Capacity: ${product.capacity}\n` : ''}\nPlease let me know the pricing and minimum order quantity for corporate gifting.`,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <MessageCircle size={16} className="mr-1.5" />
                  Inquire on WhatsApp
                </Button>
              </a>
            </div>

            {/* ═══ ENQUIRY FORM ═══ */}
            <div className="rounded-2xl border border-surface-200/60 bg-surface-50 p-6">
              <h3 className="font-display font-semibold text-lg text-surface-900 mb-1">
                Send Enquiry
              </h3>
              <p className="text-xs text-surface-500 mb-4">Get pricing and customization details</p>
              <EnquiryForm
                productCode={product.code}
                productName={product.name || product.category}
              />
            </div>
          </div>
        </div>

        {/* ═══ RELATED PRODUCTS ═══ */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-surface-200/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-surface-900">
                More in {product.category}
              </h2>
              <Link
                href={`/catalogue?category=${encodeURIComponent(product.category)}`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}

/** Renders a tiny colored circle based on the color name */
function ColorDot({ color }: { color: string }) {
  const colorMap: Record<string, string> = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Red': '#EF4444',
    'Blue': '#3B82F6',
    'Green': '#22C55E',
    'Yellow': '#EAB308',
    'Orange': '#F97316',
    'Pink': '#EC4899',
    'Purple': '#A855F7',
    'Grey': '#6B7280',
    'Gray': '#6B7280',
    'Silver': '#C0C0C0',
    'Gold': '#D4A843',
    'Brown': '#92400E',
    'Navy': '#1E3A5F',
    'Maroon': '#7F1D1D',
    'Teal': '#14B8A6',
    'Cream': '#FFFDD0',
    'Beige': '#F5F5DC',
  };

  const hex = colorMap[color] || '#9CA3AF';
  const isLight = ['White', 'Cream', 'Beige', 'Yellow', 'Silver'].includes(color);

  return (
    <span
      className={`inline-block h-3 w-3 rounded-full flex-shrink-0 ${isLight ? 'border border-surface-300' : ''}`}
      style={{ backgroundColor: hex }}
    />
  );
}
