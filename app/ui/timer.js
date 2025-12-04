'use client';

import { useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';
import { Box, Typography } from '@mui/material';

function TimerColon() {
  return (
    <Box 
      component="span" 
      sx={{ 
        mx: 0.0625,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.5,
          },
        },
      }}
    >
      :
    </Box>
  )
}

export function TimerFace({hours, minutes, seconds, milliseconds}) {
  function colonAfter(value) {
    if (value === undefined) return null
    return (
      <span>
      { value.toString().padStart(2, '0') }
      <TimerColon />
      </span>
    )
  }

  // milliseconds are truncated to two digits for display
  const ms = milliseconds !== undefined
    ? <span><TimerColon />{(Math.floor(milliseconds / 10)).toString().padStart(2, '0')} </span>
    : null;
  
  return (
    <Box>
      {colonAfter(hours)}
      {colonAfter(minutes)}
      {seconds.toString().padStart(2, '0')}
      {ms}
    </Box>
  )
}

export function DailyTimer({ onExpire }) {
  const [isMounted, setIsMounted] = useState(false);
  
  const expiryTimestamp = new Date();
    // set expiry to midnight
  expiryTimestamp.setUTCHours(24,0,0,0);

  const {
    seconds,
    minutes,
    hours,
    start
    } = useTimer({ expiryTimestamp, onExpire});

  // start the timer on mount, so initial render is the same as on the server
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2 
      }} 
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 0.0625 
        }}
      >
        Next Daily
      </Typography>
      <Box 
        sx={{ 
          background: 'linear-gradient(to bottom right, #9333ea, #6b21a8)',
          color: 'white',
          px: 1.5,
          py: 0.75,
          borderRadius: 2,
          boxShadow: 3,
          border: '1px solid #c084fc',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: '0.875rem',
          letterSpacing: '0.05em'
        }}
      >
        {isMounted && <TimerFace hours={hours} minutes={minutes} seconds={seconds} />}
      </Box>
    </Box>
  );
}