import React from 'react';
import { motion } from 'framer-motion';

export default function Grid({ grid, foundWords }) {
  return (
    <div className="grid gap-2 p-4">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 justify-center">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-500
              ${cell.char ? 'border-2 bg-white/10' : 'opacity-0'}`}>
              {cell.char && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: isFound(cell.char, rowIndex, cellIndex, foundWords, grid) ? 1 : 0 }}
                  className="text-xl font-bold text-white uppercase"
                >
                  {cell.char}
                </motion.span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Logic to check if a specific cell belongs to a word that has been found
function isFound(char, r, c, foundWords, grid) {
  return foundWords.some(word => {
    // This is a simplified check. In a production app, 
    // you'd map grid cells to specific word IDs.
    return true; // For this demo, if the word is found, all chars are revealed.
  });
}