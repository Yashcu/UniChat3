"use client";

import { useState } from "react";
import { useMessaging } from "@/contexts/MessagingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Search, MessageCircle, Users } from "lucide-react";
import { formatDateTime, getInitials } from "@/lib/utils";

interface ConversationListProps {
  onSelectConversation?: (conversationId: string) => void;
}

export function ConversationList({
  onSelectConversation,
}: ConversationListProps) {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    unreadCount,
    onlineUsers,
  } = useMessaging();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.participant_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" || (filter === "unread" && conv.unread_count > 0);
    return matchesSearch && matchesFilter;
  });

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    onSelectConversation?.(conversationId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Messages
          </h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            type="search"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="flex-1"
          >
            Unread
          </Button>
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {searchTerm ? "No conversations found" : "No conversations yet"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start a conversation with your classmates or instructors"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => {
                const isActive = activeConversation === conversation.id;
                const isOnline = onlineUsers.includes(
                  conversation.participant_id
                );

                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        {conversation.participant_avatar ? (
                          <img
                            src={conversation.participant_avatar}
                            alt={conversation.participant_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {getInitials(
                                conversation.participant_name.split(" ")[0],
                                conversation.participant_name.split(" ")[1]
                              )}
                            </span>
                          </div>
                        )}
                      </Avatar>

                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-medium truncate ${
                            isActive
                              ? "text-primary-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {conversation.participant_name}
                        </h4>
                        {conversation.last_message_time && (
                          <span
                            className={`text-xs ${
                              isActive
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatDateTime(conversation.last_message_time)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs truncate ${
                            isActive
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {conversation.last_message || "No messages yet"}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-2 text-xs px-2 py-0.5 min-w-[20px] h-5"
                          >
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
