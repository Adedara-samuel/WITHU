import type { AuthenticatedUser, AuthTokens } from "@withu/shared-types";
import type { LoginInput, RegisterInput } from "@withu/validation";
import { apiFetch } from "@/lib/api-client";

interface AuthPayload {
  user: AuthenticatedUser;
  tokens: AuthTokens;
}

export const authApi = {
  register: (input: RegisterInput) => apiFetch<AuthPayload>("/api/auth/register", { method: "POST", body: input, skipAuth: true }),
  login: (input: LoginInput) => apiFetch<AuthPayload>("/api/auth/login", { method: "POST", body: input, skipAuth: true }),
  logout: () => apiFetch<{ loggedOut: boolean }>("/api/auth/logout", { method: "POST" }),
  me: () => apiFetch<AuthenticatedUser>("/api/users/me"),
};
