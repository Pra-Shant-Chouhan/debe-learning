import type { RescheduleRequest, RescheduleResponse } from "@/types/session";

export async function submitReschedule(
  request: RescheduleRequest
): Promise<RescheduleResponse> {
  const response = await fetch("/api/sessions/reschedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = (await response.json()) as RescheduleResponse;

  if (!response.ok) {
    return {
      success: false,
      error: data.error || `HTTP error ${response.status}: Failed to process reschedule.`,
    };
  }

  return data;
}
