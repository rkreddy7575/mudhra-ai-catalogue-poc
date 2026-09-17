import type { Metadata } from 'next';
import ChatWindow from '@/components/chat/ChatWindow';

export const metadata: Metadata = {
  title: 'AI Sales Assistant — Mudhra Branding Solutions',
  description: 'Chat with our AI assistant to discover products, get details, and submit enquiries.',
};

export default function ChatPage() {
  return <ChatWindow />;
}
