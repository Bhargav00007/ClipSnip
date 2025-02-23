import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"; // Explicitly import NextRequest
import path from "path";
import fs from "fs";

// Define the params type explicitly
interface RouteParams {
  params: {
    file: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const downloadsPath = path.join(process.cwd(), "public", "downloads");
  const filePath = path.join(downloadsPath, params.file);

  try {
    if (!fs.existsSync(downloadsPath)) {
      return NextResponse.json(
        { error: "Downloads folder not found" },
        { status: 404 }
      );
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File '${params.file}' not found` },
        { status: 404 }
      );
    }

    const stats = fs.statSync(filePath);
    if (!stats.isFile() || params.file === ".gitkeep") {
      return NextResponse.json(
        { error: `Invalid file '${params.file}'` },
        { status: 400 }
      );
    }

    console.log("File requested:", params.file);
    return NextResponse.json({ file: params.file, size: stats.size });
  } catch (error) {
    console.error(`Error accessing file '${params.file}':`, error);
    return NextResponse.json(
      { error: "Failed to process file request" },
      { status: 500 }
    );
  }
}
