import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { companySettings } from '@/config/company';

export default function Footer() {
  return (
    <footer className="relative border-t border-surface-200/50 bg-surface-950 text-surface-400 overflow-hidden">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      {/* Subtle background texture */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-display font-bold text-sm shadow-md shadow-brand-500/20">
                M
              </div>
              <span className="font-display font-semibold text-white text-lg">
                {companySettings.name}
              </span>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed mb-4">
              {companySettings.tagline}. Quality merchandise, customized corporate branding, and structured quotation workflows.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-surface-400">
              <Sparkles size={12} className="text-brand-400" />
              Powered by AI
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <FooterLink href="/catalogue">Browse Catalogue</FooterLink>
              </li>
              <li>
                <FooterLink href="/chat">AI Sales Assistant</FooterLink>
              </li>
              <li>
                <FooterLink href="/enquiry">Send Enquiry</FooterLink>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Sales</h3>
            <ul className="space-y-2.5 text-sm">
              {companySettings.email ? (
                <li>
                  <span className="text-surface-500">Email: </span>
                  <a
                    href={`mailto:${companySettings.email}`}
                    className="hover:text-brand-400 transition-colors"
                  >
                    {companySettings.email}
                  </a>
                </li>
              ) : (
                <li>
                  <span className="text-surface-500">Email: </span>
                  <span className="text-surface-400">Available via enquiry form</span>
                </li>
              )}
              {companySettings.phone ? (
                <li>
                  <span className="text-surface-500">Phone: </span>
                  <a
                    href={`tel:${companySettings.phone}`}
                    className="hover:text-brand-400 transition-colors"
                  >
                    {companySettings.phone}
                  </a>
                </li>
              ) : (
                <li>
                  <span className="text-surface-500">Phone: </span>
                  <span className="text-surface-400">Available via enquiry form</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-surface-600">
          <span>&copy; {new Date().getFullYear()} Mudhra Branding Solutions. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5 text-surface-700 bg-white/5 rounded-full px-3 py-1">
            PoC — AI Catalogue Assistant
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative inline-block text-surface-400 hover:text-brand-400 transition-colors duration-200
        after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-brand-400
        hover:after:w-full after:transition-all after:duration-300"
    >
      {children}
    </Link>
  );
}
