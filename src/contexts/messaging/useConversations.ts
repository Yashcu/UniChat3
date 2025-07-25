import { useCallback, useState } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { Conversation } from "./types";
import { Message } from "@/types";
import { calculateTotalUnread } from "@/lib/utils";

interface UseConversationsParams {
  user: User | null;
  onlineUsers: string[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useConversations({
  user,
  onlineUsers,
  setConversations,
  setUnreadCount,
  setIsLoading,
}: UseConversationsParams) {
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .rpc("get_user_conversations", { current_user_id: user.id });

      if (error) throw error;

      // FIX: Cast to 'unknown' first to safely convert from 'Json' to 'Conversation[]'
      const conversationsData = data as unknown as Conversation[];

      const conversationsWithOnlineStatus = conversationsData.map((conv) => ({
        ...conv,
        is_online: onlineUsers.includes(conv.id),
      }));

      setConversations(conversationsWithOnlineStatus);
      setUnreadCount(calculateTotalUnread(conversationsData));
    } catch (err: unknown) {
      console.error("Error loading conversations:", err);
      if (err instanceof Error) {
        setError("Failed to load conversations.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, onlineUsers, setConversations, setUnreadCount, setIsLoading]);

  const updateConversations = useCallback(
    (newMessage: Message) => {
      const otherUserId =
        newMessage.sender_id === user?.id
          ? newMessage.recipient_id
          : newMessage.sender_id;

      if (!otherUserId) return;

      setConversations((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((c) => c.id === otherUserId);

        if (index >= 0) {
          updated[index] = {
            ...updated[index],
            last_message: newMessage.content,
            last_message_time: newMessage.created_at,
            unread_count:
              newMessage.sender_id !== user?.id
                ? updated[index].unread_count + 1
                : updated[index].unread_count,
          };
        } else {
          updated.unshift({
            id: otherUserId,
            participant_id: otherUserId,
            participant_name: "Unknown", // This should be updated with the actual user's name
            unread_count: 1,
            last_message: newMessage.content,
            last_message_time: newMessage.created_at,
            is_online: onlineUsers.includes(otherUserId),
          });
        }

        return updated.sort(
          (a, b) =>
            new Date(b.last_message_time || 0).getTime() -
            new Date(a.last_message_time || 0).getTime()
        );
      });

      if (newMessage.sender_id !== user?.id) {
        setUnreadCount((prev) => prev + 1);
      }
    },
    [user, setConversations, setUnreadCount, onlineUsers]
  );

  return {
    loadConversations,
    updateConversations,
    error,
  };
}
