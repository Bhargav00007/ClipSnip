"use client";
import { useEffect, useState } from "react";

export default function FilesList() {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/files");
        const data = await res.json();
        if (data.files) setFiles(data.files);
        console.log("Files found:", data.files);
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Downloaded Files</h2>
      {loading ? (
        <p>Loading...</p>
      ) : files.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <video
                src={`/api/downloads/${file}`}
                controls
                className="w-full h-auto"
              />
              <p className="mt-2 text-center">{file}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No files found.</p>
      )}
    </div>
  );
}
