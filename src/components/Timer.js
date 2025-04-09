import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../FirebaseConfig";

const Timer = ({ userId, onTimeEnd }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [, setEndTime] = useState(null);

  // Format waktu menjadi HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Subscribe ke perubahan waktu di Firestore
  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.endTime) {
          setEndTime(data.endTime);
          // Hitung waktu tersisa berdasarkan waktu server
          const now = new Date();
          const end = new Date(data.endTime);
          const diffInSeconds = Math.floor((end - now) / 1000);
          setTimeLeft(Math.max(0, diffInSeconds));
        }
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Timer countdown
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            if (onTimeEnd) onTimeEnd();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeEnd]);

  // Tampilan timer dengan styling Tailwind
  return (
    <div className="flex items-center space-x-2">
      <span
        className={`text-lg font-mono font-bold ${
          timeLeft < 300 ? "text-red-600" : "text-green-600"
        }`}
      >
        {formatTime(timeLeft)}
      </span>
      <button
        onClick={() => setIsActive(!isActive)}
        className={`px-2 py-1 rounded text-sm ${
          isActive ? "bg-yellow-500 text-white" : "bg-green-500 text-white"
        }`}
      >
        {isActive ? "Pause" : "Resume"}
      </button>
    </div>
  );
};

export default Timer;
