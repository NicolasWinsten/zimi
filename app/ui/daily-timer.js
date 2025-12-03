'use client';

import { useTimer } from 'react-timer-hook';
import { Box, Typography } from '@mui/material';

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
          border: '1px solid #c084fc'
        }}
      >
        <Typography 
          sx={{ 
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            letterSpacing: '0.05em'
          }}
        >
          {hours.toString().padStart(2, '0')}
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
          {minutes.toString().padStart(2, '0')}
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
          {seconds.toString().padStart(2, '0')}
        </Typography>
      </Box>
    </Box>
  );
}