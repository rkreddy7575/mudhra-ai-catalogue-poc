'use client';

import { useState, useCallback } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Search by product name, code, or category...',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/catalogue?query=${encodeURIComponent(query.trim())}`);
      } else {
        router.push('/catalogue');
      }
    },
    [query, router]
  );

  const handleClear = () => {
    setQuery('');
    router.push('/catalogue');
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl group">
      <div className={`relative transition-all duration-300 ${focused ? 'scale-[1.02]' : ''}`}>
        {/* Glow effect on focus */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-brand-400/20 via-brand-500/20 to-accent-400/20 rounded-2xl blur-lg transition-opacity duration-300 ${focused ? 'opacity-100' : 'opacity-0'}`} />

        <div className="relative">
          <Search
            size={18}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              focused ? 'text-brand-500' : 'text-surface-400'
            }`}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full rounded-2xl border border-surface-200 bg-white/90 backdrop-blur-sm pl-11 pr-24 py-3.5 text-sm text-surface-900
              placeholder:text-surface-400
              focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20
              shadow-sm hover:shadow-md focus:shadow-lg focus:shadow-brand-500/5
              transition-all duration-300"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors p-1 rounded-lg hover:bg-surface-100"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-2 text-xs font-semibold
              hover:from-brand-600 hover:to-brand-700 shadow-sm hover:shadow-md hover:shadow-brand-500/20
              transition-all duration-200 flex items-center gap-1.5"
          >
            <Sparkles size={12} />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
