import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, type AuthUser } from "@/lib/authApi";

type AuthContextValue = {
  user: AuthUser | null;
  isAnonymous: boolean;
  isLoading: boolean;
  setUser: (u: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAnonymous: true,
  isLoading: true,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isAnonymous = user == null;

  return (
    <AuthContext.Provider value={{ user, isAnonymous, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
