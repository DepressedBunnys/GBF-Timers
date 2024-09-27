"use client";

import { useEffect, useState } from "react";

interface TaskTimerProps {
  isDarkMode: boolean;
}

export default function TaskTimer({ isDarkMode }: TaskTimerProps) {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [isTaskEnded, setIsTaskEnded] = useState(false);
  const [ringColor, setRingColor] = useState("white");

  useEffect(() => {
    if (!isTimerActive) setRingColor(isDarkMode ? "white" : "blue");
  }, [isDarkMode]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTimerActive && !isTimerPaused && !isTaskEnded) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerActive, isTimerPaused, isTaskEnded]);

  useEffect(() => {
    let pauseTimer: NodeJS.Timeout | null = null;
    if (isTimerPaused) {
      pauseTimer = setInterval(() => {
        setPausedTime((prevPause) => prevPause + 1);
      }, 1000);
    }

    return () => {
      if (pauseTimer) clearInterval(pauseTimer);
    };
  }, [isTimerPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTask = () => {
    setIsTimerActive(true);
    setIsTimerPaused(false);
    setRingColor(isDarkMode ? "#2960ff" : "yellow");
  };

  const handlePauseTask = () => {
    setIsTimerPaused(true);
    setRingColor("red");
  };

  const handleResumeTask = () => {
    setIsTimerPaused(false);
    setRingColor(isDarkMode ? "#2960ff" : "yellow");
  };

  const handleEndTask = () => {
    if (isTimerPaused) return;

    setIsTaskEnded(true);
    setIsTimerActive(false);
    setRingColor("white");
  };

  return (
    <div className="text-center mt-0">
      {/* Circular timer design */}
      <div
        className={`relative mx-auto w-96 h-96 rounded-full flex flex-col items-center justify-center border-8 ${
          isTimerPaused
            ? "border-red-600"
            : isDarkMode
            ? "border-blue-200"
            : "border-yellow-100"
        }`}
        style={{
          boxShadow: `0 0 30px 10px ${ringColor}`,
        }}
      >
        <div
          className={`text-6xl font-bold ${
            isDarkMode ? "text-yellow-300" : "text-blue-600"
          }`}
          style={{
            textShadow: isDarkMode ? "0 0 15px rgba(255, 255, 0, 0.5)" : "none",
          }}
        >
          {formatTime(elapsedTime)}
        </div>

        {/* Paused time display */}
        {isTimerPaused && (
          <div
            className={`text-xl font-semibold ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {formatTime(pausedTime)}
          </div>
        )}
      </div>

      {/* Timer control buttons */}
      <div className="flex space-x-4 mt-6 justify-center">
        {!isTaskEnded && !isTimerActive ? (
          <button
            onClick={handleStartTask}
            className="px-6 py-2 rounded-full font-semibold shadow-md bg-green-500 text-white hover:bg-green-600"
          >
            Start Task
          </button>
        ) : isTimerPaused && !isTaskEnded ? (
          <button
            onClick={handleResumeTask}
            className="px-6 py-2 rounded-full font-semibold shadow-md bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Resume Task
          </button>
        ) : !isTaskEnded ? (
          <button
            onClick={handlePauseTask}
            className="px-6 py-2 rounded-full font-semibold shadow-md bg-red-500 text-white hover:bg-red-600"
          >
            Pause Task
          </button>
        ) : (
          <button
            className="px-6 py-2 rounded-full font-semibold shadow-md bg-red-400 text-white opacity-50 cursor-not-allowed"
            disabled
          >
            Task Ended
          </button>
        )}
        {!isTaskEnded && isTimerActive && (
          <button
            onClick={handleEndTask}
            className={`px-6 py-2 rounded-full font-semibold shadow-md text-white ${
              isTimerPaused
                ? "bg-red-400 opacity-50 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
            disabled={isTimerPaused}
          >
            End Task
          </button>
        )}
      </div>
    </div>
  );
}
