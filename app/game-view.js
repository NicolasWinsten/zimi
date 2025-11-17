/**
 * The game view component, where all the good stuff happens
 */

'use client';



function HanziTile({ character }) {
  return (
    <div className="border p-4 text-4xl flex items-center justify-center">
      {character}
    </div>
  )
}


function HanziGrid({ characters }) {
  // I use the index as the key for character tiles here but allegedly you shouldn't do that.
  // it may cause bugs if the tiles are rearranged or removed.
  return (
    <div className="grid grid-cols-4 gap-4">
      {characters.map((char, index) => <div key={index}><HanziTile character={char}/></div>)}
    </div>
  )
}

export default function GameView({ characters }) {
  return (
    <div>
      <HanziGrid characters={characters} />
    </div>
  )
}
