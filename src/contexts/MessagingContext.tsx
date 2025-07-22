"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase, createRealtimeChannel } from "@/lib/supabase";
import { Message } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string | null;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  is_online?: boolean;
}

interface MessagingContextType {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;
  setActiveConversation: (conversationId: string | null) => void;
  sendMessage: (
    content: string,
    recipientId?: string,
    courseId?: string
  ) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  searchMessages: (query: string) => Message[];
  onlineUsers: string[];
}

const MessagingContext = createContext<MessagingContextType | undefined>(
  undefined
);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [realtimeChannel, setRealtimeChannel] =
    useState<RealtimeChannel | null>(null);

  // Initialize real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = createRealtimeChannel("messaging");

    // Listen for new messages
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as Message;
          if (
            newMessage.sender_id === user.id ||
            newMessage.recipient_id === user.id
          ) {
            setMessages((prev) => [...prev, newMessage]);
            updateConversations(newMessage);
          }
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).filter((key) => key !== user.id);
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key !== user.id) {
          setOnlineUsers((prev) => [...new Set([...prev, key])]);
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== key));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Track user presence
          channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    setRealtimeChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages for active conversation
  useEffect(() => {
    if (activeConversation && user) {
      loadMessages(activeConversation);
    }
  }, [activeConversation, user]);

  const loadConversations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get recent conversations
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:users!sender_id(id, first_name, last_name, avatar_url),
          recipient:users!recipient_id(id, first_name, last_name, avatar_url)
        `
        )
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Process conversations
      const conversationMap = new Map<string, Conversation>();

      messagesData?.forEach((message) => {
        const otherUser =
          message.sender_id === user.id ? message.recipient : message.sender;
        if (!otherUser) return;

        const conversationId =
          message.sender_id === user.id
            ? message.recipient_id
            : message.sender_id;
        if (!conversationId) return;

        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: conversationId,
            participant_id: otherUser.id,
            participant_name:
              `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.trim(),
            participant_avatar: otherUser.avatar_url,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0, // Would need additional query for accurate count
            is_online: onlineUsers.includes(otherUser.id),
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));

      // Calculate total unread count
      const totalUnread = Array.from(conversationMap.values()).reduce(
        (sum, conv) => sum + conv.unread_count,
        0
      );
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) return;

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
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async (
    content: string,
    recipientId?: string,
    courseId?: string
  ) => {
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

      const { data, error } = await supabase
        .from("messages")
        .insert([messageData])
        .select(
          `
          *,
          sender:users!sender_id(first_name, last_name, avatar_url)
        `
        )
        .single();

      if (error) throw error;

      // Message will be added via real-time subscription
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const markAsRead = async (conversationId: string) => {
    // Implementation would mark messages as read
    // For now, just update local state
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      )
    );
  };

  const searchMessages = useCallback(
    (query: string): Message[] => {
      if (!query.trim()) return [];

      return messages.filter((message) =>
        message.content.toLowerCase().includes(query.toLowerCase())
      );
    },
    [messages]
  );

  const updateConversations = (newMessage: Message) => {
    const otherUserId =
      newMessage.sender_id === user?.id
        ? newMessage.recipient_id
        : newMessage.sender_id;
    if (!otherUserId) return;

    setConversations((prev) => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(
        (conv) => conv.id === otherUserId
      );

      if (existingIndex >= 0) {
        updated[existingIndex] = {
          ...updated[existingIndex],
          last_message: newMessage.content,
          last_message_time: newMessage.created_at,
          unread_count:
            newMessage.sender_id !== user?.id
              ? updated[existingIndex].unread_count + 1
              : updated[existingIndex].unread_count,
        };
      } else {
        // Would need to fetch user details for new conversation
        // This is a simplified version
      }

      return updated.sort(
        (a, b) =>
          new Date(b.last_message_time || 0).getTime() -
          new Date(a.last_message_time || 0).getTime()
      );
    });
  };

  const value = {
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

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
}
