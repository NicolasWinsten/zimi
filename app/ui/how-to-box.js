"use client";
import React from 'react';
import HanziTile from './hanzi-tile';


export default function HowToBox({ onStart }) {
  return (
    <div className="fixed left-0 right-0 top-16 flex items-start justify-center z-50 pointer-events-none p-6">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 border-4 border-purple-500 pointer-events-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">How to Play</h2>
        <div className="space-y-3 text-gray-700 mb-6">
          <div className="flex items-start gap-2">
            <span className="font-bold min-w-fit">1.</span>
            <span>Click two characters to form a word</span>
            <div className="flex gap-2">
              <HanziTile character="好" inactive={true} />
              <HanziTile character="吃" inactive={true} />
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold min-w-fit">2.</span>
            <span>If the two characters form a valid Chinese word, they match!</span>
            <div className="flex gap-2">
              <HanziTile character="好" inactive={true} matchColor={'border-red-600'}/>
              <HanziTile character="吃" inactive={true} matchColor={'border-red-600'}/>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold min-w-fit">3.</span>
            <span>Making a wrong match gives you a strike. 3 strikes and you lose</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold min-w-fit">4.</span>
            <span>Match all the pairs, but keep in mind. Some characters could form more than one word! Click matched tiles again to unpair them</span>
          </div>
        </div>
        <button
          onClick={onStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Start!
        </button>
      </div>
    </div>
  );
}
