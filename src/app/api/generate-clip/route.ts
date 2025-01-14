import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import YTDlpWrap from "yt-dlp-wrap";

const execPromise = promisify(exec);
const ytDlpWrap = new YTDlpWrap();
const clipsDirectory = path.join(process.cwd(), "public", "downloads");
const subwaySurferClip = path.join(
  process.cwd(),
  "public",
  "subway_surfer.mp4"
);

// Ensure the clips directory exists
if (!fs.existsSync(clipsDirectory)) {
  fs.mkdirSync(clipsDirectory, { recursive: true });
}

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { youtubeLink, startTime, duration } = await req.json();

  if (!youtubeLink || !startTime || !duration) {
    return NextResponse.json(
      { error: "YouTube link, start time, and duration are required" },
      { status: 400 }
    );
  }

  try {
    const videoId = new URL(youtubeLink).searchParams.get("v");
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube link" },
        { status: 400 }
      );
    }

    const videoPath = path.join(clipsDirectory, `${videoId}.mp4`);
    const clipPath = path.join(
      clipsDirectory,
      `${videoId}_clip_${startTime.replace(/:/g, "-")}_${duration}.mp4`
    );
    const finalMergedClip = path.join(
      clipsDirectory,
      `${videoId}_final_merged_${startTime.replace(/:/g, "-")}_${duration}.mp4`
    );

    // Check if the specific clip for the provided start time and duration already exists
    if (fs.existsSync(finalMergedClip)) {
      return NextResponse.json({
        message: "Merged clip already exists",
        clipUrl: `/downloads/${path.basename(finalMergedClip)}`,
      });
    }

    // Download the video if not already downloaded
    if (!fs.existsSync(videoPath)) {
      await ytDlpWrap.execPromise(["-f", "best", "-o", videoPath, youtubeLink]);
    }

    // Ensure the video is re-encoded for seekability
    const reencodedVideoPath = path.join(
      clipsDirectory,
      `${videoId}_reencoded.mp4`
    );

    await execPromise(
      `ffmpeg -i "${videoPath}" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -strict experimental -y "${reencodedVideoPath}"`
    );

    // Extract the clip from the re-encoded video
    await execPromise(
      `ffmpeg -ss ${startTime} -i "${reencodedVideoPath}" -t ${duration} -c:v libx264 -preset ultrafast -crf 23 -c:a aac -strict experimental -y "${clipPath}"`
    );

    // Match the duration of the Subway Surfer clip
    const trimmedSubwayClip = path.join(
      clipsDirectory,
      `subway_trimmed_${duration}.mp4`
    );

    await execPromise(
      `ffmpeg -i "${subwaySurferClip}" -t ${duration} -c:v libx264 -preset ultrafast -crf 23 -y "${trimmedSubwayClip}"`
    );

    // Merge the two clips with a 9:16 aspect ratio
    await execPromise(
      `ffmpeg -i "${clipPath}" -i "${trimmedSubwayClip}" -filter_complex "[0:v]scale=1080:1920,setsar=1[v0];[1:v]scale=1080:1920,setsar=1[v1];[v0][v1]vstack=inputs=2[v]" -map "[v]" -map 0:a? -c:v libx264 -preset ultrafast -crf 23 -y "${finalMergedClip}"`
    );

    // Return the merged clip URL
    return NextResponse.json({
      message: "Merged clip generated successfully",
      clipUrl: `/downloads/${path.basename(finalMergedClip)}`,
    });
  } catch (error) {
    console.error("Error generating merged clip:", error);
    return NextResponse.json(
      { error: "Failed to process the video" },
      { status: 500 }
    );
  }
}
