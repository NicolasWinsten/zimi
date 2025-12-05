"use client";
import { mahjongBlue, mahjongTileFace } from "app/ui/styles";
import { MaShanZheng } from "./fonts";
import { motion } from "motion/react";

function HanziTile({ character, handleClick, selected, matchColor, shaking, inactive, index}) {
  const isMatched = !!matchColor;
  
  const classes = `${MaShanZheng.className}
    relative w-20 h-25 rounded-lg border-4
    flex items-center justify-center text-3xl
    cursor-pointer
    border-t-4 border-l-4 border-b-0 border-r-0`;
  
  // tile face color and trim (border) color applied via inline style to use exact hex values
  const tileStyle = {
    borderColor: mahjongBlue, // mahjong tile trim
    background: mahjongTileFace // tile face
  };

  return (
    <motion.button 
      data-testid={`hanzi-tile-${index}`}
      data-selected={selected}
      className={classes}
      style={{
        ...tileStyle,
        zIndex: selected ? 10 : 1
      }}
      onClick={() => !inactive && handleClick()}
      animate={
        shaking ? {
          x: [0, -5, 5, -5, 5, 0],
          backgroundColor: [mahjongTileFace, '#FF6B6B', '#FF6B6B', mahjongTileFace],
          zIndex: 10,
          boxShadow: selected ? "0 0 0 4px black, 0 4px 6px rgba(0,0,0,0.3)" : "0 4px 6px rgba(0,0,0,0.3)"
        } : {
          scale: selected ? 1.2 : 1.0,
          zIndex: selected ? 10 : 1,
          boxShadow: selected ? "0 0 0 4px black, 0 4px 6px rgba(0,0,0,0.3)" : "0 4px 6px rgba(0,0,0,0.3)"
        }
      }
      whileHover={inactive || selected ? {} : { scale: 1.2, zIndex: 10, boxShadow: "0 8px 16px rgba(0,0,0,0.25)" }}
      whileTap={inactive ? {} : { y: 5, boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
      transition={{
        duration: shaking ? 0.5 : 0.2,
        ease: "easeInOut"
      }}
      initial={false}
    >
      {isMatched && (
        <div  className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
          <div data-testid={`match-indicator-${index}`} className={`w-12 h-12 border-4 ${matchColor} rounded-full`}></div>
        </div>
      )}
      {character}
    </motion.button>
  )
}

export default HanziTile;