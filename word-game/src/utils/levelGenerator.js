// src/utils/levelGenerator.js
import WORD_LIST from '../data/wordlist'; // Keep the existing import
import { GRID_SIZE_MAX } from '../config/gameConfig'; // Import GRID_SIZE_MAX

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
  console.log(`[getRandomWord] Seeking word: min=${minLength}, max=${maxLength}, used=${usedWords.size}`); // Log 1

  const filteredWords = WORD_LIST.filter(w =>
    w.length >= minLength &&
    w.length <= maxLength &&
    !usedWords.has(w.toUpperCase()) // Check for uppercase in usedWords
  );

  if (filteredWords.length === 0) {
    console.warn(`[getRandomWord] No words found for length range ${minLength}-${maxLength} (used: ${usedWords.size} words out of ${WORD_LIST.length}).`); // Log 2
    return null; // Return early if no suitable words
  }

  const randomIndex = Math.floor(Math.random() * filteredWords.length);
  const selectedWord = filteredWords[randomIndex];
  console.log(`[getRandomWord] Found word: ${selectedWord}`); // Log 3
  return selectedWord;
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
 * @returns {{ grid: GridCell[][], letters: string[], answers: string[] }}
 */
function generateCrosswordGrid(wordsToPlace) {
  console.log("[generateCrosswordGrid] Attempting to generate grid for words:", wordsToPlace);
  if (!wordsToPlace || wordsToPlace.length === 0) {
    console.warn("[generateCrosswordGrid] No words provided to place. Returning empty grid.");
    return { grid: [], letters: [], answers: [] };
  }

  const GRID_SIZE = GRID_SIZE_MAX; // Use constant from config
  let grid = Array(GRID_SIZE).fill(null).map((_, rIdx) =>
    Array(GRID_SIZE).fill(null).map((_, cIdx) => new GridCell(null, `${rIdx}-${cIdx}`))
  );
  let placedWords = [];
  const answers = wordsToPlace.map(w => w.toUpperCase());

  const allLettersForWheel = wordsToPlace.flatMap(word => word.toUpperCase().split(''));
  console.log("[generateCrosswordGrid] All letters for wheel (from answers):", allLettersForWheel);

  wordsToPlace.sort((a, b) => b.length - a.length);

  const firstWord = wordsToPlace[0].toUpperCase();
  const orientation = Math.random() < 0.5 ? 'H' : 'V';

  let startRow, startCol;
  if (orientation === 'H') {
    startRow = Math.floor(GRID_SIZE / 2);
    startCol = Math.floor((GRID_SIZE - firstWord.length) / 2);
  } else {
    startCol = Math.floor(GRID_SIZE / 2);
    startRow = Math.floor((GRID_SIZE - firstWord.length) / 2);
  }

  console.log(`[generateCrosswordGrid] Placing first word '${firstWord}' (${orientation}) at (${startRow}, ${startCol})`);

  if (startRow >= 0 && startRow + (orientation === 'V' ? firstWord.length : 0) <= GRID_SIZE &&
      startCol >= 0 && startCol + (orientation === 'H' ? firstWord.length : 0) <= GRID_SIZE) {
    for (let i = 0; i < firstWord.length; i++) {
      const r = orientation === 'H' ? startRow : startRow + i;
      const c = orientation === 'H' ? startCol + i : startCol;
      grid[r][c].char = firstWord[i];
      grid[r][c].words.push({ word: firstWord, pos: i, orientation: orientation });
    }
    placedWords.push({ word: firstWord, row: startRow, col: startCol, orientation: orientation });
    console.log(`[generateCrosswordGrid] First word '${firstWord}' placed successfully.`);
  } else {
    console.warn(`[generateCrosswordGrid] Failed to place first word '${firstWord}' due to bounds check. startRow:${startRow}, startCol:${startCol}, len:${firstWord.length}, GRID_SIZE:${GRID_SIZE}`);
  }

  for (let k = 1; k < wordsToPlace.length; k++) {
    const currentWord = wordsToPlace[k].toUpperCase();
    let placed = false;

    for (let p of placedWords) {
      for (let i = 0; i < currentWord.length; i++) {
        for (let j = 0; j < p.word.length; j++) {
          if (currentWord[i] === p.word[j]) {
            if (p.orientation === 'H') {
              const newRow = p.row - i;
              const newCol = p.col + j;

              if (newRow >= 0 && newRow + currentWord.length <= GRID_SIZE &&
                  newCol >= 0 && newCol < GRID_SIZE) {
                let canPlace = true;
                for (let charIdx = 0; charIdx < currentWord.length; charIdx++) {
                  const r = newRow + charIdx;
                  const c = newCol;

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
                    const r = newRow + charIdx;
                    const c = newCol;
                    grid[r][c].char = currentWord[charIdx];
                    grid[r][c].words.push({ word: currentWord, pos: charIdx, orientation: 'V' });
                  }
                  placedWords.push({ word: currentWord, row: newRow, col: newCol, orientation: 'V' });
                  placed = true;
                  // console.log(`[generateCrosswordGrid] Placed '${currentWord}' vertically intersecting with '${p.word}'.`);
                  break;
                }
              }
            } else if (p.orientation === 'V') {
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
                  }
                  placedWords.push({ word: currentWord, row: newRow, col: newCol, orientation: 'H' });
                  placed = true;
                  // console.log(`[generateCrosswordGrid] Placed '${currentWord}' horizontally intersecting with '${p.word}'.`);
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

    if (!placed) {
      // console.log(`[generateCrosswordGrid] Could not place '${currentWord}' via intersection, trying linear placement.`);
      for (let r = 0; r < GRID_SIZE; r++) {
        let isRowClear = true;
        // Check for conflicts with existing words and ensure space for the word
        for (let c = 0; c < currentWord.length; c++) {
          // Check if within bounds and cell is empty or matches currentWord[c] if overlapping (though no overlap is preferred here)
          if (r >= GRID_SIZE || (c + currentWord.length > GRID_SIZE)) { // row or word extends beyond grid
              isRowClear = false;
              break;
          }
          if (grid[r][c].char !== null) {
              isRowClear = false;
              break;
          }
        }
        
        if (isRowClear && currentWord.length <= GRID_SIZE) {
          const newCol = Math.floor((GRID_SIZE - currentWord.length) / 2);
          for (let i = 0; i < currentWord.length; i++) {
            grid[r][newCol + i].char = currentWord[i];
            grid[r][newCol + i].words.push({ word: currentWord, pos: i, orientation: 'H' });
          }
          placedWords.push({ word: currentWord, row: r, col: newCol, orientation: 'H' });
          placed = true;
          // console.log(`[generateCrosswordGrid] Placed '${currentWord}' linearly in row ${r}.`);
          break;
        }
      }
    }
  }

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

  const padding = 1;

  const effectiveMinRow = Math.max(0, minRow - padding);
  const effectiveMaxRow = Math.min(GRID_SIZE - 1, maxRow + padding);
  const effectiveMinCol = Math.max(0, minCol - padding);
  const effectiveMaxCol = Math.min(GRID_SIZE - 1, maxCol + padding);

  let trimmedGrid = [];
  
  if (placedWords.length > 0 && effectiveMaxRow >= effectiveMinRow && effectiveMaxCol >= effectiveMinCol) {
    for (let r = effectiveMinRow; r <= effectiveMaxRow; r++) {
      trimmedGrid.push(grid[r].slice(effectiveMinCol, effectiveMaxCol + 1));
    }
    console.log(`[generateCrosswordGrid] Grid trimmed. New dimensions: ${trimmedGrid.length}x${trimmedGrid.length > 0 ? trimmedGrid[0].length : 0}.`);
  } else if (wordsToPlace.length > 0) {
    console.warn("[generateCrosswordGrid] Crossword trimming failed or no words placed robustly. Using minimal fallback grid for first word.");
    const firstWordForFallback = wordsToPlace[0].toUpperCase();
    
    const tempGridRows = Math.max(3, 1 + 2 * padding);
    const tempGridCols = Math.max(3, firstWordForFallback.length + 2 * padding);
    const tempGrid = Array(tempGridRows).fill(null).map((_, rIdx) => 
        Array(tempGridCols).fill(null).map((_, cIdx) => new GridCell(null, `${rIdx}-${cIdx}`))
    );

    const startRowForWord = Math.floor(tempGridRows / 2);
    const startColForWord = Math.floor((tempGridCols - firstWordForFallback.length) / 2);

    for (let i = 0; i < firstWordForFallback.length; i++) {
        const r = startRowForWord;
        const c = startColForWord + i;
        if (tempGrid[r] && tempGrid[r][c]) {
          tempGrid[r][c].char = firstWordForFallback[i];
          tempGrid[r][c].words.push({ word: firstWordForFallback, pos: i, orientation: 'H' });
        }
    }
    trimmedGrid = tempGrid;
    console.log(`[generateCrosswordGrid] Minimal fallback grid created. Dimensions: ${trimmedGrid.length}x${trimmedGrid[0].length}.`);
  } else {
    console.error("[generateCrosswordGrid] Reached unexpected empty wordsToPlace scenario, returning empty grid.");
    trimmedGrid = [];
  }

  console.log("[generateCrosswordGrid] Final grid dimensions:", trimmedGrid.length, trimmedGrid.length > 0 ? trimmedGrid[0].length : 0);
  console.log("[generateCrosswordGrid] Final answers:", answers);
  console.log("[generateCrosswordGrid] Final letters for wheel (shuffled):", shuffleArray(allLettersForWheel));

  return {
    grid: trimmedGrid,
    letters: shuffleArray(allLettersForWheel),
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
  console.log("--- generateGameLevels: Starting level generation for", numLevels, "levels ---");
  const levels = [];
  const usedWordsGlobal = new Set();
  const MAX_ATTEMPTS_PER_WORD_GENERATION = 100; // Define maximum attempts for word selection

  for (let i = 0; i < numLevels; i++) {
    console.log(`[generateGameLevels] Starting generation for level ${i + 1}`); // Log 9

    let candidateWordsForLevel = [];
    const numWordsPerLevel = Math.min(2 + Math.floor(i / 3), 5); // Example dynamic config
    let minWordLength = Math.min(3 + Math.floor(i / 2), 6); // Example dynamic config
    let maxWordLength = Math.min(minWordLength + 2, 8); // Example dynamic config

    console.log(`[generateGameLevels] Level ${i+1} config: numWords=${numWordsPerLevel}, minLength=${minWordLength}, maxLength=${maxWordLength}`); // Log config

    let wordGenerationAttempts = 0;
    while (candidateWordsForLevel.length < numWordsPerLevel && wordGenerationAttempts < MAX_ATTEMPTS_PER_WORD_GENERATION) {
      let currentWord = getRandomWord(minWordLength, maxWordLength, usedWordsGlobal);
      
      if (currentWord) {
        if (!candidateWordsForLevel.includes(currentWord.toUpperCase())) {
          candidateWordsForLevel.push(currentWord.toUpperCase());
          usedWordsGlobal.add(currentWord.toUpperCase()); // Log 5
          console.log(`[generateGameLevels] Word ${candidateWordsForLevel.length}/${numWordsPerLevel} found for Level ${i+1}: ${currentWord}`);
        }
      } else {
        wordGenerationAttempts++; // Log 6
        console.warn(`[generateGameLevels] Attempt ${wordGenerationAttempts} to find word for Level ${i+1} failed.`);
        // Try adjusting length range if struggling to find words
        if (wordGenerationAttempts % 10 === 0) {
          minWordLength = Math.max(3, minWordLength - 1);
          maxWordLength = Math.min(8, maxWordLength + 1);
          console.warn(`[generateGameLevels] Level ${i+1}: Adjusting word length range to ${minWordLength}-${maxWordLength} after multiple failures.`);
        }
      }
    }

    if (candidateWordsForLevel.length < numWordsPerLevel) { // Log 7
      console.error(`[generateGameLevels] Failed to generate enough unique words for level ${i + 1} after ${MAX_ATTEMPTS_PER_WORD_GENERATION} attempts.`);
      // Fallback to a fixed set of words if dynamic generation fails
      if (candidateWordsForLevel.length === 0) {
        console.warn(`[generateGameLevels] Using emergency fallback words for level ${i + 1} due to severe word generation failure.`);
        candidateWordsForLevel = ["HELP", "ME"]; // Emergency fallback words
      }
    } else {
      console.log(`[generateGameLevels] Successfully generated ${candidateWordsForLevel.length} words for level ${i + 1}.`); // Log 8
    }

    let levelData;
    // Use the dynamically generated words, or the emergency fallback if generation failed
    levelData = generateCrosswordGrid(candidateWordsForLevel);

    console.log(`[generateGameLevels] Level ${i+1}: Result of generateCrosswordGrid - Grid Length: ${levelData.grid.length}, Letters Length: ${levelData.letters.length}, Answers Length: ${levelData.answers.length}`); // Log 12

    if (levelData.grid.length > 0 && levelData.letters.length > 0 && levelData.answers.length > 0) {
      levels.push(levelData);
      console.log(`[generateGameLevels] Level ${i+1}: Level successfully added.`);
    } else {
      console.error(`FAILURE: [generateGameLevels] Level ${i+1} data is invalid after primary generation. Grid: ${levelData.grid.length > 0}, Letters: ${levelData.letters.length > 0}, Answers: ${levelData.answers.length > 0}. Activating emergency fallback.`); // Log 11
      
      const emergencyWords = ["WORD", "GAME"]; // More relevant emergency words
      const emergencyLetters = shuffleArray(emergencyWords.flatMap(w => w.split('')));

      const emergencyGridSize = 5;
      const emergencyGrid = Array(emergencyGridSize).fill(null).map((_, rIdx) => 
          Array(emergencyGridSize).fill(null).map((_, cIdx) => new GridCell(null, `${rIdx}-${cIdx}`))
      );

      // Place "WORD" horizontally
      const word1 = emergencyWords[0].toUpperCase();
      const startRow1 = Math.floor(emergencyGridSize / 2) - 1;
      const startCol1 = Math.floor((emergencyGridSize - word1.length) / 2);
      for (let charIdx = 0; charIdx < word1.length; charIdx++) {
        if (emergencyGrid[startRow1] && emergencyGrid[startRow1][startCol1 + charIdx]) {
          emergencyGrid[startRow1][startCol1 + charIdx].char = word1[charIdx];
          emergencyGrid[startRow1][startCol1 + charIdx].words.push({ word: word1, pos: charIdx, orientation: 'H' });
        }
      }

      // Place "GAME" horizontally below "WORD"
      const word2 = emergencyWords[1].toUpperCase();
      const startRow2 = Math.floor(emergencyGridSize / 2) + 1;
      const startCol2 = Math.floor((emergencyGridSize - word2.length) / 2);
      for (let charIdx = 0; charIdx < word2.length; charIdx++) {
        if (emergencyGrid[startRow2] && emergencyGrid[startRow2][startCol2 + charIdx]) {
            emergencyGrid[startRow2][startCol2 + charIdx].char = word2[charIdx];
            emergencyGrid[startRow2][startCol2 + charIdx].words.push({ word: word2, pos: charIdx, orientation: 'H' });
        }
      }
      
      levels.push({
        letters: emergencyLetters,
        answers: emergencyWords,
        grid: emergencyGrid
      });
      console.warn(`[generateGameLevels] Level ${i+1}: Emergency fallback level created with words "${emergencyWords.join(', ')}".`);
    }
  }
  console.log("--- generateGameLevels: Finished generating levels. Total levels:", levels.length, "---");
  return levels;
}