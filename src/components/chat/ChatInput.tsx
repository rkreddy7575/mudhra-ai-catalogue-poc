'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isReady = message.trim().length > 0 && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-surface-200/50 bg-white/80 backdrop-blur-xl px-4 py-3"
    >
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl border border-surface-200 bg-surface-50/80 backdrop-blur-sm px-4 py-2.5 text-sm text-surface-900
              placeholder:text-surface-400
              focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200"
          />
          {/* Character hint */}
          {message.length > 100 && (
            <span className="absolute right-3 bottom-1.5 text-[10px] text-surface-300">
              {message.length}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={!isReady}
          className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md
            transition-all duration-300
            ${isReady
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 hover:scale-105 animate-none'
              : 'bg-surface-300 shadow-none cursor-not-allowed'
            }`}
        >
          <Send size={16} className={isReady ? '' : 'opacity-50'} />
        </button>
      </div>
      <p className="text-center text-[10px] text-surface-400 mt-2">
        AI searches our product database. It never invents information.
      </p>
    </form>
  );
}
