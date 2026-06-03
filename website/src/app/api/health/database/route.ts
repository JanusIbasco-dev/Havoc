import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });

    return NextResponse.json({
      success: true,
      database: "connected"
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown database error"
      },
      { status: 500 }
    );
  }
}
