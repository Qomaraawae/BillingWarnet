import React, { useState, useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

const Timer = ({ userId, endTime, initialTime, onTimeEnd }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);

  // Format waktu menjadi HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            if (onTimeEnd) onTimeEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeEnd]);

  // Update Firestore ketika waktu berubah
  useEffect(() => {
    const updateFirestore = async () => {
      try {
        await updateDoc(doc(db, "users", userId), {
          remainingTime: timeLeft,
          endTime: new Date(Date.now() + timeLeft * 1000).toISOString(),
        });
      } catch (error) {
        console.error("Error updating time:", error);
      }
    };

    const updateInterval = setInterval(updateFirestore, 15000); // Update Firestore setiap 15 detik
    return () => clearInterval(updateInterval);
  }, [userId, timeLeft]);

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
