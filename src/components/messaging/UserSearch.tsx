"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageCircle } from "lucide-react";
import { User } from "@/types";
import { getInitials } from "@/lib/utils";

interface UserSearchProps {
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

export function UserSearch({ onSelectUser, onClose }: UserSearchProps) {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.university_id && searchTerm.length > 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm, currentUser]);

  const searchUsers = async () => {
    if (!currentUser?.university_id) return;

    setLoading(true);
    try {
      const allUsers = await userService.getUsersByUniversity(
        currentUser.university_id
      );
      const filteredUsers = allUsers
        .filter(
          (user) =>
            user.id !== currentUser.id && // Exclude current user
            (user.first_name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
              user.last_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 10); // Limit results

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <Input
          type="search"
          placeholder="Search for users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-64">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {searchTerm.length < 3
              ? "Type at least 3 characters to search"
              : "No users found"}
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <Avatar className="w-10 h-10">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {getInitials(user.first_name, user.last_name)}
                      </span>
                    </div>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {user.email} • {user.role}
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
