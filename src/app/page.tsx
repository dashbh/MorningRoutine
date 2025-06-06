"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  Clock,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

// Task interface
interface RoutineTask {
  id: number;
  task: string;
  description: string;
  duration: number; // in minutes
  category: "wellness" | "fitness" | "mindfulness" | string;
}

// Completed tasks type (id as key, boolean as value)
type CompletedTasks = Record<number, boolean>;

const routine: RoutineTask[] = [
  {
    id: 1,
    task: "Hydrate",
    description: "Drink a full glass of water",
    duration: 0.5,
    category: "wellness",
  },
  {
    id: 2,
    task: "Quick Stretch",
    description: "Simple neck, shoulder & back stretches",
    duration: 3,
    category: "fitness",
  },
  {
    id: 3,
    task: "Mindful Breathing",
    description: "Deep breathing or brief meditation",
    duration: 5,
    category: "mindfulness",
  },
  {
    id: 4,
    task: "Core Workout",
    description: "Planks, crunches, or bodyweight exercises",
    duration: 8,
    category: "fitness",
  },
  {
    id: 5,
    task: "Power Walk/Jog",
    description: "Quick outdoor movement or indoor cardio",
    duration: 10,
    category: "fitness",
  },
  {
    id: 6,
    task: "Gratitude Moment",
    description: "Think of 3 things you're grateful for",
    duration: 2,
    category: "mindfulness",
  },
];

const MorningRoutine: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<CompletedTasks>({});
  const [currentTimer, setCurrentTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const totalCompleted = Object.keys(completedTasks).length;
  const progressPercentage = (totalCompleted / routine.length) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning && currentTimer !== null) {
      // Auto-complete the task when timer finishes
      setCompletedTasks((prev) => ({
        ...prev,
        [currentTimer]: true,
      }));
      setIsRunning(false);
      setCurrentTimer(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, currentTimer]);

  const toggleTask = (taskId: number) => {
    setCompletedTasks((prev) => {
      const newCompleted = { ...prev };
      if (newCompleted[taskId]) {
        delete newCompleted[taskId];
      } else {
        newCompleted[taskId] = true;
      }
      return newCompleted;
    });
  };

  const startTimer = (taskId: number, duration: number) => {
    if (currentTimer === taskId && isRunning) {
      setIsRunning(false);
    } else {
      setCurrentTimer(taskId);
      setTimeLeft(duration * 60);
      setIsRunning(true);
    }
  };

  const resetRoutine = () => {
    setCompletedTasks({});
    setCurrentTimer(null);
    setTimeLeft(0);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCategoryColor = (category: RoutineTask["category"]) => {
    switch (category) {
      case "fitness":
        return "bg-blue-100 text-blue-800";
      case "mindfulness":
        return "bg-green-100 text-green-800";
      case "wellness":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Morning Routine
        </h1>
        <p className="text-gray-600">
          9:00 AM • 30 Minutes • Fitness & Mindfulness
        </p>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-800">
              {totalCompleted}/{routine.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {routine.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              completedTasks[item.id]
                ? "bg-green-50 border-green-200"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <button
                  onClick={() => toggleTask(item.id)}
                  className="flex-shrink-0 transition-colors duration-200"
                  aria-label={
                    completedTasks[item.id] ? "Uncheck task" : "Check task"
                  }
                >
                  {completedTasks[item.id] ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3
                      className={`font-medium ${
                        completedTasks[item.id]
                          ? "text-green-700 line-through"
                          : "text-gray-800"
                      }`}
                    >
                      {item.task}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      completedTasks[item.id]
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{item.duration}min</span>
                </div>

                {currentTimer === item.id && timeLeft > 0 ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-blue-600">
                      {formatTime(timeLeft)}
                    </span>
                    <button
                      onClick={() => startTimer(item.id, item.duration)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label={
                        isRunning ? "Pause timer" : "Resume timer"
                      }
                    >
                      {isRunning ? (
                        <Pause className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Play className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startTimer(item.id, item.duration)}
                    className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                    title="Start timer"
                    aria-label="Start timer"
                  >
                    <Play className="w-4 h-4 text-blue-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={resetRoutine}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Routine</span>
        </button>
      </div>

      {totalCompleted === routine.length && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="text-lg font-medium text-green-800 mb-1">
            🎉 Routine Complete!
          </h3>
          <p className="text-green-700">
            Great job starting your day with intention and energy!
          </p>
        </div>
      )}
    </div>
  );
};

export default MorningRoutine;
