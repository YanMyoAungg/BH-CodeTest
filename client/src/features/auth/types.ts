export interface User {
  id: string;
  username: string;
}

export interface AuthContextValue {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string, user: User) => void;
}
