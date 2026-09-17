'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Sparkles, MessageSquare, CheckCircle2, RefreshCw, User, Bot, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import FormattedChatContent from '@/components/chat/FormattedChatContent';

interface MessageLog {
  id: string;
  sender: 'customer' | 'bot';
  text: string;
  timestamp: string;
}

export default function WhatsAppSimulatorPage() {
  const [phone, setPhone] = useState('919876543210');
  const [senderName, setSenderName] = useState('Rahul Sharma');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageLog[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: '👋 Welcome to Mudhra Branding Solutions! I am your AI corporate gifting assistant. How can I help you today?',
      timestamp: 'Just now',
    },
  ]);

  const quickPrompts = [
    'Show me stainless steel water bottles',
    'I need 100 units of XG-BT-002 with logo printing',
    'What categories do you have?',
    'Compare XG-BT-001 and XG-BT-003',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!message || isLoading) return;

    const userMessage: MessageLog = {
      id: `user-${Date.now()}`,
      sender: 'customer',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          senderName,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'WhatsApp webhook returned an error');
      }

      const botReply = data.outbound?.reply || 'Received your inquiry.';

      const botMessage: MessageLog = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: MessageLog = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ Error: ${String(err)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'init-fresh',
        sender: 'bot',
        text: '👋 New conversation started. Message me about any gifting item!',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-surface-500 hover:text-brand-600 transition-colors mb-2"
            >
              <ArrowLeft size={14} /> Back to Admin
            </Link>
            <h1 className="text-2xl font-bold font-display text-surface-900 flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
              WhatsApp Bot Interactive Simulator
            </h1>
            <p className="text-xs text-surface-500 mt-0.5">
              Simulates real incoming WhatsApp messages to <code>POST /api/whatsapp</code> and tests Gemini AI multi-turn sales responses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleClear} className="text-xs">
              <RefreshCw size={13} className="mr-1.5" />
              Reset Chat
            </Button>
            <a
              href="https://api.whatsapp.com/send?text=Hi%20Mudhra%20Branding%20Solutions"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                Test Real WhatsApp Link
              </Button>
            </a>
          </div>
        </div>

        {/* Sender Config Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white border border-surface-200/80 shadow-xs">
          <div>
            <label className="block text-[11px] font-semibold text-surface-600 uppercase tracking-wider mb-1">
              Customer Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs font-mono rounded-lg border border-surface-200 px-3 py-2 bg-surface-50 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="e.g. 919876543210"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-surface-600 uppercase tracking-wider mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full text-xs rounded-lg border border-surface-200 px-3 py-2 bg-surface-50 focus:bg-white focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Rahul Sharma"
            />
          </div>
        </div>

        {/* WhatsApp Mobile Mockup Container */}
        <div className="rounded-2xl border border-surface-300/80 shadow-md bg-[#e5ddd5] overflow-hidden flex flex-col h-[560px]">
          {/* WhatsApp Chat Header */}
          <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                M
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">Mudhra AI Sales Desk</h3>
                <span className="text-[10px] text-emerald-200">
                  {isLoading ? 'typing...' : 'online • WhatsApp Business'}
                </span>
              </div>
            </div>

            <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded-full border border-emerald-700/60 font-mono">
              /api/whatsapp
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => {
              const isUser = m.sender === 'customer';
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#dcf8c6] text-surface-900 rounded-tr-none'
                        : 'bg-white text-surface-900 rounded-tl-none border border-surface-200/50'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    ) : (
                      <FormattedChatContent content={m.text} />
                    )}
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        isUser ? 'text-emerald-800/70' : 'text-surface-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white rounded-lg px-3 py-2 text-xs shadow-xs text-surface-500 italic">
                  AI is searching catalogue & preparing WhatsApp reply...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-[#f0f2f5] border-t border-surface-200/70 px-3 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {quickPrompts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] font-medium bg-white hover:bg-emerald-50 text-surface-700 hover:text-emerald-800 border border-surface-200 hover:border-emerald-300 rounded-full px-2.5 py-1 transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-surface-200/80">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              placeholder="Type a WhatsApp message..."
              className="flex-1 bg-white rounded-full px-4 py-2 text-xs border border-surface-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className="h-9 w-9 rounded-full bg-[#075e54] hover:bg-[#128c7e] text-white flex items-center justify-center disabled:opacity-50 transition-colors flex-shrink-0 shadow-xs"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Integration Instructions Card */}
        <div className="p-4 rounded-xl bg-white border border-surface-200/80 shadow-xs space-y-2">
          <h4 className="text-xs font-semibold text-surface-900 flex items-center gap-1.5">
            <Sparkles size={14} className="text-brand-500" />
            Testing Live with a Real WhatsApp App
          </h4>
          <p className="text-xs text-surface-600 leading-relaxed">
            To connect your actual smartphone WhatsApp to this bot for free:
          </p>
          <ol className="text-xs text-surface-600 list-decimal list-inside space-y-1 pl-1">
            <li>Expose your local port with <code>ngrok http 3000</code> or deploy to Vercel.</li>
            <li>In Meta Developer Portal, set Webhook URL to <code>https://&lt;your-domain&gt;/api/whatsapp</code>.</li>
            <li>Use Verify Token: <code>mudhra_poc_whatsapp_verify_token</code>.</li>
            <li>Send a message from your personal WhatsApp to Meta&apos;s free test number. The bot replies automatically!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
