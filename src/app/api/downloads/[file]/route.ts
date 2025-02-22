import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import mime from "mime";
import type { NextRequest } from "next/server";

// Define the type for the route parameters
type RouteParams = {
  params: {
    file: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const fileName = params.file;

  if (!fileName) {
    return NextResponse.json(
      { error: "File parameter is required" },
      { status: 400 }
    );
  }

  const filePath = path.join(process.cwd(), "public", "downloads", fileName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileStats = fs.statSync(filePath);
  const contentType = mime.getType(filePath) || "application/octet-stream";

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Length": fileStats.size.toString(),
    "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  const fileStream = fs.createReadStream(filePath);
  return new NextResponse(fileStream as unknown as ReadableStream, {
    status: 200,
    headers,
  });
}
