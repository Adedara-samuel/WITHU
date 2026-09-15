import { describe, expect, it } from "vitest";
import { getGameModule, InvalidMoveError } from "@withu/game-engine";

const players = [
  { userId: "samuel", name: "Samuel", avatarUrl: null },
  { userId: "eniobanke", name: "Eniobanke", avatarUrl: null },
];

describe("tic-tac-toe game module", () => {
  it("declares a winner on three in a row", () => {
    const module = getGameModule("tic_tac_toe");
    const { state: initial, firstTurnUserId } = module.createInitialState(players, "samuel");
    expect(firstTurnUserId).toBe("samuel");

    let state = initial;
    let currentTurnUserId: string | null = "samuel";
    // Samuel takes 0,1,2 (winning row); Eniobanke takes 3,4
    const moves: [string, number][] = [
      ["samuel", 0],
      ["eniobanke", 3],
      ["samuel", 1],
      ["eniobanke", 4],
      ["samuel", 2],
    ];

    let lastResult;
    for (const [playerId, position] of moves) {
      lastResult = module.applyMove({ state, players, currentTurnUserId, playerId, payload: { position } });
      state = lastResult.state;
      currentTurnUserId = lastResult.nextTurnUserId;
    }

    expect(lastResult!.status).toBe("completed");
    expect(lastResult!.winnerId).toBe("samuel");
    expect(lastResult!.isDraw).toBe(false);
  });

  it("rejects a move when it isn't that player's turn", () => {
    const module = getGameModule("tic_tac_toe");
    const { state } = module.createInitialState(players, "samuel");

    expect(() =>
      module.applyMove({ state, players, currentTurnUserId: "samuel", playerId: "eniobanke", payload: { position: 0 } })
    ).toThrow(InvalidMoveError);
  });

  it("rejects playing an already-occupied cell", () => {
    const module = getGameModule("tic_tac_toe");
    const { state: initial } = module.createInitialState(players, "samuel");
    const afterFirst = module.applyMove({
      state: initial,
      players,
      currentTurnUserId: "samuel",
      playerId: "samuel",
      payload: { position: 4 },
    });

    expect(() =>
      module.applyMove({
        state: afterFirst.state,
        players,
        currentTurnUserId: afterFirst.nextTurnUserId,
        playerId: "eniobanke",
        payload: { position: 4 },
      })
    ).toThrow(InvalidMoveError);
  });
});

describe("connect-four game module", () => {
  it("declares a winner on four vertically stacked discs", () => {
    const module = getGameModule("connect_four");
    let { state } = module.createInitialState(players, "samuel");
    let currentTurnUserId: string | null = "samuel";

    // Samuel drops into column 0 four times; Eniobanke drops into column 1 between turns.
    const columnSequence: [string, number][] = [
      ["samuel", 0],
      ["eniobanke", 1],
      ["samuel", 0],
      ["eniobanke", 1],
      ["samuel", 0],
      ["eniobanke", 1],
      ["samuel", 0],
    ];

    let lastResult;
    for (const [playerId, column] of columnSequence) {
      lastResult = module.applyMove({ state, players, currentTurnUserId, playerId, payload: { column } });
      state = lastResult.state;
      currentTurnUserId = lastResult.nextTurnUserId;
    }

    expect(lastResult!.status).toBe("completed");
    expect(lastResult!.winnerId).toBe("samuel");
  });
});

describe("couple questions game module", () => {
  it("alternates turns and completes after the question deck runs out", () => {
    const module = getGameModule("couple_questions");
    const { state: initial, firstTurnUserId } = module.createInitialState(players, "samuel");

    let state = initial;
    let currentTurnUserId = firstTurnUserId;
    let status: string = "active";
    let guard = 0;

    while (status === "active" && guard < 50) {
      const playerId = currentTurnUserId!;
      const result = module.applyMove({ state, players, currentTurnUserId, playerId, payload: { response: "My answer" } });
      state = result.state;
      currentTurnUserId = result.nextTurnUserId;
      status = result.status;
      guard++;
    }

    expect(status).toBe("completed");
    expect(guard).toBeGreaterThan(0);
  });
});
