import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import type { Giveaway, GiveawayDetail, SyncResult, UserActivity, VerifyFollowsResult } from "../types";

const GIVEAWAY_KEY = ["giveaways"];

export function useGiveaways() {
  return useQuery({
    queryKey: GIVEAWAY_KEY,
    queryFn: () => api.get<Giveaway[]>("/giveaways"),
  });
}

export function useGiveawayDetail(id: string) {
  return useQuery({
    queryKey: [...GIVEAWAY_KEY, id],
    queryFn: () => api.get<GiveawayDetail>(`/giveaways/${id}`),
    enabled: !!id,
  });
}

export function useVerifyFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      giveawayId,
      commentId,
      verified,
    }: {
      giveawayId: string;
      commentId: string;
      verified: boolean;
    }) =>
      api.patch(`/giveaways/${giveawayId}/comments/${commentId}/verify-follow`, { verified }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...GIVEAWAY_KEY, vars.giveawayId] });
    },
  });
}

export function useVerifyStoryShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      giveawayId,
      participantId,
      verified,
    }: {
      giveawayId: string;
      participantId: string;
      verified: boolean;
    }) =>
      api.patch(`/giveaways/${giveawayId}/participants/${participantId}/verify-story`, { verified }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...GIVEAWAY_KEY, vars.giveawayId] });
    },
  });
}

export function useToggleParticipantActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      giveawayId,
      participantId,
      isActive,
    }: {
      giveawayId: string;
      participantId: string;
      isActive: boolean;
    }) =>
      api.patch(`/giveaways/${giveawayId}/participants/${participantId}/toggle-active`, { isActive }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [...GIVEAWAY_KEY, vars.giveawayId] });
    },
  });
}

export function useSyncGiveaway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (giveawayId: string) =>
      api.post<SyncResult>(`/giveaways/${giveawayId}/sync`),
    onSuccess: (_data, giveawayId) => {
      qc.invalidateQueries({ queryKey: [...GIVEAWAY_KEY, giveawayId] });
    },
  });
}

export function useUserActivity(username: string) {
  return useQuery({
    queryKey: [...GIVEAWAY_KEY, "user", username],
    queryFn: () => api.get<UserActivity>(`/giveaways/users/${username}/activity`),
    enabled: username.length > 0,
  });
}

export function useVerifyFollows() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (giveawayId: string) =>
      api.post<VerifyFollowsResult>(`/giveaways/${giveawayId}/verify-follows`, { followers: [] }),
    onSuccess: (_data, giveawayId) => {
      qc.invalidateQueries({ queryKey: [...GIVEAWAY_KEY, giveawayId] });
    },
  });
}

export function useCreateParticipantPenalty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ giveawayId, participantId, commentId, reason, note }: {
      giveawayId: string;
      participantId: string;
      commentId?: string;
      reason: string;
      note: string;
    }) => api.post(`/giveaways/${giveawayId}/participants/${participantId}/penalties`, { commentId, reason, note }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [...GIVEAWAY_KEY, variables.giveawayId] });
      qc.invalidateQueries({ queryKey: GIVEAWAY_KEY });
    },
  });
}

export function useRevokeParticipantPenalty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ giveawayId, participantId, penaltyId, note }: {
      giveawayId: string;
      participantId: string;
      penaltyId: string;
      note: string;
    }) => api.post(`/giveaways/${giveawayId}/participants/${participantId}/penalties/${penaltyId}/revoke`, { note }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [...GIVEAWAY_KEY, variables.giveawayId] });
      qc.invalidateQueries({ queryKey: GIVEAWAY_KEY });
    },
  });
}
