import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import type { LoginInput, RegisterInput } from "@withu/validation";
import { AppError } from "../../common/errors";
import { env } from "../../config/env";
import { UserModel } from "../users/user.model";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

async function issueTokens(userId: string, coupleId: string | null, tokenVersion: number) {
  const accessToken = signAccessToken({ sub: userId, coupleId });
  const refreshToken = signRefreshToken({ sub: userId, tokenVersion });
  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const existing = await UserModel.findOne({ $or: [{ email: input.email }, { username: input.username }] });
  if (existing) {
    if (existing.email === input.email) throw AppError.conflict("An account with this email already exists");
    throw AppError.conflict("That username is already taken");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await UserModel.create({
    name: input.name,
    username: input.username,
    email: input.email,
    passwordHash,
  });

  const tokens = await issueTokens(user._id.toString(), null, user.tokenVersion);
  return { user, tokens };
}

export async function login(input: LoginInput) {
  const user = await UserModel.findOne({
    $or: [{ email: input.identifier }, { username: input.identifier }],
  }).select("+passwordHash");
  if (!user) throw AppError.unauthorized("Incorrect email/username or password");

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw AppError.unauthorized("Incorrect email/username or password");

  user.lastSeen = new Date();
  await user.save();

  const tokens = await issueTokens(user._id.toString(), user.coupleId?.toString() ?? null, user.tokenVersion);
  return { user, tokens };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  const user = await UserModel.findById(payload.sub);
  if (!user) throw AppError.unauthorized("Account no longer exists");
  if (user.tokenVersion !== payload.tokenVersion) {
    throw AppError.unauthorized("This session has been revoked");
  }

  const tokens = await issueTokens(user._id.toString(), user.coupleId?.toString() ?? null, user.tokenVersion);
  return { user, tokens };
}

/** Bumping tokenVersion invalidates every previously-issued refresh token (used on logout / password reset). */
export async function logout(userId: string) {
  await UserModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}

/**
 * Generates a one-time reset token. No transactional email provider is
 * configured for this project yet (see .env.example), so outside production
 * the raw token is returned to the caller for testing; in production it
 * would be handed to an email service instead of the response body.
 */
export async function requestPasswordReset(email: string) {
  const user = await UserModel.findOne({ email });
  if (!user) return { devToken: null };

  const token = crypto.randomBytes(32).toString("hex");
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  if (env.isProduction) {
    // eslint-disable-next-line no-console
    console.info(`[auth] password reset requested for ${user.email} - wire up an email provider to deliver it`);
    return { devToken: null };
  }
  return { devToken: token };
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await UserModel.findOne({ passwordResetTokenHash: hashToken(token) }).select(
    "+passwordResetTokenHash"
  );
  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() < Date.now()) {
    throw AppError.badRequest("This reset link is invalid or has expired");
  }
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  user.tokenVersion += 1;
  await user.save();
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await UserModel.findById(userId).select("+passwordHash");
  if (!user) throw AppError.notFound("User not found");
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw AppError.unauthorized("Current password is incorrect");
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.tokenVersion += 1;
  await user.save();
}
