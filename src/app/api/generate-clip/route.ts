import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execPromise = promisify(exec);
const clipsDirectory = path.join(process.cwd(), "public", "downloads");
const subwaySurferClip = path.join(
  process.cwd(),
  "public",
  "subway_surfer.mp4"
);

const ytDlpPath = path.join(process.cwd(), "public", "bin", "yt-dlp");
const cookiesPath = path.join(
  process.cwd(),
  "public",
  "cookies",
  "cookies.txt"
);

if (!fs.existsSync(clipsDirectory)) {
  fs.mkdirSync(clipsDirectory, { recursive: true });
}

export async function POST(req: Request) {
  const { youtubeLink, startTime, duration } = await req.json();

  try {
    // Validation checks
    if (!youtubeLink || !startTime || !duration) {
      throw new Error("YouTube link, start time, and duration are required");
    }

    // Verify cookies exist
    if (!fs.existsSync(cookiesPath)) {
      throw new Error("Authentication cookies not found");
    }

    const videoId = new URL(youtubeLink).searchParams.get("v");
    if (!videoId) throw new Error("Invalid YouTube link");

    const videoPath = path.join(clipsDirectory, `${videoId}.mp4`);
    const finalMergedClip = path.join(
      clipsDirectory,
      `${videoId}_final_merged_${startTime.replace(/:/g, "-")}_${duration}.mp4`
    );

    if (fs.existsSync(finalMergedClip)) {
      return NextResponse.json({
        message: "Merged clip already exists",
        clipUrl: `/downloads/${path.basename(finalMergedClip)}`,
      });
    }

    // Download video with enhanced options
    if (!fs.existsSync(videoPath)) {
      await execPromise(
        `"${ytDlpPath}" \
        --cookies "${cookiesPath}" \
        --force-ipv4 \
        --geo-bypass \
        --referer "https://www.youtube.com" \
        --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" \
        --no-check-certificate \
        --verbose \
        -o "${videoPath}" \
        "${youtubeLink}"`
      );
    }

    // [Keep existing processing steps...]
    // Add debug logging for downloaded file
    console.log(
      "Video downloaded successfully. Size:",
      fs.statSync(videoPath).size
    );

    // Rest of your FFmpeg processing code remains the same
    const reencodedVideoPath = path.join(
      clipsDirectory,
      `${videoId}_reencoded.mp4`
    );
    await execPromise(
      `ffmpeg -i "${videoPath}" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -strict experimental -y "${reencodedVideoPath}"`
    );

    // [Keep all other FFmpeg commands...]

    return NextResponse.json({
      message: "Merged clip generated successfully",
      clipUrl: `/downloads/${path.basename(finalMergedClip)}`,
    });
  } catch (error: any) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      cmd: error.cmd,
      stderr: error.stderr,
    });

    return NextResponse.json(
      {
        error: "Failed to process video",
        details: error.stderr || error.message,
      },
      { status: 500 }
    );
  }
}
