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

// Get absolute path to yt-dlp
const ytDlpPath = path.join(process.cwd(), "public", "bin", "yt-dlp");

// Ensure the directory exists
if (!fs.existsSync(clipsDirectory)) {
  fs.mkdirSync(clipsDirectory, { recursive: true });
}

export async function POST(req: Request) {
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

    if (fs.existsSync(finalMergedClip)) {
      return NextResponse.json({
        message: "Merged clip already exists",
        clipUrl: `/downloads/${path.basename(finalMergedClip)}`,
      });
    }

    if (!fs.existsSync(videoPath)) {
      await execPromise(
        `"${ytDlpPath}" -f best -o "${videoPath}" "${youtubeLink}"`
      );
    }

    const reencodedVideoPath = path.join(
      clipsDirectory,
      `${videoId}_reencoded.mp4`
    );

    await execPromise(
      `ffmpeg -i "${videoPath}" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -strict experimental -y "${reencodedVideoPath}"`
    );

    await execPromise(
      `ffmpeg -ss ${startTime} -i "${reencodedVideoPath}" -t ${duration} -c:v libx264 -preset ultrafast -crf 23 -c:a aac -strict experimental -y "${clipPath}"`
    );

    const trimmedSubwayClip = path.join(
      clipsDirectory,
      `subway_trimmed_${duration}.mp4`
    );

    await execPromise(
      `ffmpeg -stream_loop -1 -i "${subwaySurferClip}" -t ${duration} -c:v libx264 -preset ultrafast -crf 23 -an -y "${trimmedSubwayClip}"`
    );

    const paddedYouTubeClip = path.join(
      clipsDirectory,
      `${videoId}_padded_top_${startTime.replace(/:/g, "-")}_${duration}.mp4`
    );

    await execPromise(
      `ffmpeg -i "${clipPath}" -vf "scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -strict experimental -y "${paddedYouTubeClip}"`
    );

    const paddedSubwayClip = path.join(
      clipsDirectory,
      `subway_padded_bottom_${duration}.mp4`
    );

    await execPromise(
      `ffmpeg -i "${trimmedSubwayClip}" -vf "scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960" -c:v libx264 -preset ultrafast -crf 23 -y "${paddedSubwayClip}"`
    );

    await execPromise(
      `ffmpeg -i "${paddedYouTubeClip}" -i "${paddedSubwayClip}" -filter_complex "[0:v][1:v]vstack=inputs=2[v]" -map "[v]" -map 0:a? -c:v libx264 -preset ultrafast -crf 23 -y "${finalMergedClip}"`
    );

    return NextResponse.json({
      message: "Merged clip generated successfully",
      clipUrl: `/downloads/${path.basename(finalMergedClip)}`,
    });
  } catch (error: any) {
    console.error("Error generating merged clip:", error);
    return NextResponse.json(
      { error: "Failed to process the video: " + error.message },
      { status: 500 }
    );
  }
}
