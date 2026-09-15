"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateMemoryInput, CreateMilestoneInput } from "@withu/validation";
import { memoriesApi } from "./api";

export function useMemories() {
  return useQuery({ queryKey: ["memories"], queryFn: () => memoriesApi.list() });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMemoryInput) => memoriesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memories"] }),
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => memoriesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memories"] }),
  });
}

export function useMilestones() {
  return useQuery({ queryKey: ["milestones"], queryFn: memoriesApi.listMilestones });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMilestoneInput) => memoriesApi.createMilestone(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["milestones"] }),
  });
}
