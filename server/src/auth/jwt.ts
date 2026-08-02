import jwt from "jsonwebtoken";

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "Missing environment variable: JWT_ACCESS_SECRET or JWT_SECRET",
    );
  }
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "Missing environment variable: JWT_REFRESH_SECRET or JWT_SECRET",
    );
  }
  return secret;
}

export interface TokenPayload {
  userId: number;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getAccessSecret(), { expiresIn: "15m" });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getAccessSecret()) as TokenPayload;
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: "7d" });
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, getRefreshSecret()) as TokenPayload;
}

// Keep old names as aliases for backward compatibility during migration
export const signToken = signAccessToken;
export const verifyToken = verifyAccessToken;
