import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Student from "@/models/Student";

export async function GET() {
  await connectDB();
  const top = await Student.find({ points: { $gt: 0 } })
    .sort({ points: -1 }).limit(5)
    .select("name studentClass points").lean();
  return NextResponse.json(top.map((s: any, i: number) => ({
    rank: i + 1, name: s.name, studentClass: s.studentClass, points: s.points,
  })));
}
