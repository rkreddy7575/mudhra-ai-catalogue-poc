'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type { ChatResponse, SuggestedAction, Product } from '@/types';
import { MessageCircle, Sparkles, ShoppingBag, HelpCircle, Gift } from 'lucide-react';

interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: SuggestedAction[];
  products?: Product[];
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message: string) => {
    // Add user message immediately
    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message,
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const data: ChatResponse = await response.json();
      setConversationId(data.conversationId);

      const assistantMessage: ChatMessageData = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        suggestedActions: data.suggestedActions,
        products: data.products,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessageData = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          'I apologize, but I encountered an error. Please try again or contact our sales team for assistance.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200/50 bg-white/80 backdrop-blur-sm">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
          <Sparkles size={18} />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
        </div>
        <div>
          <h2 className="font-semibold text-surface-900 text-sm">Mudhra AI Assistant</h2>
          <p className="text-xs text-surface-500">
            {isLoading ? (
              <span className="text-brand-500 animate-pulse">Searching catalogue...</span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                Online — Ask about our products
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-surface-50/80 to-white">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in px-4">
            {/* Hero icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-brand-200/40 rounded-3xl blur-xl animate-glow-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-600 shadow-lg shadow-brand-500/10">
                <MessageCircle size={32} />
              </div>
            </div>

            <h3 className="font-display font-bold text-surface-900 text-xl mb-2">
              Welcome to Mudhra AI
            </h3>
            <p className="text-sm text-surface-500 max-w-sm mb-8 leading-relaxed">
              I can help you browse our corporate gifting catalogue, find products by description, and generate instant quotations.
            </p>

            {/* Suggestion cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-lg">
              {[
                {
                  icon: <ShoppingBag size={16} />,
                  text: 'Show me water bottles',
                  color: 'brand',
                },
                {
                  icon: <HelpCircle size={16} />,
                  text: 'What categories do you have?',
                  color: 'accent',
                },
                {
                  icon: <Gift size={16} />,
                  text: 'I need gifts for 100 employees',
                  color: 'brand',
                },
              ].map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => handleSend(suggestion.text)}
                  className="flex items-center gap-2.5 rounded-xl bg-white border border-surface-200/80 p-3 text-left text-xs text-surface-600
                    hover:border-brand-300 hover:text-brand-700 hover:shadow-md hover:shadow-brand-500/5 hover:-translate-y-0.5
                    transition-all duration-200 group"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 transition-colors
                    ${suggestion.color === 'accent'
                      ? 'bg-accent-50 text-accent-600 group-hover:bg-accent-100'
                      : 'bg-brand-50 text-brand-600 group-hover:bg-brand-100'
                    }`}
                  >
                    {suggestion.icon}
                  </div>
                  <span className="font-medium leading-tight">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            actions={msg.suggestedActions}
            products={msg.products}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white text-xs shadow-sm flex-shrink-0">
              <Sparkles size={14} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white border border-surface-200/60 px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-surface-500">Searching catalogue...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
