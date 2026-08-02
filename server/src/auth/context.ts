import type { IncomingMessage } from "http";
import { verifyAccessToken, type TokenPayload } from "./jwt.js";

export interface Context {
  user: TokenPayload | null;
}

export async function createContext({
  req,
}: {
  req: IncomingMessage;
}): Promise<Context> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null };
  }

  const token = authHeader.slice(7);

  try {
    const user = verifyAccessToken(token);
    return { user };
  } catch {
    return { user: null };
  }
}
