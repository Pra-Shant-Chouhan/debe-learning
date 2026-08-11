import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { TeacherAvailability } from "@/types/session";

const slotsFilePath = path.join(
  process.cwd(),
  "src/data/teacher-slots.json"
);

export async function GET(request: Request): Promise<NextResponse<TeacherAvailability[] | TeacherAvailability | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    const fileData = await fs.readFile(slotsFilePath, "utf-8");
    const teacherSlotsData = JSON.parse(fileData) as TeacherAvailability[];

    if (teacherId) {
      const match = teacherSlotsData.find((t) => t.teacherId === teacherId);
      if (!match) {
        return NextResponse.json(
          { error: `No slot availability found for teacher ${teacherId}` },
          { status: 404 }
        );
      }
      return NextResponse.json(match);
    }

    return NextResponse.json(teacherSlotsData);
  } catch (error) {
    console.error("Error reading teacher-slots JSON:", error);
    return NextResponse.json(
      { error: "Failed to load teacher availability slots." },
      { status: 500 }
    );
  }
}
