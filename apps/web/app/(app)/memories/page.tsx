"use client";

import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateMemoryDialog } from "@/features/memories/components/create-memory-dialog";
import { MemoryCard } from "@/features/memories/components/memory-card";
import { StoryTimeline } from "@/features/memories/components/story-timeline";
import { useMemories } from "@/features/memories/hooks";

export default function MemoriesPage() {
  const { data, isLoading } = useMemories();
  const memories = data?.memories ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Together</p>
          <h1 className="font-display text-2xl font-medium">Our Memories</h1>
        </div>
        <CreateMemoryDialog />
      </div>

      <Tabs defaultValue="memories">
        <TabsList>
          <TabsTrigger value="memories">Memories</TabsTrigger>
          <TabsTrigger value="story">Our Story</TabsTrigger>
        </TabsList>

        <TabsContent value="memories">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : memories.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <p className="font-display text-lg">No memories yet ❤️</p>
              <p className="text-sm">Your first memory together will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {memories.map((m) => (
                <MemoryCard key={m.id} memory={m} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="story">
          <StoryTimeline />
        </TabsContent>
      </Tabs>
    </div>
  );
}
