import React, { useEffect, useState, useCallback } from 'react';
import { useGameStore } from './store/gameStore';
import { generateGameLevels, shuffleArray } from './utils/levelGenerator'; // Import shuffleArray
import Grid from './components/Grid';
import LetterWheel from './components/LetterWheel';
import confetti from 'canvas-confetti';

// Define the number of levels to generate
const NUMBER_OF_DYNAMIC_LEVELS = 10;

function App() {
  const { currentLevel, foundWords, addFoundWord, setLevel, coins, addCoins } = useGameStore();
  const [allLevels, setAllLevels] = useState([]); // State to hold dynamically generated levels
  const [shuffledLetters, setShuffledLetters] = useState([]); // State for shuffled letters in the wheel
  const [currentSelection, setCurrentSelection] = useState([]); // Array of {letter: string, index: number}
  const [revealedCells, setRevealedCells] = useState({}); // { 'row-col': true } for hinted cells

  // Generate levels once on component mount
  useEffect(() => {
    const generated = generateGameLevels(NUMBER_OF_DYNAMIC_LEVELS);
    setAllLevels(generated);
    if (generated[currentLevel]) {
      setShuffledLetters(shuffleArray(generated[currentLevel].letters));
    }
  }, []);

  // Update shuffled letters and reset selection when level changes
  useEffect(() => {
    if (allLevels[currentLevel]) {
      setShuffledLetters(shuffleArray(allLevels[currentLevel].letters));
      setCurrentSelection([]);
      setRevealedCells({}); // Reset revealed cells for new level
    }
  }, [currentLevel, allLevels]);

  const levelData = allLevels[currentLevel];

  const handleWordComplete = (word) => {
    const uppercaseWord = word.toUpperCase();
    setCurrentSelection([]); // Clear selection after word attempt

    if (levelData.answers.includes(uppercaseWord) && !foundWords.includes(uppercaseWord)) {
      addFoundWord(uppercaseWord);
      addCoins(uppercaseWord.length * 5); // Reward coins for finding a word

      // Check for level completion
      if (foundWords.length + 1 === levelData.answers.length) {
        confetti();
        setTimeout(() => {
          if (currentLevel < allLevels.length - 1) {
            setLevel(currentLevel + 1);
          } else {
            alert("Congratulations! You've finished all levels!");
            // Optionally, restart game or show final score
            setLevel(0); // For now, restart to level 0
          }
        }, 2000);
      }
    } else {
      // Optional: Add feedback for incorrect word
      console.log("Incorrect word or already found:", uppercaseWord);
    }
  };

  const handleLetterSelect = useCallback((selectedLetterObjects) => {
    setCurrentSelection(selectedLetterObjects);
  }, []);

  const shuffleLetters = () => {
    if (levelData) {
      setShuffledLetters(shuffleArray(levelData.letters));
    }
  };

  const revealHint = () => {
    const HINT_COST = 50;
    if (coins < HINT_COST) {
      alert("Not enough coins for a hint!");
      return;
    }

    // Find an unrevealed letter in an unfound word on the grid
    let hintFound = false;
    for (const row of levelData.grid) {
      for (const cell of row) {
        if (cell.char && cell.words.length > 0) {
          // Check if any word associated with this cell is NOT yet found
          const isPartOfUnfoundWord = cell.words.some(wordInfo => !foundWords.includes(wordInfo.word));
          
          // Check if this specific cell has not been explicitly revealed by a hint
          const isCellExplicitlyRevealed = revealedCells[`${cell.id}`];

          if (isPartOfUnfoundWord && !isCellExplicitlyRevealed) {
            setRevealedCells(prev => ({ ...prev, [`${cell.id}`]: true }));
            addCoins(-HINT_COST);
            hintFound = true;
            break;
          }
        }
      }
      if (hintFound) break;
    }

    if (!hintFound) {
      alert("No more hints available for unfound words on this level!");
    }
  };

  if (!levelData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center text-xl font-bold">
        Loading levels...
      </div>
    );
  }

  // Combine foundWords with explicitly revealed cells for Grid component
  const mergedFoundStatus = { foundWords, revealedCells };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 text-white flex flex-col items-center">
      <header className="w-full p-4 flex justify-between items-center max-w-md">
        <div className="bg-black/30 px-4 py-1 rounded-full">
          <span className="text-sm font-semibold">LEVEL {currentLevel + 1}</span>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 px-3 py-1 rounded-full">
          <span className="text-yellow-400 font-bold">🪙 {coins}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-around w-full max-w-md pb-12">
        {/* Game Board */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 min-w-[300px] shadow-2xl border border-white/10">
          <Grid grid={levelData.grid} foundStatus={mergedFoundStatus} />
        </div>

        {/* Display current selection */}
        <div className="h-8">
          <span className="text-2xl font-black tracking-widest uppercase text-blue-300">
            {currentSelection.map(s => s.letter).join('')}
          </span>
        </div>
        
        <LetterWheel 
          letters={shuffledLetters} 
          onWordComplete={handleWordComplete} 
          onLetterSelect={handleLetterSelect} // Pass handler for current selection
        />

        <div className="flex gap-4">
          <button 
            onClick={shuffleLetters} // Use the new shuffleLetters function
            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            🔄 Shuffle
          </button>
          <button 
            onClick={revealHint} // Use the new revealHint function
            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            💡 Hint (50🪙)
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
