// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Flame,
} from "lucide-react";

// Task interface
interface RoutineTask {
  id: number;
  task: string;
  description: string;
  duration: number;
  category: "wellness" | "fitness" | "mindfulness";
}

type CompletedTasks = Record<number, boolean>;

const routine: RoutineTask[] = [
  {
    id: 1,
    task: "Hydrate",
    description: "Drink water",
    duration: 0.5,
    category: "wellness",
  },
  {
    id: 2,
    task: "Stretch",
    description: "Quick stretches",
    duration: 3,
    category: "fitness",
  },
  {
    id: 3,
    task: "Breathe",
    description: "Deep breathing",
    duration: 5,
    category: "mindfulness",
  },
  {
    id: 4,
    task: "Core",
    description: "Core workout",
    duration: 8,
    category: "fitness",
  },
  {
    id: 5,
    task: "Move",
    description: "Walk/jog",
    duration: 10,
    category: "fitness",
  },
  {
    id: 6,
    task: "Gratitude",
    description: "3 grateful thoughts",
    duration: 2,
    category: "mindfulness",
  },
];

// Storage utilities
const StorageManager = {
  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  },
  
  getTodayProgress(): CompletedTasks {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(`morning-routine-${this.getTodayKey()}`) || '{}');
    } catch {
      return {};
    }
  },
  
  saveTodayProgress(progress: CompletedTasks) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`morning-routine-${this.getTodayKey()}`, JSON.stringify(progress));
    this.updateStats(progress);
  },
  
  getStats() {
    if (typeof window === 'undefined') return { streak: 0, bestStreak: 0, completedDays: 0 };
    try {
      return JSON.parse(localStorage.getItem('morning-routine-stats') || '{"streak": 0, "bestStreak": 0, "completedDays": 0}');
    } catch {
      return { streak: 0, bestStreak: 0, completedDays: 0 };
    }
  },
  
  updateStats(progress: CompletedTasks) {
    if (typeof window === 'undefined') return;
    const completedCount = Object.keys(progress).length;
    if (completedCount === routine.length) {
      const stats = this.getStats();
      const today = this.getTodayKey();
      const lastCompleted = localStorage.getItem('last-completed-date');
      
      if (lastCompleted !== today) {
        stats.completedDays++;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];
        
        if (lastCompleted === yesterdayKey) {
          stats.streak++;
        } else {
          stats.streak = 1;
        }
        
        if (stats.streak > stats.bestStreak) {
          stats.bestStreak = stats.streak;
        }
        
        localStorage.setItem('morning-routine-stats', JSON.stringify(stats));
        localStorage.setItem('last-completed-date', today);
      }
    }
  },
  
  resetToday() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`morning-routine-${this.getTodayKey()}`);
  }
};

const MorningRoutine: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<CompletedTasks>({});
  const [currentTimer, setCurrentTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stats, setStats] = useState({ streak: 0, bestStreak: 0, completedDays: 0 });

  const totalCompleted = Object.keys(completedTasks).length;
  const progressPercentage = (totalCompleted / routine.length) * 100;

  useEffect(() => {
    setCompletedTasks(StorageManager.getTodayProgress());
    setStats(StorageManager.getStats());
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning && currentTimer !== null) {
      setCompletedTasks((prev) => {
        const newCompleted = { ...prev, [currentTimer]: true };
        StorageManager.saveTodayProgress(newCompleted);
        return newCompleted;
      });
      setIsRunning(false);
      setCurrentTimer(null);
      setStats(StorageManager.getStats());
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
      StorageManager.saveTodayProgress(newCompleted);
      setStats(StorageManager.getStats());
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
    StorageManager.resetToday();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCategoryColor = (category: RoutineTask["category"]) => {
    switch (category) {
      case "fitness":
        return "bg-blue-100 text-blue-700";
      case "mindfulness":
        return "bg-green-100 text-green-700";
      case "wellness":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header - Fixed height */}
      <div className="bg-white shadow-sm p-4 flex-shrink-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Morning Routine</h1>
          <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{stats.streak} day streak</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span>Best: {stats.bestStreak}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Progress</span>
            <span className="text-xs font-medium text-gray-800">
              {totalCompleted}/{routine.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tasks - Scrollable area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="space-y-3">
          {routine.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border-2 transition-all duration-200 task-item ${
                completedTasks[item.id]
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(item.id)}
                    className="flex-shrink-0 transition-colors duration-200"
                    aria-label={completedTasks[item.id] ? "Uncheck task" : "Check task"}
                  >
                    {completedTasks[item.id] ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3
                        className={`font-medium text-sm truncate ${
                          completedTasks[item.id]
                            ? "text-green-700 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        {item.task}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        completedTasks[item.id] ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{item.duration}m</span>
                  </div>

                  {currentTimer === item.id && timeLeft > 0 ? (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-mono text-blue-600 min-w-[35px]">
                        {formatTime(timeLeft)}
                      </span>
                      <button
                        onClick={() => startTimer(item.id, item.duration)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label={isRunning ? "Pause timer" : "Resume timer"}
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
      </div>

      {/* Footer - Fixed */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        {totalCompleted === routine.length ? (
          <div className="text-center mb-3">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="text-lg font-medium text-green-800 mb-1">
              Routine Complete!
            </h3>
            <p className="text-sm text-green-700">
              Great start to your day!
            </p>
          </div>
        ) : null}
        
        <div className="text-center">
          <button
            onClick={resetRoutine}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MorningRoutine;

