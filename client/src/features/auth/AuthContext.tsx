import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { apolloClient } from "@/shared/apollo/client";
import { STORAGE } from "@/shared/constants";
import type { AuthContextValue, User } from "./types";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE.token),
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE.refreshToken),
  );
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE.user);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!token && !!user;

  const persistTokens = (
    accessToken: string,
    newRefreshToken: string,
    newUser: User,
  ) => {
    localStorage.setItem(STORAGE.token, accessToken);
    localStorage.setItem(STORAGE.refreshToken, newRefreshToken);
    localStorage.setItem(STORAGE.user, JSON.stringify(newUser));
  };

  const setTokens = useCallback(
    (accessToken: string, newRefreshToken: string, newUser: User) => {
      setToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUser(newUser);
      persistTokens(accessToken, newRefreshToken, newUser);
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE.token);
    localStorage.removeItem(STORAGE.refreshToken);
    localStorage.removeItem(STORAGE.user);
    apolloClient.clearStore();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        user,
        isAuthenticated,
        login: setTokens,
        logout,
        setTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
