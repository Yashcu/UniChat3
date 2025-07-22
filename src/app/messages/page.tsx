"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ChatInterface } from "@/components/messaging/ChatInterface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useMessaging } from "@/contexts/MessagingContext";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Users, Search, Plus } from "lucide-react";

function MessagesContent() {
  const { conversations, activeConversation } = useMessaging();
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchUsers, setSearchUsers] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-background">
      {/* Sidebar - Conversation List */}
      <div
        className={`${showSidebar ? "w-80" : "w-0"} border-r bg-card transition-all duration-300 overflow-hidden`}
      >
        <ConversationList
          onSelectConversation={(id) => {
            // On mobile, hide sidebar when conversation is selected
            if (window.innerWidth < 768) {
              setShowSidebar(false);
            }
          }}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Messages
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewConversation(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Chat Interface */}
        <div className="flex-1">
          <ChatInterface />
        </div>
      </div>

      {/* New Conversation Modal - Simplified for now */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Start New Conversation
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <Input
                    type="search"
                    placeholder="Search for users..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="text-center py-4">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    User search functionality will be implemented next.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewConversation(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1">Start Chat</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Custom layout for messages - no sidebar/header from MainLayout */}
        <div className="border-b bg-card">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-semibold">Messages</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <MessagesContent />
      </div>
    </ProtectedRoute>
  );
}
