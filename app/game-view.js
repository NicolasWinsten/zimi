/**
 * The game view component, where all the good stuff happens
 */

'use client';
import { useState } from "react";
import { isValidWord } from "./dictionary";
import { produce } from "immer";
import { useStopwatch } from "react-timer-hook";
import next from "next";

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

// use a reducer to simplify the state logic here?
function HanziGrid({ characters, onFinish }) {
  const [selectedTile, setSelectedTile] = useState(null);
  const [nextMatchColor, setNextMatchColor] = useState(0);
  const [tileStates, setTileStates] = useState(characters.map(c => ({ match: null, color: defaultTileColor })));

  function matchTiles(index1, index2) {
    // must ensure nextMatchColor is within bounds (!)
    let color = matchColors[nextMatchColor];
    setNextMatchColor(nextMatchColor + 1);
    
    let newTileStates = produce(tileStates, draft => {
      draft[index1].match = index2;
      draft[index1].color = color;
      draft[index2].match = index1;
      draft[index2].color = color;
    })

    setTileStates(newTileStates)
    // check for game completion
    if (newTileStates.every(tile => tile.match !== null)) onFinish()
  }

  function unMatchTiles(index1, index2) {
    setNextMatchColor(nextMatchColor - 1);

    setTileStates(produce(tileStates, draft => {
      draft[index1].match = null;
      draft[index1].color = defaultTileColor;
      draft[index2].match = null;
      draft[index2].color = defaultTileColor;
    }))
  }

  function handleTileClick(index) {
    if (tileStates[index].match !== null) {
      unMatchTiles(index, tileStates[index].match);
      setSelectedTile(index);
      return;
    }
    else if (selectedTile === index) {
      setSelectedTile(null);
      return;
    }
    else if (selectedTile !== null) {
      // check if selected tiles form a word
      const word = characters[selectedTile] + characters[index];
      if (isValidWord(word)) {
        matchTiles(selectedTile, index);
      }
      else console.log(`${word} is NOT valid!`);
      setSelectedTile(null);
      return;
    }
    else setSelectedTile(index);
  }

  // I use the index as the key for character tiles here but allegedly you shouldn't do that.
  // it may cause bugs if the tiles are rearranged or removed.
  return (
    <div className="grid grid-cols-4 gap-4">
      { characters.map((char, index) => <HanziTile key={char + index} color={tileStates[index].color} selected={index == selectedTile} character={char} handleClick={() => handleTileClick(index)}/>) }
      <HanziTile character="你" color={matchColors[nextMatchColor]} />
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
