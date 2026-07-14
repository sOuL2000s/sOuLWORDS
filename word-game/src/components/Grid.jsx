import React from 'react';
import { motion } from 'framer-motion';

export default function Grid({ grid, foundStatus }) { // Changed prop name
  const { foundWords, revealedCells } = foundStatus; // Destructure foundStatus

  return (
    <div className="grid gap-1 sm:gap-2 p-2 sm:p-4">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 sm:gap-2 justify-center">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded transition-all duration-500
              ${cell.char ? 'border-2 bg-white/10' : 'opacity-0'}`}>
              {cell.char && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: isCellRevealed(cell, foundWords, revealedCells) ? 1 : 0 }} // Use new function
                  className="text-lg sm:text-xl md:text-2xl font-bold text-white uppercase"
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

// Logic to check if a specific cell belongs to a word that has been found or is explicitly revealed by a hint
function isCellRevealed(cell, foundWords, revealedCells) {
  if (!cell.char || !cell.words) return false;

  // Check if any of the words this cell belongs to are in the foundWords list
  const partOfFoundWord = cell.words.some(wordInfo =>
    foundWords.includes(wordInfo.word)
  );

  // Check if this specific cell has been explicitly revealed by a hint
  const isExplicitlyRevealed = revealedCells[`${cell.id}`]; // Check using the cell's unique ID

  return partOfFoundWord || isExplicitlyRevealed;
}