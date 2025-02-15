import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import YTDlpWrap from "yt-dlp-wrap";

const execPromise = promisify(exec);
const ytDlpWrap = new YTDlpWrap();

// Docker-safe absolute paths
const clipsDirectory = "/app/public/downloads";
const subwaySurferClip = "/app/public/subway_surfer.mp4";

// Ensure downloads directory exists with proper permissions
if (!fs.existsSync(clipsDirectory)) {
  fs.mkdirSync(clipsDirectory, { recursive: true });
  fs.chmodSync(clipsDirectory, 0o777);
}

export async function POST(req: Request) {
  const { youtubeLink, startTime, duration } = await req.json();
  const cleanupFiles: string[] = [];

  try {
    // Validation
    if (!youtubeLink || !startTime || !duration) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const videoId = new URL(youtubeLink).searchParams.get("v");
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // File paths
    const finalMergedClip = path.join(
      clipsDirectory,
      `${videoId}_final_merged_${startTime.replace(/:/g, "-")}_${duration}.mp4`
    );

    // Check existing file with accessibility verification
    if (fs.existsSync(finalMergedClip)) {
      try {
        fs.accessSync(finalMergedClip, fs.constants.R_OK);
        return NextResponse.json({
          message: "Clip already exists",
          clipUrl: `/downloads/${path.basename(finalMergedClip)}`,
        });
      } catch (accessError) {
        console.log(
          "Removing inaccessible file:",
          finalMergedClip,
          "Error:",
          accessError
        );
        fs.unlinkSync(finalMergedClip);
      }
    }

    // Download video
    const videoPath = path.join(clipsDirectory, `${videoId}.mp4`);
    if (!fs.existsSync(videoPath)) {
      await ytDlpWrap.execPromise([
        "-f",
        "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "-o",
        videoPath,
        youtubeLink,
      ]);
    }

    // Processing steps
    const reencodedVideoPath = path.join(
      clipsDirectory,
      `${videoId}_reencoded.mp4`
    );
    await execPromise(
      `ffmpeg -i "${videoPath}" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -strict experimental -y "${reencodedVideoPath}"`
    );
    cleanupFiles.push(reencodedVideoPath);

    const clipPath = path.join(
      clipsDirectory,
      `${videoId}_clip_${startTime.replace(/:/g, "-")}_${duration}.mp4`
    );
    await execPromise(
      `ffmpeg -ss ${startTime} -i "${reencodedVideoPath}" -t ${duration} -c:v libx264 -preset ultrafast -crf 23 -c:a aac -strict experimental -y "${clipPath}"`
    );
    cleanupFiles.push(clipPath);

    // Subway surfer processing
    const trimmedSubwayClip = path.join(
      clipsDirectory,
      `subway_trimmed_${duration}.mp4`
    );
    await execPromise(
      `ffmpeg -stream_loop -1 -i "${subwaySurferClip}" -t ${duration} -c:v libx264 -preset ultrafast -crf 23 -an -y "${trimmedSubwayClip}"`
    );
    cleanupFiles.push(trimmedSubwayClip);

    // Video padding
    const paddedYouTubeClip = path.join(
      clipsDirectory,
      `${videoId}_padded_top_${startTime.replace(/:/g, "-")}_${duration}.mp4`
    );
    await execPromise(
      `ffmpeg -i "${clipPath}" -vf "scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -strict experimental -y "${paddedYouTubeClip}"`
    );
    cleanupFiles.push(paddedYouTubeClip);

    const paddedSubwayClip = path.join(
      clipsDirectory,
      `subway_padded_bottom_${duration}.mp4`
    );
    await execPromise(
      `ffmpeg -i "${trimmedSubwayClip}" -vf "scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960" -c:v libx264 -preset ultrafast -crf 23 -y "${paddedSubwayClip}"`
    );
    cleanupFiles.push(paddedSubwayClip);

    // Final merge
    await execPromise(
      `ffmpeg -i "${paddedYouTubeClip}" -i "${paddedSubwayClip}" -filter_complex "[0:v][1:v]vstack=inputs=2[v]" -map "[v]" -map 0:a? -c:v libx264 -preset ultrafast -crf 23 -y "${finalMergedClip}"`
    );

    // Verify final file creation
    if (!fs.existsSync(finalMergedClip)) {
      throw new Error("Final merged file not created");
    }

    // Add delay for file system sync
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Cleanup temporary files
    cleanupFiles.forEach((file) => {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch (cleanupError) {
        console.error(`Error cleaning up ${file}:`, cleanupError);
      }
    });

    return NextResponse.json({
      message: "Merged clip created successfully",
      clipUrl: `/downloads/${path.basename(finalMergedClip)}`,
    });
  } catch (error) {
    // Cleanup on error
    cleanupFiles.forEach((file) => {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch (cleanupError) {
        console.error(`Error cleaning up ${file}:`, cleanupError);
      }
    });

    console.error("Processing error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Processing failed", details: errorMessage },
      { status: 500 }
    );
  }
}
