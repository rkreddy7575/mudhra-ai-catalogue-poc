import Link from 'next/link';
import { ArrowRight, MessageCircle, ShoppingBag, Sparkles, Zap, Shield, Gift, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import CategoryCard from '@/components/catalogue/CategoryCard';
import SearchBar from '@/components/catalogue/SearchBar';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import * as productService from '@/services/product.service';

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof productService.getCategories>> = [];
  try {
    categories = await productService.getCategories();
  } catch {
    // Supabase not configured yet — show empty state
  }

  return (
    <div>
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-950 via-surface-900 to-brand-950 text-white min-h-[85vh] flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-10 -left-20 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column — Text */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-brand-300 mb-6 border border-white/10 animate-slide-up">
                <Sparkles size={12} className="animate-pulse-soft" />
                AI-Powered Corporate Gifting
                <ChevronRight size={12} />
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6">
                Premium Corporate Gifts,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400 bg-gradient-200 animate-gradient-x">
                  Instantly Discoverable
                </span>
              </h1>

              <p className="text-lg text-surface-300 max-w-xl mb-8 leading-relaxed">
                Browse our curated catalogue of branded water bottles, mugs, electronics, notebooks, and more.
                Our AI assistant helps you find the perfect products and generates instant quotations.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/catalogue">
                  <Button size="lg" className="w-full sm:w-auto group">
                    <ShoppingBag size={18} />
                    Browse Catalogue
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto !bg-white/10 !text-white hover:!bg-white/20 border border-white/10 backdrop-blur-sm">
                    <MessageCircle size={18} />
                    Ask AI Assistant
                  </Button>
                </Link>
              </div>

              <div className="max-w-xl">
                <SearchBar placeholder="Search water bottles, mugs, gift sets..." />
              </div>
            </div>

            {/* Right column — Stats & visual */}
            <div className="hidden lg:flex flex-col items-center justify-center">
              <div className="relative">
                {/* Glowing orb */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-accent-500/20 rounded-3xl blur-2xl animate-glow-pulse" />
                
                <div className="relative glass-dark rounded-3xl p-8 space-y-6 w-full max-w-sm">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <StatBox value={300} suffix="+" label="Products" />
                    <StatBox value={11} label="Categories" />
                    <StatBox value={299} label="Images" />
                    <StatBox value={24} suffix="/7" label="AI Ready" />
                  </div>

                  {/* Mini preview cards */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-xl">🍶</div>
                      <div>
                        <p className="text-sm font-medium text-white">Water Bottles</p>
                        <p className="text-xs text-surface-400">Premium stainless steel</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/20 text-xl">🎁</div>
                      <div>
                        <p className="text-sm font-medium text-white">Gift Sets</p>
                        <p className="text-xs text-surface-400">Curated corporate combos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="relative -mt-8 z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="card-glass rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <AnimatedCounter end={300} suffix="+" className="font-display font-bold text-2xl sm:text-3xl text-surface-900" />
              <p className="text-sm text-surface-500 mt-1">Products</p>
            </div>
            <div>
              <AnimatedCounter end={11} className="font-display font-bold text-2xl sm:text-3xl text-surface-900" />
              <p className="text-sm text-surface-500 mt-1">Categories</p>
            </div>
            <div>
              <span className="font-display font-bold text-2xl sm:text-3xl text-surface-900">AI</span>
              <p className="text-sm text-surface-500 mt-1">Powered Search</p>
            </div>
            <div>
              <span className="font-display font-bold text-2xl sm:text-3xl text-surface-900">Instant</span>
              <p className="text-sm text-surface-500 mt-1">Quotations</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES SECTION ═══ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
            Our Collection
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-surface-900 mb-3">
            Browse by Category
          </h2>
          <p className="text-surface-500 max-w-md mx-auto">
            Explore our range of premium corporate gifting products across every category
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-50 rounded-2xl">
            <p className="text-surface-500 mb-2">
              No products imported yet.
            </p>
            <p className="text-sm text-surface-400">
              Connect Supabase and import the catalogue CSV to get started.
            </p>
            <Link href="/admin/import" className="mt-4 inline-block">
              <Button variant="secondary" size="sm">Go to Import</Button>
            </Link>
          </div>
        )}
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative bg-surface-50 border-y border-surface-200/50 overflow-hidden">
        <div className="absolute inset-0 dot-grid-dark opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
              Simple Process
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-surface-900 mb-3">
              How It Works
            </h2>
            <p className="text-surface-500 max-w-md mx-auto">
              From product discovery to quotation in minutes, not days
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <ShoppingBag size={24} />,
                title: 'Browse or Ask AI',
                description: 'Explore our catalogue or ask our AI assistant to find products that match your requirements.',
                color: 'brand',
              },
              {
                step: '02',
                icon: <Zap size={24} />,
                title: 'Get Instant Details',
                description: 'View product specs, images, materials, and available customization options.',
                color: 'accent',
              },
              {
                step: '03',
                icon: <Gift size={24} />,
                title: 'Request Quotation',
                description: 'Submit an enquiry with quantity and branding needs. Get a quotation from the AI in seconds.',
                color: 'brand',
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="relative group text-center p-8 rounded-2xl bg-white border border-surface-200/60
                  hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-200 hover:-translate-y-1
                  transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute top-4 right-4 font-display font-bold text-4xl text-surface-100 group-hover:text-brand-100 transition-colors">
                  {item.step}
                </div>

                <div className={`relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5
                  ${item.color === 'accent'
                    ? 'bg-accent-50 text-accent-600'
                    : 'bg-brand-50 text-brand-600'
                  } group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <h3 className="font-display font-semibold text-surface-900 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{item.description}</p>

                {/* Connector line */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-surface-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <ShoppingBag size={24} />,
              title: '300+ Products',
              description: 'Curated catalogue of corporate gifts across 11+ categories with verified specifications.',
              accent: 'brand',
            },
            {
              icon: <Sparkles size={24} />,
              title: 'AI-Powered Search',
              description: 'Natural language search powered by Gemini AI. Find exactly what you need by describing it.',
              accent: 'accent',
            },
            {
              icon: <Shield size={24} />,
              title: 'Verified Data',
              description: 'Every product is tagged with data governance status. Know what\'s verified from the catalogue.',
              accent: 'brand',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-white border border-surface-200/60
                hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-200
                transition-all duration-300 overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 to-brand-50/0 group-hover:from-brand-50/50 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

              <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4
                group-hover:scale-110 transition-transform duration-300
                ${feature.accent === 'accent'
                  ? 'bg-accent-50 text-accent-600'
                  : 'bg-brand-50 text-brand-600'
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="relative font-semibold text-surface-900 mb-2">{feature.title}</h3>
              <p className="relative text-sm text-surface-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-900 via-surface-950 to-brand-950 text-white p-8 sm:p-12">
          <div className="absolute inset-0 dot-grid opacity-30" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 flex-shrink-0 animate-float">
              <Sparkles size={32} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display font-bold text-2xl sm:text-3xl mb-2">
                Talk to our AI Sales Assistant
              </h2>
              <p className="text-surface-300 max-w-lg">
                Describe what you need in plain English. Our AI will search the catalogue, suggest products, and even generate quotations for you.
              </p>
            </div>
            <Link href="/chat" className="flex-shrink-0">
              <Button size="lg" className="group">
                <MessageCircle size={18} />
                Start Chatting
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Stats box for the hero panel */
function StatBox({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
      <div className="font-display font-bold text-xl text-white">
        <AnimatedCounter end={value} suffix={suffix} className="text-white" />
      </div>
      <p className="text-xs text-surface-400 mt-0.5">{label}</p>
    </div>
  );
}
