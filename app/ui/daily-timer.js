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
    <div className="flex items-center gap-4" suppressHydrationWarning={true}>
      <div className="text-xl font-bold mb-0.5">Next Daily</div>
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-3 py-1.5 rounded-lg shadow-md border border-purple-400">
        <div className="font-mono font-bold text-sm tracking-wider">
          {hours.toString().padStart(2, '0')}
          <span className="animate-pulse mx-0.5">:</span>
          {minutes.toString().padStart(2, '0')}
          <span className="animate-pulse mx-0.5">:</span>
          {seconds.toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}