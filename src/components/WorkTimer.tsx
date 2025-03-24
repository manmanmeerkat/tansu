"use client";

import { useState, useEffect, useRef } from "react";

interface WorkTimerProps {
  onTimeUpdate?: (seconds: number) => void;
  onComplete?: (seconds: number) => void;
}

const WorkTimer: React.FC<WorkTimerProps> = ({ onTimeUpdate, onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // 秒単位
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // タイマーの開始処理
  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;

      timerRef.current = setInterval(() => {
        const currentElapsed = Math.floor(
          (Date.now() - (startTimeRef.current || 0)) / 1000
        );
        setElapsedTime(currentElapsed);
        if (onTimeUpdate) onTimeUpdate(currentElapsed);
      }, 1000);
    }
  };

  // 一時停止処理
  const handlePause = () => {
    if (isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      pausedTimeRef.current = elapsedTime;
      setIsRunning(false);
    }
  };

  // 終了処理
  const handleStop = () => {
    if (window.confirm("作業を終了しますか？")) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRunning(false);
      if (onComplete) onComplete(elapsedTime);
    }
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 時間を時:分:秒の形式にフォーマット
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((val) => val.toString().padStart(2, "0"))
      .join(":");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-700">作業時間計測</h3>
        <div className="text-xl font-mono bg-gray-100 px-4 py-2 rounded-md">
          {formatTime(elapsedTime)}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className={`px-4 py-2 rounded-md ${
            isRunning
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          開始
        </button>

        <button
          onClick={handlePause}
          disabled={!isRunning}
          className={`px-4 py-2 rounded-md ${
            !isRunning
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 text-white"
          }`}
        >
          一時停止
        </button>

        <button
          onClick={handleStop}
          disabled={!isRunning && elapsedTime === 0}
          className={`px-4 py-2 rounded-md ${
            !isRunning && elapsedTime === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          終了
        </button>
      </div>
    </div>
  );
};

export default WorkTimer;
