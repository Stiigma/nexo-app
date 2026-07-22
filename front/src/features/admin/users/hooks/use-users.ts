import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import type { UserDto, CreateUserPayload, UpdateUserPayload } from "../types";

const USERS_KEY = ["users"];

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => api.get<UserDto[]>("/users"),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => api.post<UserDto>("/users", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: USERS_KEY }); },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      api.put<UserDto>(`/users/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: USERS_KEY }); },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<UserDto>(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: USERS_KEY }); },
  });
}

export function useReactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<UserDto>(`/users/${id}/reactivate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: USERS_KEY }); },
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      api.post<{ message: string }>(`/users/${id}/reset-password`, { newPassword }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: USERS_KEY }); },
  });
}

export function useSendPasswordSetup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.post<{ message: string }>(`/users/${userId}/send-password-setup`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: USERS_KEY }); },
  });
}
