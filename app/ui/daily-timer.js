'use client';

import { useTimer } from 'react-timer-hook'; 

export default function DailyTimer({ onExpire }) {
  const expiryTimestamp = new Date();
  // set expiry to midnight
  expiryTimestamp.setUTCHours(24,0,0,0);
  
  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({ expiryTimestamp, onExpire });

  return (
    <div>
      <span>Next daily in: {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
}