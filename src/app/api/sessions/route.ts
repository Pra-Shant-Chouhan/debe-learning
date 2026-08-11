import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { TutoringSession } from "@/types/session";

const sessionsFilePath = path.join(
  process.cwd(),
  "src/data/sessions.json"
);

export async function GET(): Promise<NextResponse<TutoringSession[] | { error: string }>> {
  try {
    const fileData = await fs.readFile(sessionsFilePath, "utf-8");
    const sessions = JSON.parse(fileData) as TutoringSession[];
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error reading sessions JSON:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming sessions from server." },
      { status: 500 }
    );
  }
}
