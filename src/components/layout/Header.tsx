"use client";

import React from "react";
import { Bell, Search, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMessaging } from "@/contexts/messaging/useMessaging";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const UserMenu = React.memo(() => {
  const { user, signOut } = useAuth();
  const userName = user ? `${user.first_name} ${user.last_name}` : "";

  return (
    <div className="flex items-center space-x-3">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium">{userName}</p>
        <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        className="w-8 h-8 rounded-full bg-secondary"
      >
        <User size={16} />
      </Button>
    </div>
  );
});

UserMenu.displayName = "UserMenu";

export function Header() {
  const { unreadCount } = useMessaging();

  return (
    <header className="bg-card border-b h-16 flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input type="search" placeholder="Search..." className="pl-10" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
        </Button>

        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount} unread</Badge>
        )}

        <UserMenu />
      </div>
    </header>
  );
}
