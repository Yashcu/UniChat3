import { useEffect, useRef } from "react";
import { createRealtimeChannel } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Message, User } from "@/types";

interface UseRealtimeParams {
  user: User | null;
  activeConversation: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>>;
  updateConversations: (message: Message) => void;
}

export function useRealtime({
  user,
  activeConversation,
  setMessages,
  setOnlineUsers,
  updateConversations,
}: UseRealtimeParams) {
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) {
      realtimeChannelRef.current?.unsubscribe();
      realtimeChannelRef.current = null;
      return;
    }

    const channel = createRealtimeChannel(`messaging-${user.id}`, user.id);

    realtimeChannelRef.current = channel;

    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMessage = payload.new as Message;
        if (
          newMessage.sender_id === user.id ||
          newMessage.recipient_id === user.id
        ) {
          updateConversations(newMessage);

          if (
            newMessage.sender_id === activeConversation ||
            newMessage.recipient_id === activeConversation
          ) {
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === newMessage.id)) return prev;
              const updated = [...prev, newMessage];
              return updated.slice(-50);
            });
          }
        }
      })
      .on("presence", { event: "sync" }, () => {
        const users = Object.keys(channel.presenceState()).filter((id) => id !== user.id);
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key !== user.id) {
          setOnlineUsers((prev) => (prev.includes(key) ? prev : [...prev, key]));
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== key));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      realtimeChannelRef.current?.unsubscribe();
      realtimeChannelRef.current = null;
    };
  }, [user, activeConversation, setMessages, setOnlineUsers, updateConversations]);
}
