import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { createCoupleWithTwoPartners } from "./helpers";

const app = createApp();

describe("messages", () => {
  it("sends and lists messages within a couple", async () => {
    const { samuel, eniobanke } = await createCoupleWithTwoPartners(app);

    const send = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
      .send({ type: "text", text: "Good morning!" });
    expect(send.status).toBe(201);

    const list = await request(app)
      .get("/api/messages")
      .set("Authorization", `Bearer ${eniobanke.tokens.accessToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data.messages).toHaveLength(1);
    expect(list.body.data.messages[0].text).toBe("Good morning!");
  });

  it("only lets the sender edit or delete their own message", async () => {
    const { samuel, eniobanke } = await createCoupleWithTwoPartners(app);
    const send = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
      .send({ type: "text", text: "Original" });
    const messageId = send.body.data.id;

    const editByOther = await request(app)
      .patch(`/api/messages/${messageId}`)
      .set("Authorization", `Bearer ${eniobanke.tokens.accessToken}`)
      .send({ text: "Hacked" });
    expect(editByOther.status).toBe(403);

    const editByOwner = await request(app)
      .patch(`/api/messages/${messageId}`)
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
      .send({ text: "Edited" });
    expect(editByOwner.status).toBe(200);
    expect(editByOwner.body.data.text).toBe("Edited");
  });

  it("never leaks another couple's messages, even when guessing a valid message id", async () => {
    const coupleA = await createCoupleWithTwoPartners(app);
    const send = await request(app)
      .post("/api/messages")
      .set("Authorization", `Bearer ${coupleA.samuel.tokens.accessToken}`)
      .send({ type: "text", text: "Private to couple A" });
    const messageId = send.body.data.id;

    const strangerRegister = await request(app).post("/api/auth/register").send({
      name: "Stranger",
      username: "strangerone",
      email: "stranger1@withu.app",
      password: "password123",
    });
    const strangerPartner = await request(app).post("/api/auth/register").send({
      name: "StrangerTwo",
      username: "strangertwo",
      email: "stranger2@withu.app",
      password: "password123",
    });
    const strangerToken = strangerRegister.body.data.tokens.accessToken;
    await request(app).post("/api/couples").set("Authorization", `Bearer ${strangerToken}`).send({});
    const strangerInvite = await request(app)
      .post("/api/couples/invite")
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({});
    await request(app)
      .post("/api/couples/accept")
      .set("Authorization", `Bearer ${strangerPartner.body.data.tokens.accessToken}`)
      .send({ code: strangerInvite.body.data.code });

    const strangerList = await request(app)
      .get("/api/messages")
      .set("Authorization", `Bearer ${strangerToken}`);
    expect(strangerList.body.data.messages).toHaveLength(0);

    const strangerEditAttempt = await request(app)
      .patch(`/api/messages/${messageId}`)
      .set("Authorization", `Bearer ${strangerToken}`)
      .send({ text: "Hacked from another couple" });
    expect(strangerEditAttempt.status).toBe(404);
  });
});
