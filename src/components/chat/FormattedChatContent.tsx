'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Product } from '@/types';
import { getCategoryImageUrl } from '@/lib/utils';
import { getDemoProductPrice } from '@/services/demo-pricing.service';

interface FormattedChatContentProps {
  content: string;
  onProductClick?: (code: string) => void;
}

/**
 * Parses markdown-like text and renders rich WhatsApp/Chat styled components:
 * - Highlights product codes with badges
 * - Renders lists with custom bullets
 * - Renders demo quote blocks nicely
 * - Renders callouts / notes in warning/info cards
 */
export default function FormattedChatContent({ content, onProductClick }: FormattedChatContentProps) {
  const lines = content.split('\n');

  // Check if line is a bullet item (* item or - item or 1. item)
  const isBullet = (line: string) => /^\s*([*\-•]|\d+\.)\s+/.test(line);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-surface-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // 1. Check for PoC / Demo Quote Header or Warning box
        if (trimmed.startsWith('POC Demo Quote') || trimmed.startsWith('Demo Quote:')) {
          return (
            <div
              key={idx}
              className="my-2 rounded-xl bg-gradient-to-r from-brand-50 to-surface-50 border border-brand-200 p-3 font-semibold text-brand-900 flex items-center gap-2 shadow-xs"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white text-[10px] font-bold">
                ₹
              </span>
              <span>{trimmed}</span>
            </div>
          );
        }

        // 2. Check for Note/Disclaimer line (e.g. *(Note: ...)* or ⚠️ ...)
        if (
          trimmed.startsWith('⚠️') ||
          trimmed.startsWith('*(Note:') ||
          trimmed.startsWith('(Note:') ||
          trimmed.toLowerCase().includes('demo prices for poc testing only')
        ) {
          return (
            <div
              key={idx}
              className="my-2 rounded-lg bg-amber-50/80 border border-amber-200/80 px-3 py-2 text-xs text-amber-900 flex items-start gap-2"
            >
              <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-normal opacity-90">
                {renderInlineFormatting(trimmed.replace(/^\*\(/, '(').replace(/\)\*$/, ')'), onProductClick)}
              </div>
            </div>
          );
        }

        // 3. Check for Bullet points (* or -)
        if (isBullet(line)) {
          const indent = line.search(/\S/) > 2;
          const cleanText = line.replace(/^\s*([*\-•]|\d+\.)\s+/, '');

          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 my-1 ${
                indent ? 'ml-5 text-xs text-surface-600' : 'ml-1'
              }`}
            >
              <span
                className={`flex-shrink-0 rounded-full mt-1.5 ${
                  indent ? 'h-1.5 w-1.5 bg-surface-300' : 'h-2 w-2 bg-brand-500 ring-2 ring-brand-100'
                }`}
              />
              <div className="flex-1">{renderInlineFormatting(cleanText, onProductClick)}</div>
            </div>
          );
        }

        // 4. Regular line
        return (
          <p key={idx} className="break-words">
            {renderInlineFormatting(trimmed, onProductClick)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Helper to parse bold (**bold**), product codes (XG-XX-XXX), and prices in text
 */
function renderInlineFormatting(text: string, onProductClick?: (code: string) => void) {
  // Regex to match **bold** or product codes like XG-BT-001 or ₹123
  const tokens = text.split(/(\*\*.*?\*\*|XG-[A-Z]{2}-\d{3}|₹\d+(?:,\d+)*(?:\/unit)?)/g);

  return tokens.map((part, index) => {
    if (!part) return null;

    // Bold formatting
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-surface-900">
          {renderInlineFormatting(inner, onProductClick)}
        </strong>
      );
    }

    // Product code badge (e.g. XG-BT-001)
    if (/^XG-[A-Z]{2}-\d{3}$/.test(part)) {
      return (
        <Link
          key={index}
          href={`/product/${part}`}
          className="inline-flex items-center gap-1 font-mono font-medium text-xs px-2 py-0.5 mx-0.5 rounded-md bg-brand-50 border border-brand-200/80 text-brand-700 hover:bg-brand-100 hover:border-brand-400 transition-colors shadow-2xs"
          onClick={() => onProductClick?.(part)}
        >
          <span>{part}</span>
          <ExternalLink size={10} className="text-brand-500 opacity-70" />
        </Link>
      );
    }

    // Demo price badge (e.g. ₹399/unit)
    if (/^₹\d+(?:,\d+)*(?:\/unit)?$/.test(part)) {
      return (
        <span
          key={index}
          className="inline-flex items-center font-semibold text-xs text-brand-700 bg-brand-50/80 border border-brand-100 px-1.5 py-0.5 rounded"
        >
          {part}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
}
