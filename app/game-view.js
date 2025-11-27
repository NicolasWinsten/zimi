/**
 * The game view component, where all the good stuff happens
 */

'use client';
import { useReducer } from "react";
import { isValidWord } from "./dictionary";
import { produce } from "immer";
import { useStopwatch } from "react-timer-hook";
import { MaShanZheng } from "./ui/fonts";
import { currentDateSeed, sample } from "app/utils";
import { submitDailyScore } from "./lib/db/db";

// possibly add functionality to generate more colors if needed (for bigger game boards)
const matchColors = ['border-green-300', 'border-red-600', 'border-teal-300', 'border-orange-300', 'border-pink-300', 'border-red-300', 'border-indigo-300', 'border-amber-300'];

function HanziTile({ character, handleClick, selected, matchColor, shaking}) {
  const scale = selected ? 'scale-120' : 'scale-100';
  const borderColor = selected ? 'border-amber-900' : 'border-amber-800';
  const shadowClass = selected ? 'shadow-lg' : 'shadow-md';
  const matchColorClass = `${matchColor}`
  const isMatched = !!matchColor;
  const shakeClass = shaking ? 'tile-shake' : '';
  
  const classes = `${scale} ${borderColor} ${shadowClass} ${shakeClass}
    relative w-20 h-20 rounded-lg border-4
    flex items-center justify-center text-3xl
    transition-all duration-200
    hover:scale-130 hover:shadow-lg hover:border-amber-700
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
      {character}
    </button>
  )
}

const initialGridState = (characters) => ({
  tileStates: characters.map(c => ({ match: null, color: null, shaking: false })),
  remainingColors: [...matchColors],
  selectedTile: null,
  completed: false,
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
    case 'shake': {
      // const tiles = action.tiles || [];
      const [tile1, tile2] = action.tiles;
      return produce(state, draft => {
        draft.tileStates[tile1].shaking = true;
        draft.tileStates[tile2].shaking = true;
        //
        // tiles.forEach(i => { if (draft.tileStates[i]) draft.tileStates[i].shaking = true });
      });
    }
    case 'clear-shake': {
      // const tiles = action.tiles || [];
      const [tile1, tile2] = action.tiles;  
      return produce(state, draft => {
        draft.tileStates[tile1].shaking = false;
        draft.tileStates[tile2].shaking = false;
        //
        //
        // tiles.forEach(i => { if (draft.tileStates[i]) draft.tileStates[i].shaking = false });
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
  const [{tileStates, selectedTile, remainingColors, completed}, dispatch] = useReducer(gridReducer, initialGridState(characters));

  function handleTileClick(index) {
    if (completed) return; // no action if game is completed

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
        // super hacky way to check for game completion. i don't like it. change it (!)
        if (tileStates.filter(t => t.match === null).length === 2) onFinish();
      } else {
        console.log(`${word} is NOT valid!`);
        // Trigger a shake animation on both tiles, then deselect
        dispatch({ type: 'shake', tiles: [selectedTile, index] });
        dispatch({ type: 'deselect' });
        setTimeout(() => {
          dispatch({ type: 'clear-shake', tiles: [selectedTile, index] });
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
        { characters.map((char, index) => <HanziTile key={char + index} matchColor={tileStates[index].color} selected={index == selectedTile} shaking={tileStates[index].shaking} character={char} handleClick={() => handleTileClick(index)}/>) }
      </div>
    </div>
    
  )
}

export default function GameView({ words }) {
  const todaysChars = words.flatMap(word => Array.from(word))
  const shuffledChars = sample(todaysChars.length, todaysChars, currentDateSeed())
  const stopWatch = useStopwatch({ autoStart: true, interval: 20 });

  function onFinish() {
    stopWatch.pause();
    console.log(`Game finished in ${stopWatch.totalSeconds} seconds, and ${stopWatch.milliseconds} milliseconds!`);
    submitDailyScore(stopWatch.totalSeconds * 1000 + stopWatch.milliseconds).then(console.log);
  }

  return (
    <div>
    <span>{stopWatch.totalSeconds}</span>:<span>{stopWatch.milliseconds}</span>
      <HanziGrid characters={shuffledChars} onFinish={onFinish} />
    </div>
  )
}
