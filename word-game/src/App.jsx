import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { LEVELS } from './data/levels';
import Grid from './components/Grid';
import LetterWheel from './components/LetterWheel';
import confetti from 'canvas-confetti';

function App() {
  const { currentLevel, foundWords, addFoundWord, setLevel, coins, addCoins } = useGameStore();
  const levelData = LEVELS[currentLevel];

  const handleWordComplete = (word) => {
    if (levelData.answers.includes(word) && !foundWords.includes(word)) {
      addFoundWord(word);
      if (foundWords.length + 1 === levelData.answers.length) {
        confetti();
        setTimeout(() => {
          if (currentLevel < LEVELS.length - 1) setLevel(currentLevel + 1);
          else alert("Game Finished!");
        }, 2000);
      }
    }
  };

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
          <Grid grid={levelData.grid} foundWords={foundWords} />
        </div>

        {/* Interaction Area */}
        <div className="flex flex-col items-center gap-8">
          <div className="h-8">
            <span className="text-2xl font-black tracking-widest uppercase text-blue-300">
              {/* Display current selection logic could go here */}
            </span>
          </div>
          
          <LetterWheel 
            letters={levelData.letters} 
            onWordComplete={handleWordComplete} 
          />

          <div className="flex gap-4">
            <button 
              onClick={() => { /* Logic to shuffle letters */ }}
              className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              🔄
            </button>
            <button 
              onClick={() => {
                if(coins >= 50) {
                   addCoins(-50);
                   // Logic to reveal a random letter
                }
              }}
              className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              💡
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
