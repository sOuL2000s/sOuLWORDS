import React, { useEffect, useState, useCallback, useRef } from 'react'; // Added useRef
import { useGameStore } from './store/gameStore';
import { generateGameLevels, shuffleArray } from './utils/levelGenerator'; // Import shuffleArray
import Grid from './components/Grid';
import LetterWheel from './components/LetterWheel';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion'; // Added motion import for feedback

// Define constants for magic numbers
const NUMBER_OF_DYNAMIC_LEVELS = 10;
const HINT_COST = 50;
const WRONG_WORD_DURATION = 1500; // milliseconds
const LEVEL_COMPLETE_DELAY = 2000; // milliseconds
const COINS_PER_LETTER = 5;

function App() {
  const { currentLevel, foundWords, addFoundWord, setLevel, coins, addCoins } = useGameStore();

  // 2. Initial level generation: Use lazy initializer for allLevels
  const [allLevels] = useState(() => generateGameLevels(NUMBER_OF_DYNAMIC_LEVELS));
  
  const [shuffledLetters, setShuffledLetters] = useState([]); // State for shuffled letters in the wheel
  const [currentSelection, setCurrentSelection] = useState([]); // Array of {letter: string, index: number}
  const [revealedCells, setRevealedCells] = useState({}); // { 'row-col': true } for hinted cells

  // 6. Wrong-word timeout: Using useRef for timeout management
  const wrongWordTimeoutRef = useRef(null);
  const infoMessageTimeoutRef = useRef(null);

  // 5 & 15. Feedback states
  const [showWrongWord, setShowWrongWord] = useState(false);
  const [wrongWordFeedbackType, setWrongWordFeedbackType] = useState(''); // 'incorrect', 'already-found'
  const [infoMessage, setInfoMessage] = useState(''); // General messages like "Not enough coins!", "Level Complete!"


  // Update shuffled letters and reset selection when level changes
  useEffect(() => {
    if (allLevels[currentLevel]) {
      setShuffledLetters(shuffleArray(allLevels[currentLevel].letters));
      setCurrentSelection([]);
      setRevealedCells({}); // Reset revealed cells for new level
    }
    // Clean up any lingering messages/timeouts when level changes
    clearTimeout(wrongWordTimeoutRef.current);
    clearTimeout(infoMessageTimeoutRef.current);
    setShowWrongWord(false);
    setWrongWordFeedbackType('');
    setInfoMessage('');
  }, [currentLevel, allLevels]);

  const levelData = allLevels[currentLevel];

  const handleWordComplete = (word) => {
    const uppercaseWord = word.toUpperCase();
    setCurrentSelection([]); // Clear selection after word attempt

    if (levelData.answers.includes(uppercaseWord) && !foundWords.includes(uppercaseWord)) {
      addFoundWord(uppercaseWord);
      addCoins(uppercaseWord.length * COINS_PER_LETTER); // Reward coins for finding a word

      const updatedFoundWords = [...foundWords, uppercaseWord]; // Use the updated list
      // Check for level completion
      if (updatedFoundWords.length === levelData.answers.length) {
        confetti();
        setInfoMessage("Level Complete!"); // Show success message
        setTimeout(() => {
          if (currentLevel < allLevels.length - 1) {
            setLevel(prevLevel => prevLevel + 1); // Use functional update
          } else {
            setInfoMessage("Congratulations! You've finished all levels!"); // Show final message
            setTimeout(() => setLevel(0), LEVEL_COMPLETE_DELAY); // For now, restart to level 0 after message
          }
          setInfoMessage(''); // Clear info message after transition
        }, LEVEL_COMPLETE_DELAY);
      }
    } else {
      clearTimeout(wrongWordTimeoutRef.current); // Clear previous timeout
      if (foundWords.includes(uppercaseWord)) {
        setWrongWordFeedbackType('already-found');
      } else {
        setWrongWordFeedbackType('incorrect');
      }
      setShowWrongWord(true);
      wrongWordTimeoutRef.current = setTimeout(() => { // Assign new timeout
        setShowWrongWord(false);
        setWrongWordFeedbackType('');
      }, WRONG_WORD_DURATION);
      // console.log("Incorrect word or already found:", uppercaseWord); // Removed console log
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

  // 4 & 8. Extracted hint-finding logic and used flat()
  const getHintCell = useCallback(() => {
    if (!levelData?.grid) return null; // 9. Loading state check

    const allCells = levelData.grid.flat();
    for (const cell of allCells) {
      if (cell.char && cell.words.length > 0) {
        const isPartOfUnfoundWord = cell.words.some(wordInfo => !foundWords.includes(wordInfo.word));
        const isCellExplicitlyRevealed = revealedCells[`${cell.id}`];

        if (isPartOfUnfoundWord && !isCellExplicitlyRevealed) {
          return cell;
        }
      }
    }
    return null;
  }, [levelData, foundWords, revealedCells]); // Dependencies for useCallback

  const revealHint = () => {
    if (coins < HINT_COST) { // 10. Using constant
      setInfoMessage("Not enough coins for a hint!"); // 5. Replacing alert
      clearTimeout(infoMessageTimeoutRef.current);
      infoMessageTimeoutRef.current = setTimeout(() => setInfoMessage(''), WRONG_WORD_DURATION); // Reuse duration for simplicity
      return;
    }

    const hintCell = getHintCell();

    if (hintCell) {
      setRevealedCells(prev => ({ ...prev, [`${hintCell.id}`]: true }));
      addCoins(-HINT_COST);
      setInfoMessage("Hint revealed!"); // Optional: brief feedback
      clearTimeout(infoMessageTimeoutRef.current);
      infoMessageTimeoutRef.current = setTimeout(() => setInfoMessage(''), WRONG_WORD_DURATION);
    } else {
      setInfoMessage("No more hints available for unfound words on this level!"); // 5. Replacing alert
      clearTimeout(infoMessageTimeoutRef.current);
      infoMessageTimeoutRef.current = setTimeout(() => setInfoMessage(''), WRONG_WORD_DURATION);
    }
  };

  // 9. Loading state with more robust checks
  if (!levelData || !levelData.grid || !levelData.letters || !levelData.answers) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center text-xl font-bold">
        Loading levels or generating data...
      </div>
    );
  }

  // Combine foundWords with explicitly revealed cells for Grid component
  const mergedFoundStatus = { foundWords, revealedCells };

  // Determine feedback message
  let feedbackMessage = '';
  let feedbackColorClass = '';

  if (infoMessage) {
    feedbackMessage = infoMessage;
    feedbackColorClass = 'text-green-400'; // For general info messages
  } else if (showWrongWord) {
    if (wrongWordFeedbackType === 'incorrect') {
      feedbackMessage = 'Invalid Word!';
      feedbackColorClass = 'text-red-400';
    } else if (wrongWordFeedbackType === 'already-found') {
      feedbackMessage = 'Already Found!';
      feedbackColorClass = 'text-yellow-400';
    }
  } else {
    feedbackMessage = currentSelection.map(s => s.letter).join('');
    feedbackColorClass = 'text-blue-300';
  }


  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-900 to-indigo-900 text-white flex flex-col items-center relative overflow-hidden">
      {/* 18. Desktop Background: Subtle gradient blobs for visual interest */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob lg:w-96 lg:h-96"></div>
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 lg:w-96 lg:h-96"></div>
      <div className="absolute bottom-1/4 left-1/2 w-48 h-48 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 lg:w-96 lg:h-96"></div>
      
      <header className="w-full p-3 sm:p-4 md:p-5 flex justify-between items-center max-w-5xl mx-auto z-10">
        <div className="bg-black/30 px-4 py-1 rounded-full">
          <span className="text-sm sm:text-base md:text-lg font-semibold">LEVEL {currentLevel + 1}</span>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 px-3 py-1 rounded-full">
          <span className="text-yellow-400 font-bold text-sm sm:text-base md:text-lg">🪙 {coins}</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center p-3 sm:p-5 md:p-6 lg:p-8 z-10">
        {/* 2 & 20. Change layout on desktop to use CSS Grid for two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full justify-items-center">
          {/* Left Column: Game Board */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/10 w-full max-w-md sm:max-w-lg lg:max-w-xl mb-4 lg:mb-0">
            <Grid grid={levelData.grid} foundStatus={mergedFoundStatus} />
          </div>

          {/* Right Column: Feedback, Letter Wheel, and Controls */}
          <div className="flex flex-col items-center justify-center w-full">
            {/* Display current selection / feedback */}
            <div className="h-10 mb-8 flex items-center justify-center min-h-[40px] max-w-md text-center mx-auto">
              <motion.span
                key={feedbackMessage} // Key ensures re-animation on message change
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-widest uppercase ${feedbackColorClass}`}
              >
                {feedbackMessage}
              </motion.span>
            </div>
            
            <LetterWheel 
              letters={shuffledLetters} 
              onWordComplete={handleWordComplete} 
              onLetterSelect={handleLetterSelect} // Pass handler for current selection
            />

            <div className="flex justify-center gap-4 mt-8 flex-wrap">
              <button 
                onClick={shuffleLetters} // Use the new shuffleLetters function
                className="px-5 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95 text-sm sm:text-base lg:text-lg font-semibold"
              >
                🔄 Shuffle
              </button>
              <button 
                onClick={revealHint} // Use the new revealHint function
                className="px-5 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95 text-sm sm:text-base lg:text-lg font-semibold"
              >
                💡 Hint ({HINT_COST}🪙)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
