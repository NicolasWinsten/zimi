"use client";
import { mahjongBlue, mahjongTileFace } from "app/ui/styles";
import { MaShanZheng } from "./fonts";

function HanziTile({ character, handleClick, selected, matchColor, shaking, inactive}) {
  const selectedClass = selected ? 'scale-120 z-1' : 'scale-100';
  const shadowClass = selected ? 'shadow-lg' : 'shadow-md';
  const borderClass = selected ? 'ring-4 ring-black' : '';
  const isMatched = !!matchColor;
  const shakeClass = shaking ? 'tile-shake' : '';
  
  const classes = `${selectedClass} ${shadowClass} ${borderClass} ${shakeClass} ${MaShanZheng.className}
    relative w-20 h-25 rounded-lg border-4
    flex items-center justify-center text-3xl
    transition-all duration-200
    ${inactive ? '' : 'tile-hover active:translate-y-1 active:shadow-sm'}
    cursor-pointer
    border-t-4 border-l-4 border-b-0 border-r-0`;
  // tile face color and trim (border) color applied via inline style to use exact hex values
  const tileStyle = {
    borderColor: mahjongBlue, // mahjong tile trim
    background: mahjongTileFace // tile face
  };
  
  return (
    <button className={classes} style={tileStyle} onClick={() => !inactive && handleClick()}>
      {isMatched && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
          <div className={`w-12 h-12 border-4 ${matchColor} rounded-full`}></div>
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

export default HanziTile;