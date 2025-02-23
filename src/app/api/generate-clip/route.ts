import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execPromise = promisify(exec);

// Environment configuration
const isProduction = process.env.NODE_ENV === "production";
const basePath = process.cwd();

// Path configuration
const clipsDirectory = path.join(basePath, "public", "downloads");
const subwaySurferClip = path.join(basePath, "public", "subway_surfer.mp4");

const ytDlpPath = isProduction
  ? path.join(basePath, ".next", "static", "bin", "yt-dlp")
  : path.join(basePath, "public", "bin", "yt-dlp");

const cookiesPath = isProduction
  ? path.join(basePath, ".next", "static", "cookies", "cookies.txt")
  : path.join(basePath, "public", "cookies", "cookies.txt");

// Ensure required directories exist
[clipsDirectory, path.dirname(ytDlpPath), path.dirname(cookiesPath)].forEach(
  (dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
);

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export async function POST(req: Request) {
=======
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
// Ensure the directory exists
if (!fs.existsSync(clipsDirectory)) {
  fs.mkdirSync(clipsDirectory, { recursive: true });
}

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
  const { youtubeLink, startTime, duration } = await req.json();

  try {
    // Debugging logs
    console.log("Environment:", process.env.NODE_ENV);
    console.log("YT-DLP Path:", ytDlpPath);
    console.log("Cookies Path:", cookiesPath);
    console.log("YT-DLP Exists:", fs.existsSync(ytDlpPath));
    console.log("Cookies Exist:", fs.existsSync(cookiesPath));

    // Validation
    if (!youtubeLink || !startTime || !duration) {
      throw new Error(
        "Missing required parameters: YouTube link, start time, duration"
      );
    }

    if (!fs.existsSync(cookiesPath)) {
      throw new Error(`Cookies file not found at: ${cookiesPath}`);
    }

    const videoId = new URL(youtubeLink).searchParams.get("v");
    if (!videoId) throw new Error("Invalid YouTube URL format");

    const finalMergedClip = path.join(
      clipsDirectory,
      `${videoId}_final_merged_${startTime.replace(/:/g, "-")}_${duration}.mp4`
    );

    // Check for existing clip
    if (fs.existsSync(finalMergedClip)) {
      return NextResponse.json({
        message: "Merged clip already exists",
        clipUrl: `/downloads/${path.basename(finalMergedClip)}`,
      });
    }

    const videoPath = path.join(clipsDirectory, `${videoId}.mp4`);

    // Download video with enhanced options
    if (!fs.existsSync(videoPath)) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      const ytCommand = [
        `"${ytDlpPath}"`,
        `--cookies "${cookiesPath}"`,
        "--force-ipv4",
        "--geo-bypass",
        "--referer 'https://www.youtube.com'",
        "--user-agent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'",
        "--no-check-certificate",
        "--verbose",
        `-o "${videoPath}"`,
        `"${youtubeLink}"`,
      ].join(" ");

      console.log("Executing download command:", ytCommand);
      const { stdout, stderr } = await execPromise(ytCommand);
      console.log("Download logs:", { stdout, stderr });
=======
      await execPromise(`yt-dlp -f best -o "${videoPath}" "${youtubeLink}"`);
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
      await execPromise(`yt-dlp -f best -o "${videoPath}" "${youtubeLink}"`);
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
      await execPromise(`yt-dlp -f best -o "${videoPath}" "${youtubeLink}"`);
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
      await execPromise(`yt-dlp -f best -o "${videoPath}" "${youtubeLink}"`);
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
    }

    // Video processing pipeline
    const processingSteps = [
      {
        name: "Re-encoding",
        command: `ffmpeg -i "${videoPath}" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -strict experimental -y "${videoPath}_reencoded.mp4"`,
      },
      {
        name: "Trimming",
        command: `ffmpeg -ss ${startTime} -i "${videoPath}_reencoded.mp4" -t ${duration} -c:v copy -c:a copy -y "${videoPath}_trimmed.mp4"`,
      },
      {
        name: "Subway Surfers Loop",
        command: `ffmpeg -stream_loop -1 -i "${subwaySurferClip}" -t ${duration} -c:v copy -an -y "${videoPath}_subway_loop.mp4"`,
      },
      {
        name: "Merge Clips",
        command: `ffmpeg -i "${videoPath}_trimmed.mp4" -i "${videoPath}_subway_loop.mp4" -filter_complex "[0:v][1:v]vstack=inputs=2[v]" -map "[v]" -map 0:a? -c:v libx264 -preset ultrafast -crf 23 -y "${finalMergedClip}"`,
      },
    ];

    for (const step of processingSteps) {
      console.log(`Starting step: ${step.name}`);
      const { stdout, stderr } = await execPromise(step.command);
      console.log(`Completed ${step.name}`, { stdout, stderr });
    }

    // Cleanup temporary files
    [".mp4_reencoded", "_trimmed", "_subway_loop"].forEach((suffix) => {
      const tempFile = `${videoPath}${suffix}.mp4`;
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    });

    return NextResponse.json({
      message: "Merged clip generated successfully",
      clipUrl: `/downloads/${path.basename(finalMergedClip)}`,
    });
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  } catch (error: any) {
    console.error("Full Error Details:", {
      message: error.message,
      stack: error.stack,
      command: error.cmd,
      stderr: error.stderr,
      stdout: error.stdout,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        paths: {
          ytDlpPath,
          cookiesPath,
          cwd: process.cwd(),
        },
      },
    });

    return NextResponse.json(
      {
        error: "Video processing failed",
        details: {
          message: error.message,
          stderr: error.stderr?.slice(0, 200), // Truncate long errors
          errorCode: error.code,
        },
      },
=======
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
  } catch (error) {
    console.error("Error generating merged clip:", error);
    return NextResponse.json(
      { error: "Failed to process the video" },
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
=======
>>>>>>> parent of 9645f05 (Trying to defeat docker issues)
      { status: 500 }
    );
  }
}
