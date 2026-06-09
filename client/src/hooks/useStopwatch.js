import { useState, useEffect } from 'react';

export default function useStopwatch(startTime) {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    let timer;
    if (startTime) {
      setCurrentTime(new Date()); 
      timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime]);

  if (!startTime) return "00:00:00";

  const diffInSeconds = Math.floor((currentTime - new Date(startTime)) / 1000);
  if (diffInSeconds < 0) return "00:00:00";

  const hours = String(Math.floor(diffInSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((diffInSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(diffInSeconds % 60).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}