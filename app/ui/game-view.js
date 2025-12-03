/**
 * The game view component, where all the good stuff happens
 */

'use client';
import { useEffect, useState } from "react";
import HowToBox from './how-to-box';
import HanziGrid, { initialGridState } from "./hanzi-grid";
import { useStopwatch } from "react-timer-hook";
import PlayerList from "app/ui/player-list";
import { getTopScores, submitDailyScore } from "../lib/db/db";
import { currentDateSeed } from "app/lib/utils";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { shareOnMobile } from "react-mobile-share";
import WordList from "./word-list";

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

  return `My Daily Zimi\n${date.toDateString()}\n${grid}\n${'❌'.repeat(gameState.strikes)} ${gameState.strikes === 3 ? '😭' : timeStr }`
}

function saveLocalState(gameState, milliseconds, dateSeed) {
  console.log('Saving game state to localStorage...', gameState, milliseconds, dateSeed);
  try {
    localStorage.setItem('game-state', JSON.stringify(gameState));
    localStorage.setItem('game-milliseconds', milliseconds.toString());
    localStorage.setItem('game-date', dateSeed);
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

function localSaveIsStale() {
  try {
    return localStorage.getItem('game-date') !== currentDateSeed();
  } catch (e) {
    return true;
  }
}

function retrieveLocalState() {
  console.log('Retrieving game state from localStorage...');
  try {
    if (localSaveIsStale()) return null;
    const stateStr = localStorage.getItem('game-state');
    const milliseconds = localStorage.getItem('game-milliseconds');
    if (!stateStr || !milliseconds) return null;
    console.log('Retrieved game state:', stateStr, milliseconds);
    return {
      game: JSON.parse(stateStr),
      milliseconds: parseInt(milliseconds, 10)
    };
  } catch (e) {
    console.error('Failed to retrieve game state:', e);
    return null;
  }
}

function StrikesIndicator({ strikes }) {
  return (
    <div className="flex gap-2">
      {[1,2,3].map(i => (
        <div
          key={i}
          className={`w-8 h-8 flex items-center justify-center text-2xl font-extrabold ${
            i <= strikes ? 'text-red-600' : 'text-gray-300'
          }`}
        >
          ✕
        </div>
      ))}
    </div>
  );
}

function TimerDisplay({ stopWatch }) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white px-3 py-1 rounded shadow border border-gray-700">
      <div className="text-lg font-bold font-mono tracking-wider">
        <span>{String(stopWatch.totalSeconds).padStart(2, '0')}</span>
        <span className="animate-pulse">:</span>
        <span>{String(Math.floor(stopWatch.milliseconds / 10)).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

export default function GameView({ words, shuffledChars, dateSeed}) {
  const [{ currentGameState, ms}, setState] = useState(() => {
    const savedGame = retrieveLocalState();
    return {
      currentGameState: savedGame ? savedGame.game : initialGridState(shuffledChars),
      ms: savedGame ? savedGame.milliseconds : 0
    };
  });

  const hasResumableGame = !localSaveIsStale();

  const [showHowTo, setShowHowTo] = useState(!hasResumableGame);
  const [showResumeModal, setShowResumeModal] = useState(hasResumableGame);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  
  // Initialize stopwatch with saved time if resuming
  const stopWatch = useStopwatch({ 
    autoStart: false, 
    interval: 20,
    offsetTimestamp: new Date(Date.now() + ms)
  });

  function getMilliseconds() {
    return stopWatch.totalSeconds * 1000 + stopWatch.milliseconds;
  }

  // Continuously save stopwatch value while timer is running
  useEffect(() => {
    if (Date.now() - lastSaveTime > 1000 && stopWatch.isRunning) {
      saveLocalState(currentGameState, getMilliseconds(), dateSeed);
      setLastSaveTime(Date.now());
    }
  }, [stopWatch, currentGameState]);

  function resumeGame() {
    setShowResumeModal(false);
    setShowHowTo(false);
    if (!gameIsFinished(currentGameState)) stopWatch.start();
  }

  return (
    <div>
      <HowToBox onClose={resumeGame} open={showHowTo}/>
      
      <Dialog open={showResumeModal} onClose={resumeGame}>
        <DialogTitle>Daily Zimi</DialogTitle>
        <DialogContent>
        { gameIsFinished(currentGameState) ?
          "You have a completed game from today. Come back tomorrow for a new zimi!" :
          "You have an in-progress game from today. Resume where you left off?"
        }
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={startNewGame} color="secondary">
            Start New Game
          </Button> */}
          <Button onClick={resumeGame} color="primary" variant="contained">
            Okay!
          </Button>
        </DialogActions>
      </Dialog>

      <div className={`flex items-center justify-center ${showHowTo || showResumeModal ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <div className="flex flex-col items-center justify-center gap-4">
          <HanziGrid 
            characters={shuffledChars} 
            onGameStateChange={gameState => {
              setState({ currentGameState: gameState, ms: getMilliseconds() });
              saveLocalState(gameState, getMilliseconds(), dateSeed);
              if (gameIsFinished(gameState)) stopWatch.pause();
            }}
            initialState={currentGameState}
          />
          <div className="flex gap-4 items-center justify-center h-8">
            <StrikesIndicator strikes={currentGameState.strikes} />
            <TimerDisplay stopWatch={stopWatch} />
          </div>
          { gameIsFinished(currentGameState) && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => shareOnMobile({
                title: 'My Daily Zimi',
                text: makeShareableResultString(currentGameState, getMilliseconds(), dateSeed),
                url: "https://zimi-ten.vercel.app/"
              }, console.error)
              }
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
