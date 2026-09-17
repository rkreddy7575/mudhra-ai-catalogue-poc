'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, MessageCircle, ShoppingBag, Settings, Sparkles } from 'lucide-react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300
        ${scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-md shadow-surface-900/5 border-b border-transparent'
          : 'bg-white/80 backdrop-blur-lg border-b border-surface-200/50'
        }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-display font-bold text-lg shadow-md shadow-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/30 group-hover:scale-105 transition-all duration-300">
            M
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent-400 border-2 border-white animate-bounce-subtle" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display font-semibold text-surface-900 text-lg leading-tight">
              Mudhra
            </span>
            <span className="text-[10px] text-surface-400 font-medium tracking-wider uppercase">
              Branding Solutions
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/catalogue" icon={<ShoppingBag size={16} />} active={pathname.startsWith('/catalogue')}>
            Catalogue
          </NavLink>
          <NavLink href="/chat" icon={<MessageCircle size={16} />} active={pathname === '/chat'}>
            <span className="flex items-center gap-1.5">
              AI Assistant
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
          </NavLink>
          <NavLink href="/admin" icon={<Settings size={16} />} active={pathname.startsWith('/admin')}>
            Admin
          </NavLink>
        </nav>

        {/* Desktop Search + CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/catalogue?focus=search"
            className="flex items-center gap-2 rounded-full bg-surface-100/80 px-4 py-2 text-sm text-surface-500 hover:bg-surface-200 hover:text-surface-700 transition-all duration-200 border border-transparent hover:border-surface-200"
          >
            <Search size={14} />
            <span>Search products...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-surface-300 px-1.5 text-[10px] font-mono text-surface-400">
              /
            </kbd>
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 hover:from-brand-600 hover:to-brand-700 transition-all duration-200"
          >
            <Sparkles size={14} />
            Ask AI
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl hover:bg-surface-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-200/50 bg-white/95 backdrop-blur-xl animate-slide-up">
          <nav className="flex flex-col p-4 gap-1">
            <MobileNavLink href="/catalogue" onClick={() => setMobileOpen(false)} active={pathname.startsWith('/catalogue')}>
              <ShoppingBag size={18} /> Catalogue
            </MobileNavLink>
            <MobileNavLink href="/chat" onClick={() => setMobileOpen(false)} active={pathname === '/chat'}>
              <MessageCircle size={18} /> AI Assistant
              <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-400" />
            </MobileNavLink>
            <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)} active={pathname.startsWith('/admin')}>
              <Settings size={18} /> Admin
            </MobileNavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  icon,
  children,
  active = false,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`nav-link-underline flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active
          ? 'text-brand-600 active'
          : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
        }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
  active = false,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors
        ${active
          ? 'bg-brand-50 text-brand-700'
          : 'text-surface-700 hover:text-surface-900 hover:bg-surface-100'
        }`}
    >
      {children}
    </Link>
  );
}
