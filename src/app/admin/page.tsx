import Link from 'next/link';
import { Package, Inbox, Upload, BarChart3, MessageSquare } from 'lucide-react';
import * as productService from '@/services/product.service';
import * as enquiryService from '@/services/enquiry.service';

export default async function AdminDashboard() {
  let productCount = 0;
  let categoryCount = 0;
  let enquiryStats: Record<string, number> = { new: 0, contacted: 0, quoted: 0, closed: 0, cancelled: 0 };

  try {
    const categories = await productService.getCategories();
    categoryCount = categories.length;
    productCount = categories.reduce((sum, c) => sum + c.productCount, 0);
    enquiryStats = await enquiryService.getEnquiryStats();
  } catch {
    // Supabase not configured
  }

  const totalEnquiries = Object.values(enquiryStats).reduce((a, b) => a + b, 0);

  const statCards = [
    { label: 'Products', value: productCount, icon: <Package size={20} />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Categories', value: categoryCount, icon: <BarChart3 size={20} />, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Enquiries', value: totalEnquiries, icon: <Inbox size={20} />, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'New Enquiries', value: enquiryStats.new || 0, icon: <Inbox size={20} />, color: 'text-brand-600 bg-brand-50' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-surface-900">Admin Dashboard</h1>
        <p className="text-sm text-surface-500 mt-1">Manage products, enquiries, and data imports.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white border border-surface-200/60 p-5"
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-surface-900">{stat.value}</div>
            <div className="text-sm text-surface-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Demo Pricing Mode Active Banner */}
      <div className="mb-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="font-semibold text-amber-950 text-sm">Demo Pricing Engine Active (PoC)</h2>
          </div>
          <p className="text-xs text-amber-800 mt-1">
            Deterministic mock pricing is active for simulations. Production catalogue <code>price_inr</code> remains NULL.
          </p>
        </div>
        <Link
          href="/admin/demo-pricing"
          className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors whitespace-nowrap"
        >
          Configure Demo Slabs &rarr;
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/enquiries"
          className="rounded-2xl bg-white border border-surface-200/60 p-6 hover:border-brand-300 hover:shadow-md transition-all group"
        >
          <Inbox size={24} className="text-brand-500 mb-3" />
          <h3 className="font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">
            Manage Enquiries
          </h3>
          <p className="text-sm text-surface-500 mt-1">View, update, and track all customer enquiries.</p>
        </Link>

        <Link
          href="/admin/products"
          className="rounded-2xl bg-white border border-surface-200/60 p-6 hover:border-brand-300 hover:shadow-md transition-all group"
        >
          <Package size={24} className="text-brand-500 mb-3" />
          <h3 className="font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">
            Product Catalogue
          </h3>
          <p className="text-sm text-surface-500 mt-1">View products and their data verification status.</p>
        </Link>

        <Link
          href="/admin/demo-pricing"
          className="rounded-2xl bg-white border border-surface-200/60 p-6 hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <BarChart3 size={24} className="text-amber-600 mb-3" />
          <h3 className="font-semibold text-surface-900 group-hover:text-amber-700 transition-colors">
            Demo Pricing Engine
          </h3>
          <p className="text-sm text-surface-500 mt-1">Category slabs, branding rates, and live calculation sandbox.</p>
        </Link>

        <Link
          href="/admin/whatsapp-test"
          className="rounded-2xl bg-white border border-surface-200/60 p-6 hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <MessageSquare size={24} className="text-emerald-600" />
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live
            </span>
          </div>
          <h3 className="font-semibold text-surface-900 group-hover:text-emerald-700 transition-colors">
            WhatsApp Simulator
          </h3>
          <p className="text-sm text-surface-500 mt-1">Test two-way AI sales messages directly as a customer.</p>
        </Link>
      </div>
    </div>
  );
}
