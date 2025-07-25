"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types';
import { Conversation } from './types';
import { useAuth } from '@/hooks/useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';
import { calculateTotalUnread } from '@/lib/utils';

export function useMessaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  const loadConversations = useCallback(async (currentUserId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_user_conversations', { current_user_id: currentUserId });

    if (error) {
      console.error('Error loading conversations:', error);
      setIsLoading(false);
      return;
    }

     setConversations(data as unknown as Conversation[]);
    setUnreadCount(calculateTotalUnread(data as unknown as Conversation[]));
    setIsLoading(false);
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(first_name, last_name, avatar_url)')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${conversationId}),and(sender_id.eq.${conversationId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (!error) {
      setMessages(data as Message[]);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadConversations(user.id);
    }
  }, [user, loadConversations]);

  useEffect(() => {
    if (activeConversation) {
        loadMessages(activeConversation);
    } else {
        setMessages([]);
    }
  }, [activeConversation, loadMessages]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`messaging:${user.id}`, {
        config: {
            presence: { key: user.id },
        },
    });

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const newMessage = payload.new as Message;
          if (user) {
            loadConversations(user.id);
          }
          if (newMessage.recipient_id === user?.id && newMessage.sender_id === activeConversation) {
              setMessages(prev => [...prev, newMessage]);
          }
      })
      .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const userIds = Object.keys(presenceState);
          setOnlineUsers(userIds);
      })
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
        realtimeChannelRef.current?.unsubscribe();
    };
  }, [user, activeConversation, loadConversations]);

  const sendMessage = useCallback(async (content: string, recipientId?: string) => {
    if (!user || !content.trim() || !recipientId) return;

    await supabase.from('messages').insert({
        content: content.trim(),
        sender_id: user.id,
        recipient_id: recipientId,
    });
  }, [user]);

  const markAsRead = useCallback(async () => {
    // Mark as read logic
  }, []);

  const searchMessages = useCallback(() => {
    // Search logic
    return [];
  }, []);

  return {
    conversations,
    activeConversation,
    messages,
    unreadCount,
    isLoading,
    onlineUsers,
    setActiveConversation,
    sendMessage,
    markAsRead,
    searchMessages,
  };
}
