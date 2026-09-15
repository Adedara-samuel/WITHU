import { describe, expect, it } from "vitest";
import request from "supertest";
import { needsResync } from "@withu/shared-utils";
import { createApp } from "../src/app";
import { createCoupleWithTwoPartners, registerUser } from "./helpers";

const app = createApp();

describe("watch together drift correction", () => {
  it("only flags resync once drift exceeds the tolerance", () => {
    expect(needsResync(100, 100.5)).toBe(false);
    expect(needsResync(100, 102)).toBe(true);
  });
});

describe("watch sessions", () => {
  it("lets a host create a session and the partner join and sync playback", async () => {
    const { samuel, eniobanke } = await createCoupleWithTwoPartners(app);

    const create = await request(app)
      .post("/api/watch/sessions")
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
      .send({ media: { providerId: "youtube", mediaId: "abc123", title: "Our movie night" } });
    expect(create.status).toBe(201);
    const sessionId = create.body.data.id;

    const join = await request(app)
      .post(`/api/watch/sessions/${sessionId}/join`)
      .set("Authorization", `Bearer ${eniobanke.tokens.accessToken}`);
    expect(join.status).toBe(200);
    expect(join.body.data.status).toBe("active");

    const play = await request(app)
      .post(`/api/watch/sessions/${sessionId}/join`)
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`);
    expect(play.status).toBe(200);
  });

  it("blocks someone outside the relationship space from reaching the session", async () => {
    const { samuel } = await createCoupleWithTwoPartners(app);
    const create = await request(app)
      .post("/api/watch/sessions")
      .set("Authorization", `Bearer ${samuel.tokens.accessToken}`)
      .send({ media: { providerId: "youtube", mediaId: "abc123", title: "Our movie night" } });
    const sessionId = create.body.data.id;

    const outsider = await registerUser(app, { name: "Outsider", username: "outsider9", email: "outsider9@withu.app" });
    const res = await request(app)
      .get(`/api/watch/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${outsider.tokens.accessToken}`);
    expect(res.status).toBe(403);
  });
});
