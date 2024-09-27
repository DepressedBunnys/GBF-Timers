"use client";

import DarkModeToggle from "@/app/components/DarkModeToggle";
import LoadingScreen from "@/app/components/LoadingScreen";
import Stars from "@/app/components/Stars";
import TaskTimer from "@/app/components/TaskTimer";
import TimerClock from "@/app/components/TimerClock";
import { Task } from "@/app/models/Task";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TaskPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { id } = params;

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    if (!id) return;

    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
      const loadedTasks: Task[] = JSON.parse(savedTasks);
      const foundTask = loadedTasks.find((task) => task.id === id);

      if (foundTask) setTask(foundTask);
    }

    setLoading(false);
  }, [id]);

  if (loading) {
    return <LoadingScreen message="Loading Task Data" />;
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Task not found.</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-between p-8 ${
        isDarkMode
          ? "bg-gradient-to-b from-[#000814] via-[#001d3d] to-[#002855]"
          : "bg-gradient-to-br from-green-200 via-blue-200 to-green-100"
      }`}
    >
      <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <Stars isDarkMode={isDarkMode} />

      {/* Center the Title, Clock, and Description */}
      <header className="text-center mb-8">
        <h1
          className={`text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-green-500 to-teal-400 dark:from-teal-300 dark:via-green-300 dark:to-blue-300 mb-4`}
        >
          {task.title}
        </h1>

        {/* Timer Clock under the task title */}
        <TimerClock isDarkMode={isDarkMode} />

        <p
          className={`text-lg mt-4 ${
            isDarkMode ? "text-green-300" : "text-green-800"
          }`}
        >
          {task.description}
        </p>
      </header>

      {/* Center the Task Timer */}
      <div className="flex flex-col items-center justify-center flex-grow">
        <TaskTimer isDarkMode={isDarkMode} />
      </div>

      {/* Go Back Button */}
      <button
        onClick={() => window.history.back()}
        className={`px-6 py-2 rounded-full font-semibold shadow-md bg-gradient-to-r from-blue-400 to-teal-500 hover:from-teal-500 hover:to-blue-400 text-white dark:bg-gradient-to-r dark:from-teal-400 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-teal-400 transition-all mt-8`}
      >
        Go Back
      </button>
    </div>
  );
}
