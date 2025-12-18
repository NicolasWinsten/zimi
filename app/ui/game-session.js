'use client';

import GameView from "./game-view";
import { useRef, useEffect, useReducer, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import { initialGridState, gridReducer, gameIsFinished, gameIsCompleted } from "./hanzi-grid";
import { Button, Typography } from '@mui/material';
import HowToBox from 'app/ui/how-to-box';
import MyDialog from 'app/ui/my-dialog';
import { shareOnMobile } from "react-mobile-share";
import WordList from "./word-list";
import StreakPopup from "./streak-popup";
import LoginPromptModal from "./login-prompt-modal";
import { useSession } from "next-auth/react";



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
 * @param {*} words - array of words for this game
 */
function saveLocalState(gameState, milliseconds, dateSeed, words) {
  console.log('Saving game state to localStorage...', gameState, milliseconds, dateSeed);
  const objectToStore = { game: gameState, milliseconds, date: dateSeed, words };
  try {
    localStorage.setItem("zimi-save", JSON.stringify(objectToStore));
  } catch (e) {
    console.error('Failed to save game state to localStorage:', e);
  }
}

/**
 * 
 * @param {string} dateSeed retrieve last saved game state for this date
 * @param {Array<string>} currentWords - the word list for the current game
 * @returns { game: grid state, milliseconds: number } | null
 */
function retrieveLocalState(dateStr, currentWords) {
  try {
    const savedData = JSON.parse(localStorage.getItem("zimi-save"));
    console.log('Retrieved raw saved data:', savedData);
    
    if (!savedData || savedData.date !== dateStr) {
      console.log('No saved game state for', dateStr);
      return null;
    }
    
    const wordListMatch = JSON.stringify(savedData.words) === JSON.stringify(currentWords);
    if (!wordListMatch) {
      console.log('Saved word list does not match current word list. Saved:', savedData.words, 'Current:', currentWords);
      return null;
    }

    return savedData
  } catch (e) {
    console.error('Failed to retrieve game state:', e);
    return null;
  }
}

export default function GameSession({ words, shuffledChars, dateSeed, hskLevel, preventStorage, preventRestore }) {
  const [ currentGameState, dispatch ] = useReducer(gridReducer, initialGridState(shuffledChars));
  const { data: session, status } = useSession();
  
  const [showHowTo, setShowHowTo] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [gameBegun, setGameBegun] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [pendingScore, setPendingScore] = useState(null); // Store score for unauthenticated users

  // Initialize stopwatch with saved time if resuming
  const stopWatch = useStopwatch({ 
    autoStart: false, 
    interval: 20,
  });

  function getMilliseconds() {
    return stopWatch.totalSeconds * 1000 + stopWatch.milliseconds;
  }

  // Function to submit score to backend
  const submitScore = (milliseconds) => {
    fetch('/api/submit-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ milliseconds }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && milliseconds !== null) {
          // Show streak popup
          setStreakData(data.streak);
          setTimeout(() => setShowStreakPopup(true), 500);
        }
      })
      .catch(error => {
        console.error('Error submitting score:', error);
      });
  };

  // upon mounting, check for saved game state in localStorage
  useEffect(() => {
    const savedGame = preventRestore ? null : retrieveLocalState(dateSeed, words);
    if (savedGame) {
      dispatch({ type: 'reset', state: savedGame.game });
      stopWatch.reset(new Date(Date.now() + savedGame.milliseconds), false);
      setShowHowTo(false);
      setShowResumeModal(true);
    } else {
      setShowHowTo(true);
      setShowResumeModal(false);
    }
    // Reset score submitted flag when date changes
    setScoreSubmitted(false);
  }, [dateSeed, words]);

  useEffect(() => {
    if (gameIsFinished(currentGameState)) stopWatch.pause();
    // only save if the game was actually played
    if (gameBegun && !preventStorage) saveLocalState(currentGameState, getMilliseconds(), dateSeed, words);
  }, [currentGameState, dateSeed, words]);

  // Submit score when game is finished
  useEffect(() => {
    if (gameIsFinished(currentGameState) && gameBegun && !scoreSubmitted) {
      setScoreSubmitted(true);
      const completed = gameIsCompleted(currentGameState);
      const milliseconds = completed ? getMilliseconds() : null;
      
      if (status === 'authenticated') {
        // User is logged in, submit score immediately
        submitScore(milliseconds);
      } else if (status === 'unauthenticated' && completed) {
        // User is not logged in and completed the game
        // Store the score to submit after login
        setPendingScore(milliseconds);
        // Show login prompt
        setTimeout(() => setShowLoginPrompt(true), 1000);
      }
    }
  }, [currentGameState, gameBegun, scoreSubmitted, status]);

  // Submit pending score when user authenticates
  useEffect(() => {
    if (status === 'authenticated' && pendingScore !== null) {
      console.log('User authenticated, submitting pending score:', pendingScore);
      submitScore(pendingScore);
      setPendingScore(null); // Clear pending score after submission
      setShowLoginPrompt(false); // Close login prompt if still open
    }
  }, [status, pendingScore]);

  // set up callback to run beforeunload to save game state (save the user's time if they leave mid-game)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (gameBegun && !gameIsFinished(currentGameState) && !preventStorage) {
        saveLocalState(currentGameState, getMilliseconds(), dateSeed, words);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    
    // setting the dependency only to the stopWatch.totalSeconds to avoid excessive re-registrations
    // if the stopWatch itself was a dependency, it would recompute the eventListener on every tick
  }, [currentGameState, gameBegun, dateSeed, words, stopWatch.totalSeconds]);
  
  function resumeGame() {
    setShowResumeModal(false);
    setShowHowTo(false);
    if (!gameIsFinished(currentGameState)) {
      stopWatch.start();
      setGameBegun(true);
    }
  }

  return (
    <div>
      {showHowTo && <HowToBox onClose={resumeGame} open={showHowTo} hskLevel={hskLevel}/>}
      
      <MyDialog
        open={showResumeModal}
        onClose={resumeGame}
        title="Daily Zimi"
        subTitle={hskLevel ? `Today's Puzzle: HSK Level ${hskLevel}` : undefined}
        data-testid="resume-game-dialog"
        children=
            { gameIsFinished(currentGameState) ?
              "You have a completed game from today. Come back tomorrow for a new zimi!" :
              "You have an in-progress game from today. Resume where you left off?"
            }
        buttonContent={ gameIsFinished(currentGameState) ? "Look at scores" : "Resume" }
      />

      {streakData && (
        <StreakPopup
          open={showStreakPopup}
          onClose={() => setShowStreakPopup(false)}
          streakLength={streakData.current_streak_length}
          isNewStreak={streakData.current_streak_length === 1}
        />
      )}

      <LoginPromptModal
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

      <div className={`flex flex-col gap-4 items-center justify-center ${showHowTo || showResumeModal ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <GameView
          gameState={currentGameState}
          dispatch={dispatch}
          timer={stopWatch}
          gameBegun={gameBegun}
        />
        { gameIsFinished(currentGameState) && (
          <Button
            data-testid="share-results-button"
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
      { gameIsFinished(currentGameState) && <WordList words={words} /> }
    </div>
  )  

}