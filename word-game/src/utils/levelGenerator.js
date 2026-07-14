// src/utils/levelGenerator.js
import WORD_LIST from '../data/wordlist';

// Helper to shuffle an array (Fisher-Yates algorithm)
export function shuffleArray(array) { // Exported for use in App.jsx
  const shuffled = [...array]; // Create a shallow copy to avoid modifying original array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gets a random word from the WORD_LIST within specified length constraints.
 * @param {number} minLength - Minimum length of the word.
 * @param {number} maxLength - Maximum length of the word.
 * @param {Set<string>} [usedWords=new Set()] - Set of words already used to ensure uniqueness.
 * @returns {string|null} A random word, or null if no suitable word is found.
 */
export function getRandomWord(minLength, maxLength, usedWords = new Set()) {
  const filteredWords = WORD_LIST.filter(w =>
    w.length >= minLength &&
    w.length <= maxLength &&
    !usedWords.has(w.toUpperCase()) // Check for uppercase in usedWords
  );

  if (filteredWords.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * filteredWords.length);
  return filteredWords[randomIndex];
}

// --- NEW/MODIFIED FUNCTIONS FOR CROSSWORD GENERATION ---

// Represents a cell in the grid
class GridCell {
  constructor(char = null, id = null) {
    this.char = char;
    this.words = []; // Array of { word: string, pos: number, orientation: 'H' | 'V' }
    this.id = id; // Assign ID during construction for easier tracking
  }
}

/**
 * Attempts to place words into a crossword-like grid.
 * This is a simplified placement algorithm, not a robust crossword generator.
 * It prioritizes placing words horizontally and then attempts to cross them.
 *
 * @param {string[]} wordsToPlace - An array of words to include in the level.
 * @returns {{ grid: GridCell[][], allLetters: string[], answers: string[] }}
 */
function generateCrosswordGrid(wordsToPlace) {
  if (!wordsToPlace || wordsToPlace.length === 0) {
    return { grid: [], allLetters: [], answers: [] };
  }

  const GRID_SIZE = 15; // Max grid size (can be adjusted)
  // Initialize grid with IDs
  let grid = Array(GRID_SIZE).fill(null).map((_, rIdx) =>
    Array(GRID_SIZE).fill(null).map((_, cIdx) => new GridCell(null, `${rIdx}-${cIdx}`))
  );
  let placedWords = [];
  let allLettersSet = new Set();
  const answers = wordsToPlace.map(w => w.toUpperCase());

  // Sort words by length (longest first) to improve chances of intersection
  wordsToPlace.sort((a, b) => b.length - a.length);

  // Determine if the first word should be horizontal or vertical
  const firstWord = wordsToPlace[0].toUpperCase();
  const orientation = Math.random() < 0.5 ? 'H' : 'V'; // Randomly choose initial orientation

  let startRow, startCol;
  if (orientation === 'H') {
    startRow = Math.floor(GRID_SIZE / 2);
    startCol = Math.floor((GRID_SIZE - firstWord.length) / 2);
  } else {
    startCol = Math.floor(GRID_SIZE / 2);
    startRow = Math.floor((GRID_SIZE - firstWord.length) / 2);
  }

  if (startRow >= 0 && startRow + (orientation === 'V' ? firstWord.length : 0) <= GRID_SIZE &&
      startCol >= 0 && startCol + (orientation === 'H' ? firstWord.length : 0) <= GRID_SIZE) {
    for (let i = 0; i < firstWord.length; i++) {
      const r = orientation === 'H' ? startRow : startRow + i;
      const c = orientation === 'H' ? startCol + i : startCol;
      grid[r][c].char = firstWord[i];
      grid[r][c].words.push({ word: firstWord, pos: i, orientation: orientation });
      allLettersSet.add(firstWord[i]);
    }
    placedWords.push({ word: firstWord, row: startRow, col: startCol, orientation: orientation });
  }

  // Attempt to place remaining words
  for (let k = 1; k < wordsToPlace.length; k++) {
    const currentWord = wordsToPlace[k].toUpperCase();
    let placed = false;

    // Try to find an intersection with already placed words
    for (let p of placedWords) {
      for (let i = 0; i < currentWord.length; i++) { // currentWord char index
        for (let j = 0; j < p.word.length; j++) { // placed word char index
          if (currentWord[i] === p.word[j]) {
            // Found a common letter, try to place vertically or horizontally
            if (p.orientation === 'H') { // If the placed word is horizontal, try to cross current word vertically
              const newRow = p.row - i;
              const newCol = p.col + j;

              if (newRow >= 0 && newRow + currentWord.length <= GRID_SIZE &&
                  newCol >= 0 && newCol < GRID_SIZE) {
                let canPlace = true;
                // Check if path is clear and doesn't conflict with other words (except at the intersection)
                for (let charIdx = 0; charIdx < currentWord.length; charIdx++) {
                  const r = newRow + charIdx;
                  const c = newCol;

                  if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) { // Out of bounds
                    canPlace = false;
                    break;
                  }

                  const targetCell = grid[r][c];
                  if (charIdx === i) { // Intersection point
                    if (targetCell.char !== null && targetCell.char !== currentWord[charIdx]) {
                      canPlace = false; // Conflict at intersection
                      break;
                    }
                  } else { // Non-intersection point
                    if (targetCell.char !== null) {
                      canPlace = false; // Conflict with existing char
                      break;
                    }
                  }
                }

                if (canPlace) {
                  for (let charIdx = 0; charIdx < currentWord.length; charIdx++) {
                    const r = newRow + charIdx;
                    const c = newCol;
                    grid[r][c].char = currentWord[charIdx];
                    grid[r][c].words.push({ word: currentWord, pos: charIdx, orientation: 'V' });
                    allLettersSet.add(currentWord[charIdx]);
                  }
                  placedWords.push({ word: currentWord, row: newRow, col: newCol, orientation: 'V' });
                  placed = true;
                  break; // Move to next word
                }
              }
            } else if (p.orientation === 'V') { // If the placed word is vertical, try to cross current word horizontally
              const newRow = p.row + j;
              const newCol = p.col - i;

              if (newRow >= 0 && newRow < GRID_SIZE &&
                  newCol >= 0 && newCol + currentWord.length <= GRID_SIZE) {
                let canPlace = true;
                for (let charIdx = 0; charIdx < currentWord.length; charIdx++) {
                  const r = newRow;
                  const c = newCol + charIdx;

                  if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
                    canPlace = false;
                    break;
                  }

                  const targetCell = grid[r][c];
                  if (charIdx === i) {
                    if (targetCell.char !== null && targetCell.char !== currentWord[charIdx]) {
                      canPlace = false;
                      break;
                    }
                  } else {
                    if (targetCell.char !== null) {
                      canPlace = false;
                      break;
                    }
                  }
                }

                if (canPlace) {
                  for (let charIdx = 0; charIdx < currentWord.length; charIdx++) {
                    const r = newRow;
                    const c = newCol + charIdx;
                    grid[r][c].char = currentWord[charIdx];
                    grid[r][c].words.push({ word: currentWord, pos: charIdx, orientation: 'H' });
                    allLettersSet.add(currentWord[charIdx]);
                  }
                  placedWords.push({ word: currentWord, row: newRow, col: newCol, orientation: 'H' });
                  placed = true;
                  break;
                }
              }
            }
          }
        }
        if (placed) break;
      }
      if (placed) break;
    }

    // If word couldn't be placed by crossing, place it horizontally in the next available "empty" row
    if (!placed) {
      for (let r = 0; r < GRID_SIZE; r++) {
        let isRowClear = true;
        for (let c = 0; c < currentWord.length; c++) { // Check if enough space in this row
          if (grid[r][c].char !== null) {
            isRowClear = false;
            break;
          }
        }
        if (isRowClear && currentWord.length <= GRID_SIZE) {
          const newCol = Math.floor((GRID_SIZE - currentWord.length) / 2); // Center it
          for (let i = 0; i < currentWord.length; i++) {
            grid[r][newCol + i].char = currentWord[i];
            grid[r][newCol + i].words.push({ word: currentWord, pos: i, orientation: 'H' });
            allLettersSet.add(currentWord[i]);
          }
          placedWords.push({ word: currentWord, row: r, col: newCol, orientation: 'H' });
          placed = true;
          break;
        }
      }
    }
  }

  // Trim grid to actual used size
  let minRow = GRID_SIZE, maxRow = -1, minCol = GRID_SIZE, maxCol = -1;
  grid.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      if (cell.char !== null) {
        minRow = Math.min(minRow, rIdx);
        maxRow = Math.max(maxRow, rIdx);
        minCol = Math.min(minCol, cIdx);
        maxCol = Math.max(maxCol, cIdx);
      }
    });
  });

  // Pad the bounds slightly to ensure some empty space around the grid,
  // making it visually appealing and preventing words from being cut off at the edge.
  const padding = 1;
  minRow = Math.max(0, minRow - padding);
  maxRow = Math.min(GRID_SIZE - 1, maxRow + padding);
  minCol = Math.max(0, minCol - padding);
  maxCol = Math.min(GRID_SIZE - 1, maxCol + padding);

  let trimmedGrid = [];
  if (maxRow >= minRow && maxCol >= minCol) {
    for (let r = minRow; r <= maxRow; r++) {
      trimmedGrid.push(grid[r].slice(minCol, maxCol + 1));
    }
  } else {
    // Fallback: If no words were successfully placed, return a minimal grid
    // with at least one word, or an empty grid if even that fails.
    if (placedWords.length > 0) {
      // Create a small grid to contain at least the first placed word
      const pWord = placedWords[0];
      const startR = Math.max(0, pWord.row - padding);
      const endR = Math.min(GRID_SIZE - 1, pWord.row + (pWord.orientation === 'V' ? pWord.word.length : 1) - 1 + padding);
      const startC = Math.max(0, pWord.col - padding);
      const endC = Math.min(GRID_SIZE - 1, pWord.col + (pWord.orientation === 'H' ? pWord.word.length : 1) - 1 + padding);
      
      for (let r = startR; r <= endR; r++) {
        trimmedGrid.push(grid[r].slice(startC, endC + 1));
      }

      if (trimmedGrid.length === 0) { // Fallback if padding causes an empty grid
        trimmedGrid = [[new GridCell(pWord.word[0], '0-0')]];
      }
    } else {
      trimmedGrid = []; // Truly empty if no words and no fallback possible
    }
  }

  // IDs are already assigned during GridCell construction, no need to re-map.

  return {
    grid: trimmedGrid,
    letters: shuffleArray(Array.from(allLettersSet)),
    answers: answers
  };
}

