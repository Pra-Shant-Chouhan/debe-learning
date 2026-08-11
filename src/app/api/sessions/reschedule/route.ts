import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { requestReschedule } from "@/lib/firebase/request-reschedule";
import type { RescheduleRequest, RescheduleResponse, TutoringSession } from "@/types/session";

const sessionsFilePath = path.join(
  process.cwd(),
  "src/data/sessions.json"
);

export async function POST(
  request: Request
): Promise<NextResponse<RescheduleResponse>> {
  try {
    const body = (await request.json()) as RescheduleRequest;

    // 1. Firebase Cloud Function validation boundary execution
    const firebaseResult = await requestReschedule(body);
    if (!firebaseResult.success) {
      return NextResponse.json(firebaseResult, { status: 400 });
    }

    // 2. Read server sessions JSON store
    const fileData = await fs.readFile(sessionsFilePath, "utf-8");
    const sessions = JSON.parse(fileData) as TutoringSession[];

    // 3. Locate target session
    const sessionIndex = sessions.findIndex((s) => s.id === body.sessionId);
    if (sessionIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Session with ID ${body.sessionId} was not found.` },
        { status: 404 }
      );
    }

    // 4. Mutate session time & status
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      datetimeUtc: body.newDatetimeUtc,
      status: "reschedule_requested",
    };

    // 5. Persist back to disk (data/sessions.json)
    await fs.writeFile(sessionsFilePath, JSON.stringify(sessions, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Reschedule Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected server error occurred while processing the reschedule request.",
      },
      { status: 500 }
    );
  }
}
