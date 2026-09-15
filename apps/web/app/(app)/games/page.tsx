"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GameCard } from "@/features/games/components/game-card";
import { useCreateGameSession, useGameCatalog, useGameSessions } from "@/features/games/hooks";
import { useAuthStore } from "@/stores/auth-store";

const STATUS_LABEL: Record<string, string> = {
  invited: "Waiting for response",
  active: "In progress",
  completed: "Finished",
  declined: "Declined",
  cancelled: "Cancelled",
};

export default function GamesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: catalog = [], isLoading: catalogLoading } = useGameCatalog();
  const { data: sessions = [] } = useGameSessions();
  const createSession = useCreateGameSession();

  const romantic = catalog.filter((g) => g.category === "romantic");
  const logical = catalog.filter((g) => g.category === "logical");

  const handlePlay = async (gameKey: (typeof catalog)[number]["key"]) => {
    const session = await createSession.mutateAsync(gameKey);
    router.push(`/games/${session.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Together</p>
        <h1 className="font-display text-2xl font-medium">Games</h1>
        <p className="text-sm text-muted-foreground">Invite each other to play — every move happens in realtime.</p>
      </div>

      {sessions.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">Your games</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {sessions.slice(0, 6).map((s) => (
              <Card
                key={s.id}
                className="cursor-pointer transition-colors hover:border-primary"
                onClick={() => router.push(`/games/${s.id}`)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium capitalize">{s.gameKey.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.players.map((p) => p.name).join(" & ")}
                    </p>
                  </div>
                  <Badge variant={s.status === "active" ? "success" : "secondary"}>
                    {s.winnerId === user?.id ? "You won 🎉" : STATUS_LABEL[s.status]}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {catalogLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">Romantic</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {romantic.map((g) => (
                <GameCard key={g.key} game={g} onPlay={() => handlePlay(g.key)} pending={createSession.isPending} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">Logical</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {logical.map((g) => (
                <GameCard key={g.key} game={g} onPlay={() => handlePlay(g.key)} pending={createSession.isPending} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
