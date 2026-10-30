import { useMutation } from '@tanstack/react-query';
import { http } from '../../../lib/http';
import { AuthSession } from '../types';
import { useAuthStore } from '../store';

export function useLoginMutation() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await http.post<AuthSession>('/auth/login', credentials);
      return res;
    },
    onSuccess: (data) => {
      setSession(data);
    },
  });
}

export function useRegisterMutation() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (payload: { email: string; password: string; fullName: string }) => {
      const res = await http.post<AuthSession>('/auth/register', payload);
      return res;
    },
    onSuccess: (data) => {
      setSession(data);
    },
  });
}
