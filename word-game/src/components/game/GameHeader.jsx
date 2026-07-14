import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Gem } from 'lucide-react'; // Import Gem icon

/**
 * Renders the game header displaying current level and coins.
 * @component
 */
function GameHeader() {
  const { currentLevel, coins } = useGameStore();

  return (
    <header className="w-full p-3 sm:p-4 md:p-5 flex justify-between items-center max-w-5xl mx-auto z-10">
      <div className="bg-black/30 px-4 py-1 rounded-full">
        <span className="text-sm sm:text-base md:text-lg font-semibold" aria-live="polite">LEVEL {currentLevel + 1}</span>
      </div>
      <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 px-3 py-1 rounded-full">
        <span className="text-yellow-400 font-bold text-sm sm:text-base md:text-lg" aria-label={`Current coins: ${coins}`}>
          <Gem className="inline-block w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 -mt-0.5 mr-1" />{coins}
        </span>
      </div>
    </header>
  );
}

export default GameHeader;
