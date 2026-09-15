import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

const validUser = {
  name: "Samuel",
  username: "samuel",
  email: "samuel@withu.app",
  password: "password123",
};

describe("auth", () => {
  it("registers a new user and returns tokens", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.tokens.accessToken).toBeTruthy();
    expect(res.body.data.tokens.refreshToken).toBeTruthy();
  });

  it("rejects registering the same email twice", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, username: "samuel2" });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("logs in with correct credentials and rejects wrong password", async () => {
    await request(app).post("/api/auth/register").send(validUser);

    const good = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });
    expect(good.status).toBe(200);
    expect(good.body.data.user.username).toBe("samuel");

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "wrong-password" });
    expect(bad.status).toBe(401);
  });

  it("refreshes tokens and can log out to invalidate the old refresh token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(validUser);
    const { accessToken, refreshToken } = registerRes.body.data.tokens;

    const refreshRes = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.tokens.accessToken).toBeTruthy();

    await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${accessToken}`).send();

    const staleRefresh = await request(app).post("/api/auth/refresh").send({ refreshToken });
    expect(staleRefresh.status).toBe(401);
  });

  it("blocks protected routes without a token", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });
});
