"use client";

import React, { useState, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/solid";
import styles from "../styles/notes.module.css"
import { v4 as uuidv4 } from "uuid";
import CreateTaskModal from "./components/CreateTaskModal";
import { getNoteColor } from "./utils/colorUtil";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tasks, setTasks] = useState<
    { id: string; title: string; description: string }[]
  >([]);
  const [hiddenTasks, setHiddenTasks] = useState<
    { id: string; title: string; description: string }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleAddTaskClick = () => {
    setIsModalOpen(true);
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask = {
      id: uuidv4(),
      title: newTaskTitle || `Task ${tasks.length + 1}`,
      description: newTaskDescription || "No Description",
    };

    if (tasks.length < 6) {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    } else {
      setHiddenTasks((prevHidden) => [...prevHidden, newTask]);
    }

    setIsModalOpen(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDarkMode);
    }

    const spawnStars = () => {
      if (!isDarkMode) return;

      const starContainer = document.getElementById("star-container");
      if (starContainer) {
        const star = document.createElement("div");
        star.classList.add("star");

        const randomX = Math.floor(Math.random() * (window.innerWidth - 10));
        const randomY = Math.floor(Math.random() * (window.innerHeight - 10));
        star.style.left = `${randomX}px`;
        star.style.top = `${randomY}px`;

        starContainer.appendChild(star);

        setTimeout(() => {
          star.remove();
        }, 46000);
      }
    };

    if (isDarkMode) {
      const starInterval = setInterval(spawnStars, 1000);
      return () => clearInterval(starInterval);
    }
  }, [isDarkMode]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    color: string
  ) => {
    const note = e.currentTarget;
    const rect = note.getBoundingClientRect();
    const noteX = rect.left + rect.width / 2;
    const noteY = rect.top + rect.height / 2;
    const deltaX = e.clientX - noteX;
    const deltaY = e.clientY - noteY;
    const tiltX = (deltaY / 10).toFixed(2);
    const tiltY = (-deltaX / 10).toFixed(2);

    (
      note as HTMLElement
    ).style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    (note as HTMLElement).style.boxShadow = `0 0 20px 10px ${color}`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const note = e.currentTarget;
    (note as HTMLElement).style.transform = `rotateX(0deg) rotateY(0deg)`;
    (note as HTMLElement).style.boxShadow = `none`;
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-start p-8 ${
        isDarkMode
          ? "bg-gradient-to-b from-[#000814] via-[#001d3d] to-[#002855]"
          : "bg-gradient-to-br from-green-200 via-blue-200 to-green-100"
      }`}
    >
      {isDarkMode && (
        <div id="star-container" className="absolute inset-0"></div>
      )}

      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 dark:bg-gray-700 dark:text-gray-300"
      >
        {isDarkMode ? (
          <SunIcon className="h-6 w-6" />
        ) : (
          <MoonIcon className="h-6 w-6" />
        )}
      </button>

      {/* Hidden Tasks Dropdown */}
      {hiddenTasks.length > 0 && (
        <div className="absolute top-4 left-4">
          <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-gray-600 dark:text-gray-200">
            Hidden Tasks <ChevronDownIcon className="inline h-5 w-5 ml-1" />
          </button>
          <ul className="bg-white dark:bg-gray-800 mt-2 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {hiddenTasks.map((task) => (
              <li
                key={task.id}
                className="p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200"
              >
                {task.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-12">
        <h1
          className={`text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-green-500 to-teal-400 dark:from-teal-300 dark:via-green-300 dark:to-blue-300 mb-4`}
        >
          Welcome to GBF Timers
        </h1>
        <p
          className={`text-lg ${
            isDarkMode ? "text-green-300" : "text-green-800"
          }`}
        >
          A smooth way to track your study sessions and breaks
        </p>
      </header>

      {/* Task Section */}
      <section className="w-full max-w-4xl">
        <h2
          className={`text-2xl font-semibold ${
            isDarkMode ? "text-teal-300" : "text-blue-600"
          } mb-6 text-center`}
        >
          Your Tasks
        </h2>

        {/* Grid Container */}
        <div className="grid grid-cols-3 gap-6">
          {tasks.map((task, index) => {
            const noteColor = getNoteColor(index);
            return (
              <div
                key={task.id}
                className={`${styles.note} relative font-indie ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
                }`}
                style={{
                  backgroundColor: noteColor,
                  color: "black",
                }}
                onMouseMove={(e) => handleMouseMove(e, noteColor)}
                onMouseLeave={handleMouseLeave}
              >
                <p className="text-lg font-semibold">{task.title}</p>
                <p className="text-sm mt-2">{task.description}</p>
              </div>
            );
          })}
        </div>

        {/* Add Task Button under the Task Section */}
        <button
          onClick={handleAddTaskClick}
          className={`mt-8 px-4 py-2 rounded-full flex items-center gap-2 mx-auto ${
            isDarkMode
              ? "bg-teal-500 text-white hover:bg-teal-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <PlusIcon className="h-5 w-5" />
          Add Task
        </button>
      </section>

      {/* Modal for Adding New Task */}
      <CreateTaskModal
        isModalOpen={isModalOpen}
        newTaskTitle={newTaskTitle}
        newTaskDescription={newTaskDescription}
        setNewTaskTitle={setNewTaskTitle}
        setNewTaskDescription={setNewTaskDescription}
        handleCreateTask={handleCreateTask}
        closeModal={() => setIsModalOpen(false)}
      />
    </div>
  );
}
