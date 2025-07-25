import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Message, User } from "@/types";
import { Conversation } from "./types";
import { calculateTotalUnread } from "@/lib/utils";

interface UseMessagesParams {
  user: User | null;
  activeConversation: string | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

export function useMessages({
  user,
  activeConversation,
  messages,
  setMessages,
  conversations,
  setConversations,
  setUnreadCount,
}: UseMessagesParams) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("messages")
          .select(
            `
            *,
            sender:users!sender_id(first_name, last_name, avatar_url)
          `
          )
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${conversationId}),and(sender_id.eq.${conversationId},recipient_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true })
          .limit(50);
        if (error) throw error;
        setMessages(data as Message[]);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError("Failed to load messages.");
        }
      } finally {
        setLoading(false);
      }
    },
    [user, setMessages]
  );

  const sendMessage = useCallback(
    async (content: string, recipientId?: string, courseId?: string) => {
      if (!user || !content.trim()) return;
      const targetRecipientId = recipientId || activeConversation;
      if (!targetRecipientId && !courseId) return;
      try {
        const messageData = {
          sender_id: user.id,
          recipient_id: targetRecipientId,
          course_id: courseId,
          content: content.trim(),
          message_type: "text",
        };
        const { error } = await supabase
          .from("messages")
          .insert([messageData])
          .select()
          .single();
        if (error) throw error;
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError("Failed to send message.");
        }
        throw err;
      }
    },
    [user, activeConversation]
  );

  const markAsRead = useCallback(
    async (conversationId: string) => {
      try {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
          )
        );
        setUnreadCount(
          calculateTotalUnread(
            conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
            )
          )
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError("Failed to mark messages as read.");
        }
      }
    },
    [conversations, setConversations, setUnreadCount]
  );

  const searchMessages = useCallback(
    (query: string): Message[] => {
      if (!query.trim()) return [];
      return messages.filter((msg) =>
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
    },
    [messages]
  );

  return {
    loadMessages,
    sendMessage,
    markAsRead,
    searchMessages,
    error,
    loading,
  };
}
