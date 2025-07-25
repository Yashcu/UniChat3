import { Message } from "@/types";

export interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  is_online?: boolean;
}

export interface MessagingContextType {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;
  onlineUsers: string[];
  setActiveConversation: (id: string | null) => void;
  sendMessage: (
    content: string,
    recipientId?: string,
    courseId?: string
  ) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  searchMessages: (query: string) => Message[];
}
