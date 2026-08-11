"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitReschedule } from "@/lib/api/reschedule";
import type { RescheduleRequest, RescheduleResponse } from "@/types/session";

export function useRescheduleSession() {
  const queryClient = useQueryClient();

  return useMutation<RescheduleResponse, Error, RescheduleRequest>({
    mutationKey: ["reschedule-session"],
    mutationFn: async (request: RescheduleRequest) => {
      const response = await submitReschedule(request);

      if (!response.success) {
        throw new Error(response.error ?? "Failed to process session reschedule.");
      }

      return response;
    },
    onSuccess: () => {
      // Invalidate upcoming sessions cache to refetch updated state
      queryClient.invalidateQueries({
        queryKey: ["upcoming-sessions"],
      });
    },
  });
}
