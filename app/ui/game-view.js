/**
 * The game view component, where all the good stuff happens
 */

'use client';
import { use, useEffect, useReducer, useState } from "react";
import HowToBox from './how-to-box';
import HanziGrid, { initialGridState, gridReducer } from "./hanzi-grid";
import { useStopwatch } from "react-timer-hook";
import PlayerList from "app/ui/player-list";
import { getTopScores, submitDailyScore } from "../lib/db/db";
import { currentDateSeed } from "app/lib/utils";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { shareOnMobile } from "react-mobile-share";
import WordList from "./word-list";
import { TimerFace } from "app/ui/timer";

const gameIsFinished = (gameState) => {
  return gameState.completed || gameState.strikes == 3;
}

const makeShareableResultString = (gameState, milliseconds, dateSeed) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const ms = milliseconds % 1000;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(3, '0')}`

  const tileToEmoji = (tile) => tile.match !== null ? '🟩' : '🟥';
  const date = new Date(dateSeed);

  const grid = gameState.tileStates.map((tile, index) => {
    const isEndOfRow = (index + 1) % 4 === 0;
    return tileToEmoji(tile) + (isEndOfRow ? '\n' : '');
  }).join('');

  return `My Daily Zimi\n${date.toDateString()}\n${grid}\n${'❌'.repeat(gameState.strikes)} ${gameState.strikes === 3 ? '😭' : timeStr}\n`
}

/**
 * Save a snapshot of the current game state to localStorage
 * @param {*} gameState 
 * @param {*} milliseconds 
 * @param {*} dateSeed 
 */
function saveLocalState(gameState, milliseconds, dateSeed) {
  console.log('Saving game state to localStorage...', gameState, milliseconds, dateSeed);
  const objectToStore = { game: gameState, milliseconds };
  try {
    localStorage.setItem(dateSeed, JSON.stringify(objectToStore));
  } catch (e) {
    console.error('Failed to save game state to localStorage:', e);
  }
}

/**
 * 
 * @param {string} dateSeed retrieve last saved game state for this date
 * @returns { game: grid state, milliseconds: number } | null
 */
function retrieveLocalState(dateSeed) {
  try {
    const savedData = JSON.parse(localStorage.getItem(dateSeed));
    console.log('Retrieved raw saved data:', savedData);
    return savedData
  } catch (e) {
    console.error('Failed to retrieve game state:', e);
    return null;
  }
}

function StrikesIndicator({ strikes }) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {[1,2,3].map(i => (
        <Box
          key={i}
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

export default function GameView({ words, shuffledChars, dateSeed }) {
  const [ currentGameState, dispatch ] = useReducer(gridReducer, initialGridState(shuffledChars));

  const [showHowTo, setShowHowTo] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());

  // Initialize stopwatch with saved time if resuming
  const stopWatch = useStopwatch({ 
    autoStart: false, 
    interval: 20,
  });

  function getMilliseconds() {
    return stopWatch.totalSeconds * 1000 + stopWatch.milliseconds;
  }

  // upon mounting, check for saved game state in localStorage
  useEffect(() => {
    const savedGame = retrieveLocalState(dateSeed);
    if (savedGame) {
      dispatch({ type: 'reset', state: savedGame.game });
      stopWatch.reset(new Date(Date.now() + savedGame.milliseconds), false);
      setShowHowTo(false);
      setShowResumeModal(true);
    }
  }, []);

  // Continuously save stopwatch value while timer is running every second
  useEffect(() => {
    if (Date.now() - lastSaveTime > 1000 && stopWatch.isRunning) {
      saveLocalState(currentGameState, getMilliseconds(), dateSeed);
      setLastSaveTime(Date.now());
    }
  }, [stopWatch, currentGameState]);

  // save game state when it changes
  useEffect(() => {
    if (gameIsFinished(currentGameState)) stopWatch.pause();
    saveLocalState(currentGameState, getMilliseconds(), dateSeed);
  }, [currentGameState.tileStates, currentGameState.strikes]);

  function resumeGame() {
    setShowResumeModal(false);
    setShowHowTo(false);
    if (!gameIsFinished(currentGameState)) stopWatch.start();
  }

  return (
    <div>
      {showHowTo && <HowToBox onClose={resumeGame} open={showHowTo}/>}
      
      <Dialog open={showResumeModal} onClose={resumeGame} >
        <DialogTitle>Daily Zimi</DialogTitle>
        <DialogContent>
        { gameIsFinished(currentGameState) ?
          "You have a completed game from today. Come back tomorrow for a new zimi!" :
          "You have an in-progress game from today. Resume where you left off?"
        }
        </DialogContent>
        <DialogActions>
          <Button onClick={resumeGame} color="primary" variant="contained">
            Okay!
          </Button>
        </DialogActions>
      </Dialog>

      <div className={`flex items-center justify-center ${showHowTo || showResumeModal ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <div className="flex flex-col items-center justify-center gap-4">
          <HanziGrid
            state={currentGameState}
            dispatch={dispatch}
          />
          <div className="flex gap-4 items-center justify-center h-8">
            <StrikesIndicator strikes={currentGameState.strikes} />
            <TimerDisplay stopWatch={stopWatch} />
          </div>
          { gameIsFinished(currentGameState) && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                shareOnMobile({
                  title: 'My Daily Zimi',
                  text: makeShareableResultString(currentGameState, getMilliseconds(), dateSeed),
                  url: "https://zimi-ten.vercel.app/"
                }, console.error)
              }}
              >
                Share your results
              </Button>
          ) }
            
        </div>
        {/* <PlayerList players={leaderboard} dataFn={player => player.milliseconds} /> */}
      </div>
      { gameIsFinished(currentGameState) && <WordList words={words} /> }
    </div>
  )
}
