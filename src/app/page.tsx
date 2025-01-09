"use client";

import { useState, useRef, useEffect } from "react";
import { IoSparkles } from "react-icons/io5";

export default function Home() {
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [clipUrl, setClipUrl] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [subtitle, setSubtitle] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const subtitleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Messages to display under the processing bar
  const loadingMessages = [
    "Wait, it's loading...",
    "Have patience...",
    "Almost there...",
    "Working hard on your clip...",
    "Good things take time...",
    "I hope you didnt provided a huge video!",
    "Wait, Its a long vidoe...Damn",
    "You are breaking my code",
    "Please provide smaller videos link",
    "Almost broke the code",
    "Let me cook again hard",
  ];

  useEffect(() => {
    // Delete clips on page load
    const deleteClipsOnReload = async () => {
      try {
        await fetch("/api/generate-clip", { method: "GET" });
        console.log("All clips deleted.");
      } catch (error) {
        console.error("Failed to delete clips:", error);
      }
    };

    deleteClipsOnReload();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(10);
    setSubtitle("Initializing...");

    // Create a new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Start cycling through subtitles
    startSubtitleLoop();

    try {
      const response = await fetch(
        "https://clipsnip.onrender.com/api/generate-clip",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeLink, startTime, duration }),
          signal: abortController.signal,
        }
      );

      setProgress(70);

      const data = await response.json();
      if (data.clipUrl) {
        setClipUrl(data.clipUrl);
        setProgress(100);
        setSubtitle("Done! Your clip is ready.");
      } else {
        alert("Failed to generate clip: " + data.error);
        setProgress(0);
        setSubtitle("Something went wrong.");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setSubtitle("Clip generation was cancelled.");
      } else {
        setSubtitle("An error occurred while generating the clip.");
      }
      setProgress(0);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      stopSubtitleLoop();
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setProgress(0);
    setSubtitle("Cancelled by user.");
    stopSubtitleLoop();
  };

  const startSubtitleLoop = () => {
    let index = 0;
    subtitleIntervalRef.current = setInterval(() => {
      setSubtitle(loadingMessages[index]);
      index = (index + 1) % loadingMessages.length; // Cycle through messages
    }, 5000);
  };

  const stopSubtitleLoop = () => {
    if (subtitleIntervalRef.current) {
      clearInterval(subtitleIntervalRef.current);
      subtitleIntervalRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          YouTube Clip Generator
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            placeholder="Paste YouTube Link"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="Start Time (e.g., 00:01:00)"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (e.g., 30)"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 text-white rounded-lg transition-all flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? (
                <>
                  Generating...
                  <IoSparkles className="animate-spin" />{" "}
                </>
              ) : (
                <>
                  Generate Clip
                  <IoSparkles />
                </>
              )}
            </button>
            {loading && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {loading && (
          <div className="mt-4">
            <div className="relative w-full bg-gray-200 rounded-lg h-4">
              <div
                className="absolute top-0 left-0 h-4 bg-blue-500 rounded-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-gray-500 text-sm mt-2">
              Processing... {progress}%
            </p>
            <p className="text-center text-blue-600 text-sm mt-1 italic">
              {subtitle}
            </p>
          </div>
        )}
        {clipUrl && (
          <div className="mt-6 text-center">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Generated Clip
            </h2>
            <video src={clipUrl} controls className="w-full rounded-lg"></video>
          </div>
        )}
      </div>
    </div>
  );
}
