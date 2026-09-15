import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { createCoupleWithTwoPartners } from "./helpers";

const app = createApp();

describe("love drops", () => {
  it("delivers an immediate love drop to the partner and lets only them open it", async () => {
    const { samuel, eniobanke } = await createCoupleWithTwoPartners(app);

    const send = await request(app)
      .post("/api/love-drops")
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
      .send({ kind: "text", message: "I miss you." });
    expect(send.status).toBe(201);
    expect(send.body.data.recipientId).toBeTruthy();
    expect(send.body.data.deliveredAt).toBeTruthy();

    const openBySender = await request(app)
      .post(`/api/love-drops/${send.body.data.id}/open`)
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`);
    expect(openBySender.status).toBe(403);

    const openByRecipient = await request(app)
      .post(`/api/love-drops/${send.body.data.id}/open`)
      .set("Authorization", `Bearer ${eniobanke.tokens.accessToken}`);
    expect(openByRecipient.status).toBe(200);
    expect(openByRecipient.body.data.openedAt).toBeTruthy();
  });

  it("records affection events for the couple", async () => {
    const { samuel, eniobanke } = await createCoupleWithTwoPartners(app);

    const hug = await request(app)
      .post("/api/love-drops/affection")
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
      .send({ kind: "hug" });
    expect(hug.status).toBe(201);
    expect(hug.body.data.kind).toBe("hug");

    const history = await request(app)
      .get("/api/love-drops/affection/history")
      .set("Authorization", `Bearer ${eniobanke.tokens.accessToken}`);
    expect(history.body.data).toHaveLength(1);
  });
});
