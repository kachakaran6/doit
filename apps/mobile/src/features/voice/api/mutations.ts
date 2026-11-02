import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../../../lib/http';

export interface VoiceNoteResponse {
  id: string;
  state: 'TRANSCRIBING' | 'READY' | 'FAILED';
  durationMs: number;
  text?: string;
  rawTranscript?: string;
  language: string;
  createdAt: string;
}

export function useCreateVoiceNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      uri,
      durationMs,
      language = 'en-IN',
    }: {
      uri: string;
      durationMs: number;
      language?: string;
    }) => {
      const formData = new FormData();
      formData.append('language', language);
      formData.append('durationMs', String(Math.max(1000, Math.round(durationMs))));

      if (uri) {
        const filename = uri.split('/').pop() || 'voice-note.m4a';
        formData.append('audio', {
          uri,
          name: filename,
          type: 'audio/m4a',
        } as any);
      }

      return http.post<VoiceNoteResponse>('/voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-notes'] });
    },
  });
}
