import React from 'react';
import { motion } from 'framer-motion';

/**
 * @typedef {object} WordInfo
 * @property {string} word
 * @property {number} pos
 * @property {'H' | 'V'} orientation
 */

/**
 * @typedef {object} GridCell
 * @property {string | null} char
 * @property {string} id
 * @property {WordInfo[]} words
 */

/**
 * @typedef {object} FoundStatus
 * @property {string[]} foundWords
 * @property {Record<string, boolean>} revealedCells - Map of cell IDs to boolean indicating if revealed by hint.
 */

/**
 * @typedef {object} GridProps
 * @property {GridCell[][]} grid - The 2D array representing the game grid.
 * @property {FoundStatus} foundStatus - Object containing found words and revealed hint cells.
 */

/**
 * Renders the crossword-style game grid.
 * @component
 * @param {GridProps} props
 */
export default function Grid({ grid, foundStatus }) {
  const { foundWords, revealedCells } = foundStatus;

  return (
    <div role="grid" aria-label="Word puzzle grid" className="grid gap-1 sm:gap-2 p-2 sm:p-4">
      {grid.map((row, rowIndex) => (
        <div role="row" key={rowIndex} className="flex gap-1 sm:gap-2 justify-center">
          {row.map((cell, cellIndex) => (
            <div
              role="gridcell"
              key={cellIndex}
              aria-label={cell.char ? `Letter ${cell.char}` : 'Empty cell'}
              className={`w-5 h-5 min-[400px]:w-7 min-[400px]:h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded transition-all duration-500
              ${cell.char ? 'border-[1px] sm:border-2 bg-white/10' : 'opacity-0'}`}
            >
              {cell.char && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: isCellRevealed(cell, foundWords, revealedCells) ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="text-[10px] min-[400px]:text-sm sm:text-xl md:text-2xl font-bold text-white uppercase"
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

/**
 * Determines if a grid cell's character should be revealed.
 * A cell is revealed if it's part of a found word or explicitly revealed by a hint.
 * @param {GridCell} cell - The cell object.
 * @param {string[]} foundWords - List of words already found.
 * @param {Record<string, boolean>} revealedCells - Map of cells revealed by hints.
 * @returns {boolean} True if the cell should be visible, false otherwise.
 */
function isCellRevealed(cell, foundWords, revealedCells) {
  if (!cell.char || !cell.words) return false;

  const partOfFoundWord = cell.words.some(wordInfo =>
    foundWords.includes(wordInfo.word)
  );

  const isExplicitlyRevealed = revealedCells[`${cell.id}`];

  return partOfFoundWord || isExplicitlyRevealed;
}
