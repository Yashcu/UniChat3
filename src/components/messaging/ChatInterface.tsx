"use client";

import { useState, useRef, useEffect } from "react";
import { useMessaging } from "@/contexts/MessagingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Phone, Video, MoreVertical, Smile } from "lucide-react";
import { formatDateTime, getInitials } from "@/lib/utils";

export function ChatInterface() {
  const {
    messages,
    activeConversation,
    sendMessage,
    conversations,
    onlineUsers,
  } = useMessaging();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(
    (conv) => conv.id === activeConversation
  );

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(messageText, activeConversation || undefined);
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!activeConversation || !activeConv) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Send className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
        <p className="text-muted-foreground max-w-md">
          Select a conversation from the sidebar to start messaging, or search
          for someone new to connect with.
        </p>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(activeConv.participant_id);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              {activeConv.participant_avatar ? (
                <img
                  src={activeConv.participant_avatar}
                  alt={activeConv.participant_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {getInitials(
                      activeConv.participant_name.split(" ")[0] || null,
                      activeConv.participant_name.split(" ")[1] || null
                    )}
                  </span>
                </div>
              )}
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>

          <div>
            <h3 className="font-semibold">{activeConv.participant_name}</h3>
            <p className="text-xs text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-2">No messages yet</h4>
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending a message below.
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.sender_id === user?.id;
              const showAvatar =
                index === 0 ||
                messages[index - 1]?.sender_id !== message.sender_id;
              const showTimestamp =
                index === messages.length - 1 ||
                new Date(messages[index + 1]?.created_at).getTime() -
                  new Date(message.created_at).getTime() >
                  300000; // 5 minutes

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} items-end space-x-2 max-w-[70%]`}
                  >
                    {showAvatar && !isOwn && (
                      <Avatar className="w-8 h-8">
                        {message.sender?.avatar_url ? (
                          <img
                            src={message.sender.avatar_url}
                            alt="Sender"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {getInitials(
                                message.sender?.first_name || null,
                                message.sender?.last_name || null
                              )}
                            </span>
                          </div>
                        )}
                      </Avatar>
                    )}

                    <div
                      className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-full break-words ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>

                      {showTimestamp && (
                        <span className="text-xs text-muted-foreground mt-1 px-2">
                          {formatDateTime(message.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Smile className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sending}
              className="pr-12"
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift + Enter for new line</span>
          {sending && <span>Sending...</span>}
        </div>
      </div>
    </div>
  );
}
