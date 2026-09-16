import type { SetMoodInput, SetStatusInput, UpdatePreferencesInput, UpdateProfileInput } from "@withu/validation";
import { AppError } from "../../common/errors";
import { UserModel } from "./user.model";

export async function getUserById(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw AppError.notFound("User not found");
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await getUserById(userId);
  if (input.name !== undefined) user.name = input.name;
  if (input.bio !== undefined) user.bio = input.bio;
  if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl;
  await user.save();
  return user;
}

export async function setMood(userId: string, input: SetMoodInput) {
  const user = await getUserById(userId);
  user.mood = input.mood;
  user.moodMessage = input.moodMessage ?? null;
  await user.save();
  return user;
}

export async function setStatus(userId: string, input: SetStatusInput) {
  const user = await getUserById(userId);
  user.status = input.status;
  await user.save();
  return user;
}

export async function updatePreferences(userId: string, input: UpdatePreferencesInput) {
  const user = await getUserById(userId);
  if (input.notifications) Object.assign(user.preferences.notifications, input.notifications);
  if (input.appearance) Object.assign(user.preferences.appearance, input.appearance);
  if (input.dataSaver) Object.assign(user.preferences.dataSaver, input.dataSaver);
  await user.save();
  return user;
}

export async function touchLastSeen(userId: string) {
  await UserModel.findByIdAndUpdate(userId, { lastSeen: new Date() });
}

export async function registerPushToken(userId: string, token: string) {
  await UserModel.findByIdAndUpdate(userId, { $addToSet: { pushTokens: token } });
}

export async function removePushToken(userId: string, token: string) {
  await UserModel.findByIdAndUpdate(userId, { $pull: { pushTokens: token } });
}
