"use client";
import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";

const VoiceNoteDuration = ({ src }) => {
  const [duration, setDuration] = useState(null);

  const getAudioDuration = async (url) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: "Basic " + btoa(process.env.NEXT_PUBLIC_EXOTEL_CREDS),
        },
      });

      if (!response.ok) throw new Error("Failed to fetch audio");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        const audio = new Audio(objectUrl);
        audio.addEventListener("loadedmetadata", () => {
          resolve(audio.duration);
          URL.revokeObjectURL(objectUrl); // Cleanup Blob URL
        });
        audio.addEventListener("error", reject);
      });
    } catch (error) {
      console.error("Error loading audio:", error);
      return 0; // Default to 0 if an error occurs
    }
  };

  useEffect(() => {
    if (src) {
      getAudioDuration(src)
        .then((dur) => setDuration(dur))
        .catch(() => setDuration(0)); // Handle error case
    }
  }, [src]);

  const formatTime = (time) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds} ${
      minutes > 0 ? "mins" : "secs"
    }`;
  };

  return (
    <Typography
      variant="subtitle1"
      style={{
        color: "#000",
      }}
    >
      Call Time: {formatTime(duration)}
    </Typography>
  );
};

export default VoiceNoteDuration;
