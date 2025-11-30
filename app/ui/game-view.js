/**
 * The game view component, where all the good stuff happens
 */

'use client';
import { useReducer, useEffect, useState } from "react";
import HowToBox from './how-to-box';
import HanziTile from "./hanzi-tile";
import { isValidWord } from "../lib/dictionary";
import { produce } from "immer";
import { useStopwatch } from "react-timer-hook";
import PlayerList from "app/ui/player-list";
import { currentDateSeed, sample } from "app/lib/utils";
import { getTopScores, submitDailyScore } from "../lib/db/db";

// possibly add functionality to generate more colors if needed (for bigger game boards)
const matchColors = ['border-green-300', 'border-red-600', 'border-teal-300', 'border-orange-300', 'border-pink-300', 'border-red-300', 'border-indigo-300', 'border-amber-300'];

const initialGridState = (characters) => ({
  tileStates: characters.map(c => ({ match: null, color: null, shaking: false})),
  remainingColors: [...matchColors],
  selectedTile: null,
  completed: false,
  strikes: 0,
});

function gridReducer(state, action) {
  switch(action.type) {
    case 'match': {
      const [index1, index2] = action.tiles;
      const color = state.remainingColors[0];
      const newState = produce(state, draft => {
        draft.tileStates[index1].match = index2;
        draft.tileStates[index1].color = color;
        draft.tileStates[index2].match = index1;
        draft.tileStates[index2].color = color;
        draft.remainingColors = draft.remainingColors.slice(1);
        draft.selectedTile = null;
      });
      // check for game completion
      if (newState.tileStates.every(t => t.match !== null))
        return {...newState, completed: true };
      else return newState;
    }
    case 'unmatch': {
      const tile1 = action.tile;
      const tile2 = state.tileStates[tile1].match;
      const color = state.tileStates[tile1].color;
      return produce(state, draft => {
        draft.tileStates[tile1].match = null
        draft.tileStates[tile1].color = null;
        draft.tileStates[tile2].match = null;
        draft.tileStates[tile2].color = null;
        draft.remainingColors.unshift(color);
      });
    }

    case 'strike': {
      return {...state, strikes: state.strikes + 1};
    }
    
    case 'shake': {
      // const [tile1, tile2] = action.tiles;
      return produce(state, draft => {
        action.tiles.forEach(t => {
          draft.tileStates[t].shaking = true;
        });
      });
    }
    case 'clear-shake': {
      // const [tile1, tile2] = action.tiles;  
      return produce(state, draft => {
        action.tiles.forEach(t => {
          draft.tileStates[t].shaking = false;
        })
      });
    }
    
    case 'select': {
      return {...state, selectedTile: action.tile };
    }
    case 'deselect': {
      return {...state, selectedTile: null };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function HanziGrid({ characters, onFinish, stopWatch }) {
  const [{tileStates, selectedTile, remainingColors, completed, strikes}, dispatch] = useReducer(gridReducer, initialGridState(characters));

  function failAnimation() {
    let tiles = tileStates.map((t, i) => i);
    dispatch({ type: 'shake', tiles });
    setTimeout(() => {
      dispatch({ type: 'clear-shake', tiles });
    }, 500);
  }

  // When the user finishes the game, submit a score (or failure if 3 strikes)
  useEffect(() => {
    if (strikes === 3 || completed) onFinish(completed)
    if (strikes === 3) failAnimation();
  }, [strikes, completed]);

  function handleTileClick(index) {
    if (completed || strikes == 3) return; // no action if game is completed

    if (tileStates[index].match !== null) {
      dispatch({ type: 'unmatch', tile: index });
    }
    else if (selectedTile === index) {
      dispatch({ type: 'deselect' });
    }
    else if (selectedTile !== null) {
      // check if selected tiles form a word
      const word = characters[selectedTile] + characters[index];
      if (isValidWord(word)) {
        console.log(`${word} is valid!`);
        dispatch({ type: 'match', tiles: [selectedTile, index] });
      } else {
        console.log(`${word} is NOT valid!`);
        // Trigger a shake + flash animation on both tiles, then clear and deselect
        const tiles = [selectedTile, index];
        dispatch({ type: 'shake', tiles });
        dispatch({ type: 'deselect' });
        dispatch({ type: 'strike'});
        setTimeout(() => {
          dispatch({ type: 'clear-shake', tiles });
        }, 500);
      }
    } else {
      dispatch({ type: 'select', tile: index });
    }
  }

  // I use the index as the key for character tiles here but allegedly you shouldn't do that.
  // it may cause bugs if the tiles are rearranged or removed.
  return (
    <div className={`flex flex-col items-center justify-center gap-4`}>
      <div className="grid grid-cols-4 gap-1 w-fit">
        { characters.map((char, index) =>
          <HanziTile
            key={char + index}
            matchColor={tileStates[index].color}
            selected={index == selectedTile}
            shaking={tileStates[index].shaking}
            character={char}
            handleClick={() => handleTileClick(index)}
            inactive={completed || strikes === 3}
            />)
        }
      </div>
      <div className="flex gap-4 items-center justify-center h-8">
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
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white px-3 py-1 rounded shadow border border-gray-700">
          <div className="text-lg font-bold font-mono tracking-wider">
            <span>{String(stopWatch.totalSeconds).padStart(2, '0')}</span>
            <span className="animate-pulse">:</span>
            <span>{String(Math.floor(stopWatch.milliseconds / 10)).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </div>
    
  )
}



// TODO pass words and shuffled characters in as props to prevent re-shuffling on each render
export default function GameView({ words }) {
  const [showHowTo, setShowHowTo] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const todaysChars = words.flatMap(word => Array.from(word))
  const shuffledChars = sample(todaysChars.length, todaysChars, currentDateSeed())
  const stopWatch = useStopwatch({ autoStart: false, interval: 20 });

  function onFinish(completed) {
    stopWatch.pause();
    console.log(`Game finished in ${stopWatch.totalSeconds} seconds, and ${stopWatch.milliseconds} milliseconds!`);
    submitDailyScore(completed ? stopWatch.totalSeconds * 1000 + stopWatch.milliseconds : null)
    getTopScores().then(setLeaderboard);
  }

  function begin() {
    setShowHowTo(false);
    stopWatch.start();
  }

  return (
    <>
      {showHowTo && <HowToBox onStart={begin} />}
    <div className={`flex items-center justify-center ${showHowTo ? 'blur-sm pointer-events-none select-none' : ''}`}>
      <HanziGrid characters={shuffledChars} onFinish={onFinish} stopWatch={stopWatch} />
      <PlayerList players={leaderboard} dataFn={player => player.milliseconds} />
    </div>
    </>
  )
}
