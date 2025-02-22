import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
  const downloadsPath = path.join(process.cwd(), "public", "downloads");

  try {
    if (!fs.existsSync(downloadsPath)) {
      return NextResponse.json(
        { error: "Downloads folder not found" },
        { status: 404 }
      );
    }

    const files = fs
      .readdirSync(downloadsPath)
      .filter((file) => file !== ".gitkeep");
    console.log;
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error reading downloads folder:", error);
    return NextResponse.json(
      { error: "Failed to read files" },
      { status: 500 }
    );
  }
}
