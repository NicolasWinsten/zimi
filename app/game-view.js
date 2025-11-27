/**
 * The game view component, where all the good stuff happens
 */

'use client';
import { useReducer, useEffect } from "react";
import { isValidWord } from "./dictionary";
import { produce } from "immer";
import { useStopwatch } from "react-timer-hook";
import { MaShanZheng } from "./ui/fonts";
import { currentDateSeed, sample } from "app/utils";
import { submitDailyScore } from "./lib/db/db";

// possibly add functionality to generate more colors if needed (for bigger game boards)
const matchColors = ['border-green-300', 'border-red-600', 'border-teal-300', 'border-orange-300', 'border-pink-300', 'border-red-300', 'border-indigo-300', 'border-amber-300'];

function HanziTile({ character, handleClick, selected, matchColor, shaking}) {
  const selectedClass = selected ? 'scale-120 z-1' : 'scale-100';
  const borderColor = selected ? 'border-amber-900' : 'border-amber-800';
  const shadowClass = selected ? 'shadow-lg' : 'shadow-md';
  const matchColorClass = `${matchColor}`
  const isMatched = !!matchColor;
  const shakeClass = shaking ? 'tile-shake' : '';
  
  const classes = `${selectedClass} ${borderColor} ${shadowClass} ${shakeClass}
    relative w-20 h-20 rounded-lg border-4
    flex items-center justify-center text-3xl
    transition-all duration-200
    hover:scale-130 hover:shadow-lg hover:border-amber-700 hover:z-1
    active:translate-y-1 active:shadow-sm
    cursor-pointer
    bg-gradient-to-br from-white via-gray-50 to-gray-200
    border-t-4 border-l-4 border-b-2 border-r-2
    before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white before:to-transparent before:opacity-40 before:pointer-events-none`;
  
  return (
    <button className={classes} onClick={handleClick}>
      {isMatched && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
          <div className={`w-12 h-12 border-4 ${matchColorClass} rounded-full`}></div>
        </div>
      )}
      {shaking && ( // when the tile is shaking, show a red flash overlay
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full rounded-lg tile-flash-overlay" />
        </div>
      )}
      {character}
    </button>
  )
}

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
      const [tile1, tile2] = action.tiles;
      return produce(state, draft => {
        draft.tileStates[tile1].shaking = true;
        draft.tileStates[tile2].shaking = true;
      });
    }
    case 'clear-shake': {
      const [tile1, tile2] = action.tiles;  
      return produce(state, draft => {
        draft.tileStates[tile1].shaking = false;
        draft.tileStates[tile2].shaking = false;
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

function HanziGrid({ characters, onFinish }) {
  const [{tileStates, selectedTile, remainingColors, completed, strikes}, dispatch] = useReducer(gridReducer, initialGridState(characters));

  // When the user finishes the game, submit a score (or failure if 3 strikes)
  useEffect(() => {
    if (strikes === 3 || completed) onFinish(completed)
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
    <div className={`${MaShanZheng.className} flex justify-center`}>
      <div className="grid grid-cols-4 gap-1 w-fit">
        { characters.map((char, index) => <HanziTile key={char + index} matchColor={tileStates[index].color} selected={index == selectedTile} shaking={tileStates[index].shaking} flashing={tileStates[index].flashing} character={char} handleClick={() => handleTileClick(index)}/>) }
      </div>
    </div>
    
  )
}

export default function GameView({ words }) {
  const todaysChars = words.flatMap(word => Array.from(word))
  const shuffledChars = sample(todaysChars.length, todaysChars, currentDateSeed())
  const stopWatch = useStopwatch({ autoStart: true, interval: 20 });

  function onFinish(completed) {
    stopWatch.pause();
    console.log(`Game finished in ${stopWatch.totalSeconds} seconds, and ${stopWatch.milliseconds} milliseconds!`);
    
    submitDailyScore(completed ? stopWatch.totalSeconds * 1000 + stopWatch.milliseconds : null).then(console.log);
  }

  return (
    <div>
    <span>{stopWatch.totalSeconds}</span>:<span>{stopWatch.milliseconds}</span>
      <HanziGrid characters={shuffledChars} onFinish={onFinish} />
    </div>
  )
}
