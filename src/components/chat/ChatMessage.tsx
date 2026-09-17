import { Sparkles, User, ExternalLink, Send, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import type { SuggestedAction, Product } from '@/types';
import FormattedChatContent from './FormattedChatContent';
import ChatProductCard from './ChatProductCard';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  actions?: SuggestedAction[];
  products?: Product[];
}

export default function ChatMessage({ role, content, actions, products }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl text-white text-xs
          ${isUser
            ? 'bg-surface-700 shadow-sm'
            : 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-md shadow-brand-500/20'
          }`}
      >
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>

      {/* Message bubble, products, and actions */}
      <div className={`flex flex-col gap-2.5 ${isUser ? 'max-w-[85%]' : 'max-w-[92%] sm:max-w-[85%]'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${isUser
              ? 'bg-surface-800 text-white rounded-tr-md shadow-md shadow-surface-900/10'
              : 'bg-white border border-surface-200/70 text-surface-800 rounded-tl-md shadow-sm border-l-3 border-l-brand-500'
            }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{content}</div>
          ) : (
            <FormattedChatContent content={content} />
          )}
        </div>

        {/* Mini Product Cards attached to message if products were found/discussed */}
        {!isUser && products && products.length > 0 && (
          <div className="flex flex-col gap-2 pt-1 animate-fade-in">
            <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider px-1">
              Suggested Products ({products.length})
            </span>
            <div className="grid grid-cols-1 gap-2">
              {products.slice(0, 4).map((prod) => (
                <ChatProductCard key={prod.code} product={prod} />
              ))}
            </div>
          </div>
        )}

        {/* Suggested interactive actions */}
        {!isUser && actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {actions.map((action, idx) => {
              let href = '/catalogue';
              let ActionIcon = ShoppingBag;

              if (action.type === 'view_product' && action.data?.code) {
                href = `/product/${encodeURIComponent(action.data.code)}`;
                ActionIcon = ExternalLink;
              } else if (action.type === 'enquire') {
                href = action.data?.code
                  ? `/enquiry?productCode=${encodeURIComponent(action.data.code)}`
                  : '/enquiry';
                ActionIcon = Send;
              } else if (action.type === 'browse_category' && action.data?.category) {
                href = `/catalogue?category=${encodeURIComponent(action.data.category)}`;
                ActionIcon = ShoppingBag;
              } else if (action.type === 'contact_sales') {
                href = '/enquiry';
                ActionIcon = Send;
              }

              return (
                <Link
                  key={idx}
                  href={href}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    bg-white border border-brand-200 text-brand-700
                    hover:bg-brand-50 hover:border-brand-400 hover:text-brand-800
                    hover:shadow-xs hover:-translate-y-0.5
                    transition-all duration-200"
                >
                  <ActionIcon size={12} />
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

