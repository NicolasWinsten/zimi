'use client';
import { useReducer, useEffect, useRef } from "react";
import HanziTile from "./hanzi-tile";
import { isValidWord } from "../lib/dictionary";
import { produce } from "immer";

// possibly add functionality to generate more colors if needed (for bigger game boards)
const matchColors = ['border-green-300', 'border-red-600', 'border-teal-300', 'border-orange-300', 'border-pink-300', 'border-red-300', 'border-indigo-300', 'border-amber-300'];

export const initialGridState = (characters) => ({
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
      return produce(state, draft => {
        action.tiles.forEach(t => {
          draft.tileStates[t].shaking = true;
        });
      });
    }
    case 'clear-shake': {
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

export default function HanziGrid({ characters, onGameStateChange, initialState }) {
  const [gameState, dispatch] = useReducer(
    gridReducer, 
    initialState || initialGridState(characters)
  );

  const { tileStates, selectedTile, remainingColors, completed, strikes } = gameState;
  const prevStrikesRef = useRef(strikes);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    onGameStateChange(gameState);
  }, [tileStates, strikes]);


  function failAnimation() {
    let tiles = tileStates.map((t, i) => i);
    dispatch({ type: 'shake', tiles });
    setTimeout(() => {
      dispatch({ type: 'clear-shake', tiles });
    }, 500);
  }

  // When the user gets their third strike, play the fail animation
  useEffect(() => {
    if (strikes === 3 && prevStrikesRef.current < 3) {
      failAnimation();
    }
    prevStrikesRef.current = strikes;
  }, [strikes]);

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
  );
}
