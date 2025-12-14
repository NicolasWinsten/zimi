'use client';
import HanziTile from "./hanzi-tile";
import { isValidWord } from "../lib/dictionary";
import { produce } from "immer";
import { useEffect, useState } from "react";

// possibly add functionality to generate more colors if needed (for bigger game boards)
const matchColors = ['border-green-300', 'border-red-600', 'border-teal-300', 'border-orange-300', 'border-pink-300', 'border-red-300', 'border-indigo-300', 'border-amber-300'];

export const initialGridState = (characters) => ({
  tileStates: characters.map(c => ({char: c, match: null, color: null})),
  remainingColors: [...matchColors],
  strikes: 0,
});

export const gameIsCompleted = (gameState) => {
  return gameState.tileStates.every(t => t.match !== null);
}

export const gameIsFinished = (gameState) => {
  return gameIsCompleted(gameState) || gameState.strikes == 3;
}

export function gridReducer(state, action) {
  switch(action.type) {
    // TODO do we need this
    case 'reset': {
      return action.state;
    }
    case 'match': {
      const [index1, index2] = action.tiles;
      const color = state.remainingColors[0];
      return produce(state, draft => {
        draft.tileStates[index1].match = index2;
        draft.tileStates[index1].color = color;
        draft.tileStates[index2].match = index1;
        draft.tileStates[index2].color = color;
        draft.remainingColors = draft.remainingColors.slice(1);
      });
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
    
    // case 'shake': {
    //   return produce(state, draft => {
    //     action.tiles.forEach(t => {
    //       draft.tileStates[t].shaking = true;
    //     });
    //   });
    // }
    // case 'clear-shake': {
    //   return produce(state, draft => {
    //     action.tiles.forEach(t => {
    //       draft.tileStates[t].shaking = false;
    //     })
    //   });
    // }
    
    // case 'select': {
    //   return {...state, selectedTile: action.tile };
    // }
    // case 'deselect': {
    //   return {...state, selectedTile: null };
    // }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export default function HanziGrid({ state, dispatch, gameBegun}) {
  const { tileStates, strikes } = state;

  const [selectedTile, setSelectedTile] = useState(null);
  const [shakingTiles, setShakingTiles] = useState([]);
  const [playedFailAnimation, setPlayedFailAnimation] = useState(false);

  const characters = tileStates.map(({char}) => char);

  function shakeTiles(tiles) {
    setShakingTiles(shakingTiles => shakingTiles.concat(tiles));
    setTimeout(() => {
      setShakingTiles(shakingTiles => shakingTiles.filter(t => !tiles.includes(t)));
    }, 500);
  }

  function failAnimation() {
    let tiles = tileStates.map((t, i) => i)
    shakeTiles(tiles);
  }
  
  useEffect(() => {
    if (strikes === 3 && gameBegun && !playedFailAnimation) {
      console.log("Game over animation triggered!");
      failAnimation();
      setPlayedFailAnimation(true);
    }
  }, [strikes, gameBegun, playedFailAnimation]);

  function handleTileClick(index) {
    if (gameIsCompleted(state)) return; // no action if game is completed

    if (tileStates[index].match !== null) {
      dispatch({ type: 'unmatch', tile: index });
    }
    else if (selectedTile === index) {
      // dispatch({ type: 'deselect' });
      setSelectedTile(null);
    }
    else if (selectedTile !== null) {
      // check if selected tiles form a word
      const word = characters[selectedTile] + characters[index];
      if (isValidWord(word)) {
        console.log(`${word} is valid!`);
        dispatch({ type: 'match', tiles: [selectedTile, index] });
        setSelectedTile(null);
      } else {
        console.log(`${word} is NOT valid!`);
        // Trigger a shake + flash animation on both tiles, then clear and deselect
        const tiles = [selectedTile, index];
        // dispatch({ type: 'shake', tiles });
        shakeTiles(tiles);
        // dispatch({ type: 'deselect' });
        setSelectedTile(null);
        dispatch({ type: 'strike'});
      }
    } else {
      // dispatch({ type: 'select', tile: index });
      setSelectedTile(index);
    }
  }

  // I use the index as the key for character tiles here but allegedly you shouldn't do that.
  // it may cause bugs if the tiles are rearranged or removed.
  return (
    <div className="grid grid-cols-4 gap-1 w-fit" data-testid="hanzi-grid">
      { characters.map((char, index) =>
        <HanziTile
          key={char + index}
          matchColor={tileStates[index].color}
          selected={index == selectedTile}
          shaking={shakingTiles.includes(index)}
          character={char}
          handleClick={() => handleTileClick(index)}
          inactive={gameIsFinished(state)}
          index={index}
          />)
      }
    </div>
  );
}
