/**
 * The game view component, where all the good stuff happens
 */

'use client';
import { useState, useReducer, useEffect } from "react";
import { isValidWord } from "./dictionary";
import { produce } from "immer";
import { useStopwatch } from "react-timer-hook";
import { MaShanZheng } from "./ui/fonts";

// possibly add functionality to generate more colors if needed (for bigger game boards)
const matchColors = ['bg-green-300', 'bg-red-600', 'bg-teal-300', 'bg-orange-300', 'bg-pink-300', 'bg-red-300', 'bg-indigo-300', 'bg-amber-300'];

const defaultTileColor = 'bg-white';

function HanziTile({ character, handleClick, selected, color }) {
  const bwidth = selected ? 'border-4' : 'border-1';
  const weight = selected ? 'font-bold' : 'font-normal';
  const bgColor = color ? color : defaultTileColor;
  const classes = `${bwidth} ${weight} ${bgColor} p-4 text-4xl flex items-center justify-center hover:scale-105 hover:border-4 hover:font-bold`;
  
  return (
    <button className={classes} onClick={handleClick}>
      {character}
    </button>
  )
}

const initialGridState = (characters) => ({
  tileStates: characters.map(c => ({ match: null, color: defaultTileColor })),
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
        draft.tileStates[tile1].color = defaultTileColor;
        draft.tileStates[tile2].match = null;
        draft.tileStates[tile2].color = defaultTileColor;
        draft.remainingColors.unshift(color);
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
    if (completed) return;
    
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
        dispatch({ type: 'deselect' });
      }
    } else {
      dispatch({ type: 'select', tile: index });
    }
  }

  // I use the index as the key for character tiles here but allegedly you shouldn't do that.
  // it may cause bugs if the tiles are rearranged or removed.
  return (
    <div className={MaShanZheng.className + " grid grid-cols-4 gap-4"}>
      { characters.map((char, index) => <HanziTile key={char + index} color={tileStates[index].color} selected={index == selectedTile} character={char} handleClick={() => handleTileClick(index)}/>) }
    </div>
    
  )
}

export default function GameView({ characters }) {
  const stopWatch = useStopwatch({ autoStart: true, interval: 20 });

  function onFinish() {
    stopWatch.pause();
    console.log(`Game finished in ${stopWatch.totalSeconds} seconds, and ${stopWatch.milliseconds} milliseconds!`);
  }

  return (
    <div>
    <span>{stopWatch.totalSeconds}</span>:<span>{stopWatch.milliseconds}</span>
      <HanziGrid characters={characters} onFinish={onFinish} />
    </div>
  )
}
