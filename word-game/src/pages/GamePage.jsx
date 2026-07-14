import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateGameLevels, shuffleArray } from '../utils/levelGenerator';
import Grid from '../components/game/Grid'; // Updated path
import LetterWheel from '../components/game/LetterWheel'; // Updated path
import GameHeader from '../components/game/GameHeader'; // New component
import FeedbackDisplay from '../components/game/FeedbackDisplay'; // New component
import GameControls from '../components/game/GameControls'; // New component
import confetti from 'canvas-confetti';
import { 
  NUMBER_OF_DYNAMIC_LEVELS, 
  HINT_COST, 
  WRONG_WORD_DURATION, 
  LEVEL_COMPLETE_DELAY, 
  COINS_PER_LETTER 
} from '../config/gameConfig'; // Import constants from config

/**
 * Main game page component responsible for game logic and layout.
 * @component
 */
function GamePage() {
  const { 
    currentLevel, 
    foundWords, 
    addFoundWord, 
    setLevel, 
    coins, 
    addCoins, 
    unlimitedHintsMode, // Get unlimitedHintsMode from store
    toggleUnlimitedHintsMode // Get toggle action from store
  } = useGameStore();

  // Initial level generation: Use lazy initializer for allLevels
  const [allLevels] = useState(() => {
    const generatedLevels = generateGameLevels(NUMBER_OF_DYNAMIC_LEVELS);
    console.log("GamePage: allLevels initialized with", generatedLevels.length, "levels.");
    return generatedLevels;
  });
  
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [currentSelection, setCurrentSelection] = useState([]); // Array of {letter: string, index: number}
  const [revealedCells, setRevealedCells] = useState({}); // { 'row-col': true } for hinted cells

  const wrongWordTimeoutRef = useRef(null);
  const infoMessageTimeoutRef = useRef(null);

  // Feedback states
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
  console.log(`GamePage: Current levelData for level ${currentLevel}:`, levelData);

  const handleWordComplete = useCallback((word) => {
    const uppercaseWord = word.toUpperCase();
    setCurrentSelection([]); // Clear selection after word attempt

    if (!levelData) return; // Defensive check

    if (levelData.answers.includes(uppercaseWord) && !foundWords.includes(uppercaseWord)) {
      addFoundWord(uppercaseWord);
      addCoins(uppercaseWord.length * COINS_PER_LETTER);

      const updatedFoundWords = [...foundWords, uppercaseWord];
      if (updatedFoundWords.length === levelData.answers.length) {
        confetti();
        setInfoMessage("Level Complete!");
        setTimeout(() => {
          if (currentLevel < allLevels.length - 1) {
            setLevel(prevLevel => prevLevel + 1);
          } else {
            setInfoMessage("Congratulations! You've finished all levels!");
            setTimeout(() => setLevel(0), LEVEL_COMPLETE_DELAY); // For now, restart to level 0
          }
          setInfoMessage('');
        }, LEVEL_COMPLETE_DELAY);
      }
    } else {
      clearTimeout(wrongWordTimeoutRef.current);
      if (foundWords.includes(uppercaseWord)) {
        setWrongWordFeedbackType('already-found');
      } else {
        setWrongWordFeedbackType('incorrect');
      }
      setShowWrongWord(true);
      wrongWordTimeoutRef.current = setTimeout(() => {
        setShowWrongWord(false);
        setWrongWordFeedbackType('');
      }, WRONG_WORD_DURATION);
    }
  }, [levelData, foundWords, addFoundWord, addCoins, currentLevel, allLevels.length, setLevel]);

  const handleLetterSelect = useCallback((selectedLetterObjects) => {
    setCurrentSelection(selectedLetterObjects);
  }, []);

  const shuffleLetters = useCallback(() => {
    if (levelData) {
      setShuffledLetters(shuffleArray(levelData.letters));
    }
  }, [levelData]);

  const getHintCell = useCallback(() => {
    if (!levelData?.grid) return null;

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
  }, [levelData, foundWords, revealedCells]);

  const revealHint = useCallback(() => {
    if (!unlimitedHintsMode && coins < HINT_COST) { // Check coins only if not in unlimited hints mode
      setInfoMessage("Not enough coins for a hint!");
      clearTimeout(infoMessageTimeoutRef.current);
      infoMessageTimeoutRef.current = setTimeout(() => setInfoMessage(''), WRONG_WORD_DURATION);
      return;
    }

    const hintCell = getHintCell();

    if (hintCell) {
      setRevealedCells(prev => ({ ...prev, [`${hintCell.id}`]: true }));
      if (!unlimitedHintsMode) { // Deduct coins only if not in unlimited hints mode
        addCoins(-HINT_COST);
      }
      setInfoMessage("Hint revealed!");
      clearTimeout(infoMessageTimeoutRef.current);
      infoMessageTimeoutRef.current = setTimeout(() => setInfoMessage(''), WRONG_WORD_DURATION);
    } else {
      setInfoMessage("No more hints available for unfound words on this level!");
      clearTimeout(infoMessageTimeoutRef.current);
      infoMessageTimeoutRef.current = setTimeout(() => setInfoMessage(''), WRONG_WORD_DURATION);
    }
  }, [coins, getHintCell, addCoins, unlimitedHintsMode]);

  if (!levelData || !levelData.grid || !levelData.letters || !levelData.answers) {
    console.error("GamePage: levelData is invalid or missing required properties.", {
      levelData: levelData,
      hasGrid: !!levelData?.grid,
      hasLetters: !!levelData?.letters,
      hasAnswers: !!levelData?.answers,
      gridLength: levelData?.grid?.length,
      lettersLength: levelData?.letters?.length,
      answersLength: levelData?.answers?.length
    });
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 text-white flex flex-col items-center justify-center text-xl font-bold">
        Loading levels or generating data...
      </div>
    );
  }

  const mergedFoundStatus = { foundWords, revealedCells };

  // Determine feedback message for FeedbackDisplay
  let feedbackMessage = '';
  let feedbackColorClass = '';

  if (infoMessage) {
    feedbackMessage = infoMessage;
    feedbackColorClass = 'text-green-400';
  } else if (showWrongWord) {
    if (wrongWordFeedbackType === 'incorrect') {
      feedbackMessage = 'Invalid Word!';
      feedbackColorClass = 'text-red-400';
    } else if (wrongWordFeedbackType === 'already-found') {
      feedbackMessage = 'Already Found!';
      feedbackColorClass = 'text-yellow-400';
    }
  }

  return (
    <>
      <GameHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center p-3 sm:p-5 md:p-6 lg:p-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full justify-items-center">
          {/* Left Column: Game Board */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/10 w-full max-w-md sm:max-w-lg lg:max-w-xl mb-4 lg:mb-0">
            <Grid grid={levelData.grid} foundStatus={mergedFoundStatus} />
          </div>

          {/* Right Column: Feedback, Letter Wheel, and Controls */}
          <div className="flex flex-col items-center justify-center w-full">
            <FeedbackDisplay 
              message={feedbackMessage} 
              colorClass={feedbackColorClass} 
              currentSelectionLetters={currentSelection.map(s => s.letter)} 
            />
            
            <LetterWheel 
              letters={shuffledLetters} 
              onWordComplete={handleWordComplete} 
              onLetterSelect={handleLetterSelect}
            />

            <GameControls 
              onShuffleLetters={shuffleLetters} 
              onRevealHint={revealHint} 
            />

            {/* Temporary button to toggle unlimited hints mode for testing */}
            <button
              onClick={toggleUnlimitedHintsMode}
              className="mt-4 px-4 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-all active:scale-95 text-xs text-white font-semibold"
            >
              Toggle Unlimited Hints ({unlimitedHintsMode ? 'ON' : 'OFF'})
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default GamePage;