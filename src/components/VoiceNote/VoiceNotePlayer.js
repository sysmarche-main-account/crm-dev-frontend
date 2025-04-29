"use client";
import React, { useState, useRef, useEffect } from "react";
import { IconButton, Typography } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";

const VoiceNotePlayer = ({ src }) => {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const response = await fetch(src, {
          headers: {
            Authorization:
              "Basic " + btoa(process.env.NEXT_PUBLIC_EXOTEL_CREDS), // Encode credentials
            // btoa(
            //   "fa7907a0e825a9ccca9ff66d678db2d77e8bd2982a44ed08:cbfe0ce050bcbcbe0d9011f35ab145eeb194d9bb7a3c2a0e"
            // ), // Encode credentials
          },
        });

        if (!response.ok) throw new Error("Failed to fetch audio");

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setAudioUrl(objectUrl);
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    fetchAudio();

    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl); // Cleanup URL
    };
  }, [src]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (canvas && audioRef.current) {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progress = clickX / canvas.width;
      audioRef.current.currentTime = progress * duration;
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleCanvasClick(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleCanvasClick(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const progress = currentTime / duration;

    ctx.clearRect(0, 0, width, height);

    const barPattern = [10, 20, 15, 25, 5, 30, 8, 18, 12, 22];
    const barWidth = 4;
    const gap = 2;
    const radius = 2;
    const totalBars = Math.floor(width / (barWidth + gap));

    for (let i = 0; i < totalBars; i++) {
      const barHeight = barPattern[i % barPattern.length];
      const x = i * (barWidth + gap);
      const y = height / 2 - barHeight / 2;

      ctx.fillStyle =
        progress > 0 && i / totalBars <= progress ? "#4caf50" : "#e0e0e0";
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, radius);
      ctx.fill();
    }

    // Draw draggable cursor only when playing
    if (isPlaying || currentTime > 0) {
      const cursorX = progress * width;
      ctx.fillStyle = "#4caf50";
      ctx.fillRect(cursorX - 0.5, 0, 1, height); // Thinner cursor
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, []);

  useEffect(() => {
    drawWaveform();

    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("timeupdate", drawWaveform);
      audio.addEventListener("loadedmetadata", drawWaveform);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", drawWaveform);
        audio.removeEventListener("loadedmetadata", drawWaveform);
      }
    };
  }, [currentTime, duration, isPlaying]);

  return (
    <div className="voice-note-player">
      <IconButton
        id="voiceNote-play-btn"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause /> : <PlayArrow />}
      </IconButton>

      <canvas
        id="voiceNote-canvas"
        ref={canvasRef}
        style={{ width: "100%", height: "40px", backgroundColor: "#FFFFFF" }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <audio
        id="voiceNote-audio"
        ref={audioRef}
        // src={src}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <Typography variant="caption">
        {formatTime(currentTime)}
        {/* {formatTime(currentTime)} / {formatTime(duration)} */}
      </Typography>
    </div>
  );
};

export default VoiceNotePlayer;
