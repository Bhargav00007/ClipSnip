"use client";
import { useState, useRef, useEffect } from "react";
import { IoSparkles } from "react-icons/io5";
import { TbBrandAmongUs } from "react-icons/tb";
import { CgPokemon } from "react-icons/cg";

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
    "Wait, Its a long video...Damn",
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
      const response = await fetch("/api/generate-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeLink, startTime, duration }),
        signal: abortController.signal,
      });
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
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center px-4">
      <div
        className={`relative bg-white shadow-md rounded-2xl p-6 w-full ${
          clipUrl ? "max-w-4xl" : "max-w-md"
        } flex flex-col md:flex-row gap-8`}
      >
        {/* Among Us  */}
        <div className="absolute -top-14 left-3/4 -translate-x-1/2">
          <TbBrandAmongUs className="text-6xl text-gray-800 drop-shadow-lg pt-5" />
        </div>
        <div className="absolute -bottom-14 left-1/4 -translate-x-1/2">
          <CgPokemon className="text-6xl text-gray-800 drop-shadow-lg pb-5" />
        </div>
        {/* Form Section */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            ClipSnip - Generate YouTube Clips
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="Paste YouTube Link"
              required
              className="w-full px-4 py-2 border rounded-2xl focus:outline-none focus:ring focus:ring-blue-300"
            />
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="Start Time (e.g., 00:01:00)"
              required
              className="w-full px-4 py-2 border rounded-2xl focus:outline-none focus:ring focus:ring-blue-300"
            />
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration (e.g., 30)"
              required
              className="w-full px-4 py-2 border rounded-2xl focus:outline-none focus:ring focus:ring-blue-300"
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 text-white rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {loading ? (
                  <>
                    Generating...
                    <IoSparkles className="animate-spin" />
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
                  className="flex-1 py-2 text-white bg-red-500 hover:bg-red-600 rounded-2xl"
                >
                  Cancel
                </button>
              )}
            </div>
            {loading && (
              <div className="mt-4">
                <div className="relative w-full bg-gray-200 rounded-2xl h-4">
                  <div
                    className="absolute top-0 left-0 h-4 bg-blue-500 rounded-2xl"
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
          </form>
        </div>

        {/* Video Preview Section */}
        {clipUrl && (
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-lg font-medium text-gray-800 mb-4 text-center">
              Generated Clip
            </h2>
            <div className="relative w-[250px] aspect-[9/16] bg-black rounded-2xl overflow-hidden mx-auto">
              <video
                src={clipUrl}
                controls
                className="w-full h-full object-contain"
              ></video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
