import type { Express } from "express";
import request from "supertest";

export async function registerUser(app: Express, overrides: Partial<{ name: string; username: string; email: string; password: string }> = {}) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: overrides.name ?? "Samuel",
      username: overrides.username ?? "samuel",
      email: overrides.email ?? "samuel@withu.app",
      password: overrides.password ?? "password123",
    });
  return res.body.data as { user: { id: string }; tokens: { accessToken: string; refreshToken: string } };
}

export async function createCoupleWithTwoPartners(app: Express) {
  const samuel = await registerUser(app, { name: "Samuel", username: "samuel", email: "samuel@withu.app" });
  const eniobanke = await registerUser(app, { name: "Eniobanke", username: "eniobanke", email: "eniobanke@withu.app" });

  await request(app)
    .post("/api/couples")
    .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
    .send({});

  const invite = await request(app)
    .post("/api/couples/invite")
    .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
    .send({});

  const accept = await request(app)
    .post("/api/couples/accept")
    .set("Authorization", `Bearer ${eniobanke.tokens.accessToken}`)
    .send({ code: invite.body.data.code });

  return { samuel, eniobanke, coupleId: accept.body.data.id as string };
}
