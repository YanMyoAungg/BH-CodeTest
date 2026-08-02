import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import db from "../../db/connection.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from "../../auth/jwt.js";

export async function login(
  _: unknown,
  args: { username: string; password: string },
) {
  const row = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(args.username) as
    { id: number; username: string; password: string } | undefined;

  if (!row) {
    throw new GraphQLError("Invalid username or password.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  const valid = await bcrypt.compare(args.password, row.password);
  if (!valid) {
    throw new GraphQLError("Invalid username or password.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  const accessToken = signAccessToken({ userId: row.id });
  const refreshToken = signRefreshToken({ userId: row.id });

  return {
    accessToken,
    refreshToken,
    user: { id: String(row.id), username: row.username },
  };
}

export async function refreshToken(_: unknown, args: { token: string }) {
  let payload: TokenPayload;

  try {
    payload = verifyRefreshToken(args.token);
  } catch {
    throw new GraphQLError("Invalid or expired refresh token.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  // Rotation: issue a new refresh token, old one becomes invalid naturally via expiry
  const accessToken = signAccessToken({ userId: payload.userId });
  const newRefreshToken = signRefreshToken({ userId: payload.userId });

  const userRow = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(payload.userId) as { id: number; username: string };

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: { id: String(userRow.id), username: userRow.username },
  };
}