/**
 * Generates an array of game levels dynamically from the WORD_LIST.
 * Each level will feature multiple words arranged in a crossword-like grid.
 * Words are chosen to progressively increase in length and quantity.
 * @param {number} numLevels - The total number of levels to generate.
 * @returns {Array<object>} An array of generated level data objects.
 */
export function generateGameLevels(numLevels) {
  const levels = [];
  const usedWordsGlobal = new Set(); // Keep track of words used across all levels

  for (let i = 0; i < numLevels; i++) {
    let candidateWordsForLevel = [];
    // Adjust number of words and length based on level for progressive difficulty
    const numWordsPerLevel = Math.min(2 + Math.floor(i / 3), 5); // Start with 2 words, max 5
    
    let minWordLength = Math.min(3 + Math.floor(i / 2), 6); // Start at 3, max 6
    let maxWordLength = Math.min(minWordLength + 2, 8); // Allow words up to 2 chars longer, max 8

    let attempts = 0;
    while (candidateWordsForLevel.length < numWordsPerLevel && attempts < 100) {
      const word = getRandomWord(minWordLength, maxWordLength, usedWordsGlobal);
      if (word && !candidateWordsForLevel.includes(word.toUpperCase())) {
        candidateWordsForLevel.push(word.toUpperCase());
        usedWordsGlobal.add(word.toUpperCase());
      }
      attempts++;
      // Try slightly different length ranges if struggling to find words
      if (attempts % 20 === 0) {
        minWordLength = Math.max(3, minWordLength - 1);
        maxWordLength = Math.min(8, maxWordLength + 1);
      }
    }

    if (candidateWordsForLevel.length > 0) {
      const levelData = generateCrosswordGrid(candidateWordsForLevel);
      if (levelData.grid.length > 0 && levelData.letters.length > 0) { // Ensure a non-empty grid and letters were generated
        levels.push(levelData);
      } else {
        console.warn(`Could not generate a valid grid for level ${i + 1} with words: ${candidateWordsForLevel.join(', ')}. Using a fallback.`);
        levels.push(generateCrosswordGrid(["FALLBACK", "WORD"])); // Generic fallback words
      }
    } else {
      console.warn(`Could not find enough unique words for level ${i + 1}. Using fallback words.`);
      levels.push(generateCrosswordGrid(["FALLBACK", "ONE"])); // Generic fallback words
    }
  }
  return levels;
}