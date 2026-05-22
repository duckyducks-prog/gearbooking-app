"use client";
import React, { createContext, useContext, useState } from "react";

export type AppUser = { id: number; name: string; email: string; role: string };

const USERS: AppUser[] = [
  { id: 1, name: "Leticia De Bortoli", email: "leticia@studio.com", role: "admin" },
  { id: 2, name: "Marco Reyes",        email: "marco@studio.com",   role: "member" },
  { id: 3, name: "Jin Park",           email: "jin@studio.com",     role: "member" },
];

const UserContext = createContext<{
  user: AppUser;
  setUser: (u: AppUser) => void;
  users: AppUser[];
}>({ user: USERS[0], setUser: () => {}, users: USERS });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser>(USERS[0]);
  return (
    <UserContext.Provider value={{ user, setUser, users: USERS }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export { USERS };
