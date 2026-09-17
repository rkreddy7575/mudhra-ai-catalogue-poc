/**
 * Conversation Service
 * 
 * Manages chat sessions and message storage.
 * Designed to work identically for web and WhatsApp channels.
 */

import { getServiceClient } from '@/lib/supabase/server';
import type { Conversation, Message, MessageDirection } from '@/types';

/**
 * Create a new conversation session.
 */
export async function createConversation(
  channel: string = 'web_poc',
  customerId?: string
): Promise<Conversation> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      channel,
      customer_id: customerId || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return data as Conversation;
}

/**
 * Get a conversation by ID with its messages.
 */
export async function getConversation(id: string): Promise<Conversation | null> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('conversations')
    .select('*, messages(*)')
    .eq('id', id)
    .order('created_at', { referencedTable: 'messages', ascending: true })
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch conversation: ${error.message}`);
  }

  return data as Conversation;
}

/**
 * Add a message to a conversation.
 */
export async function addMessage(
  conversationId: string,
  direction: MessageDirection,
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<Message> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      direction,
      content,
      metadata,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add message: ${error.message}`);
  return data as Message;
}

/**
 * Get recent messages from a conversation (for AI context window).
 */
export async function getRecentMessages(
  conversationId: string,
  limit: number = 20
): Promise<Message[]> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch messages: ${error.message}`);

  // Return in chronological order
  return ((data as Message[]) || []).reverse();
}

/**
 * Update conversation status (e.g., escalate to human).
 */
export async function updateConversationStatus(
  id: string,
  status: 'active' | 'closed' | 'escalated'
): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase
    .from('conversations')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(`Failed to update conversation: ${error.message}`);
}

/**
 * Find or create a customer record by phone number (essential for WhatsApp).
 */
export async function getOrCreateCustomerByPhone(
  phone: string,
  name?: string | null
): Promise<{ id: string; phone: string }> {
  const supabase = getServiceClient();
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const { data: existing } = await supabase
    .from('customers')
    .select('id, phone')
    .eq('phone', cleanPhone)
    .single();

  if (existing) {
    if (name) {
      await supabase.from('customers').update({ name }).eq('id', existing.id);
    }
    return existing;
  }

  const { data: created, error } = await supabase
    .from('customers')
    .insert({
      phone: cleanPhone,
      name: name || null,
    })
    .select('id, phone')
    .single();

  if (error) throw new Error(`Failed to create customer by phone: ${error.message}`);
  return created;
}

/**
 * Find an existing active conversation for a customer on WhatsApp channel.
 */
export async function findActiveWhatsAppConversation(
  customerId: string
): Promise<Conversation | null> {
  const supabase = getServiceClient();

  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('customer_id', customerId)
    .eq('channel', 'whatsapp')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  return (data as Conversation) || null;
}

