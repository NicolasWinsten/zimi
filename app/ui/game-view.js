/**
 * The game view component, where all the good stuff happens
 */

'use client';
import { useRef, useEffect, useReducer, useState } from "react";
import HowToBox from './how-to-box';
import HanziGrid, { initialGridState, gridReducer, gameIsFinished } from "./hanzi-grid";
import { useStopwatch } from "react-timer-hook";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { shareOnMobile } from "react-mobile-share";
import WordList from "./word-list";
import { TimerFace } from "app/ui/timer";

function StrikesIndicator({ strikes }) {
  return (
    <Box data-testid="strikes-indicator" sx={{ display: 'flex', gap: 1 }}>
      {[1,2,3].map(i => (
        <Box
          key={i}
          data-testid={`strike-${i}`}
          data-strike-active={i <= strikes ? 'true' : 'false'}
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: i <= strikes ? '#dc2626' : '#d1d5db'
          }}
        >
          ✕
        </Box>
      ))}
    </Box>
  );
}

function TimerDisplay({ stopWatch }) {
  return (
    <Box 
      data-testid="timer-display"
      sx={{ 
        background: 'linear-gradient(to bottom right, #1f2937, #111827)',
        color: 'white',
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        boxShadow: 1,
        border: '1px solid #374151',
        fontSize: '1.125rem',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        letterSpacing: '0.05em'
      }}
    >
      <TimerFace seconds={stopWatch.totalSeconds} milliseconds={stopWatch.milliseconds} />
    </Box>
  );
}

export default function GameView({ gameState, dispatch, timer, gameBegun }) {

  return (
      <div className="flex flex-col items-center justify-center gap-4">
        <HanziGrid
          state={gameState}
          dispatch={dispatch}
          gameBegun={gameBegun}
        />
        <div className="flex gap-4 items-center justify-center h-8">
          <StrikesIndicator strikes={gameState.strikes} />
          <TimerDisplay stopWatch={timer} />
        </div>
      </div>
  )
}
