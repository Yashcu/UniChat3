"use client";

import React, { createContext } from "react";
import { useMessaging } from "./useMessaging";
import { MessagingContextType } from "./types";

export const MessagingContext = createContext<MessagingContextType | undefined>(
  undefined
);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const messaging = useMessaging();

  return (
    <MessagingContext.Provider value={messaging}>
      {children}
    </MessagingContext.Provider>
  );
}
