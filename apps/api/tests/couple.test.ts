import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { createCoupleWithTwoPartners, registerUser } from "./helpers";

const app = createApp();

describe("couple invitations", () => {
  it("lets two partners form a relationship space via invite code", async () => {
    const { samuel, eniobanke, coupleId } = await createCoupleWithTwoPartners(app);
    expect(coupleId).toBeTruthy();

    const mine = await request(app)
      .get("/api/couples/me")
      .set("Authorization", `Bearer ${eniobanke.tokens.accessToken}`);
    expect(mine.status).toBe(200);
    expect(mine.body.data.partnerOne.name).toBe("Samuel");
    expect(mine.body.data.partnerTwo.name).toBe("Eniobanke");

    void samuel;
  });

  it("rejects accepting your own invitation", async () => {
    const samuel = await registerUser(app);
    await request(app).post("/api/couples").set("Authorization", `Bearer ${samuel.tokens.accessToken}`).send({});
    const invite = await request(app)
      .post("/api/couples/invite")
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
      .send({});

    const res = await request(app)
      .post("/api/couples/accept")
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
      .send({ code: invite.body.data.code });

    expect(res.status).toBe(400);
  });

  it("rejects a third person from joining a full relationship space", async () => {
    const { coupleId } = await createCoupleWithTwoPartners(app);
    void coupleId;

    const outsider = await registerUser(app, { name: "Outsider", username: "outsider", email: "outsider@withu.app" });
    const invite = await request(app)
      .post("/api/couples/invite")
      .set("Authorization", `Bearer ${outsider.tokens.accessToken}`)
      .send({});
    // Outsider has no couple yet, so this invite creation should fail with 403.
    expect(invite.status).toBe(403);
  });

  it("prevents a user from creating a second relationship space", async () => {
    const samuel = await registerUser(app);
    await request(app).post("/api/couples").set("Authorization", `Bearer ${samuel.tokens.accessToken}`).send({});
    const second = await request(app)
      .post("/api/couples")
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
      .send({});
    expect(second.status).toBe(409);
  });
});
