"use client";

import { useState, useMemo } from "react";
import { useMessaging } from "@/contexts/messaging/useMessaging";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Conversation } from "@/contexts/messaging/types";

const ConversationItem = ({
  conversation,
  isActive,
  onSelect,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
}) => {
  const { onlineUsers } = useMessaging();
  const isOnline = onlineUsers.includes(conversation.participant_id);

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
    >
      <div className="relative">
        <Avatar className="w-10 h-10">{/* Avatar logic here */}</Avatar>
        {isOnline && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4
            className={`text-sm font-medium truncate ${isActive ? "text-primary-foreground" : ""}`}
          >
            {conversation.participant_name}
          </h4>
          {conversation.last_message_time && (
            <span
              className={`text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}
            >
              {formatDateTime(conversation.last_message_time)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p
            className={`text-xs truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}
          >
            {conversation.last_message || "No messages yet"}
          </p>
          {conversation.unread_count > 0 && (
            <Badge variant={isActive ? "secondary" : "destructive"}>
              {conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export function ConversationList({
  onSelectConversation,
}: {
  onSelectConversation?: (conversationId: string) => void;
}) {
  const { conversations, activeConversation, setActiveConversation } =
    useMessaging();
  const [searchTerm] = useState("");
  const [filter] = useState<"all" | "unread">("all");

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch = conv.participant_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filter === "all" || (filter === "unread" && conv.unread_count > 0);
      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchTerm, filter]);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    onSelectConversation?.(conversationId);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-sm font-medium">No conversations found</h3>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={activeConversation === conversation.id}
                  onSelect={handleSelectConversation}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
