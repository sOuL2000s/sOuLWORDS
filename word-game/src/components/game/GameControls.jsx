import React from 'react';
import { HINT_COST } from '../../config/gameConfig';
import { useGameStore } from '../../store/gameStore'; // Import useGameStore
import { Gem } from 'lucide-react'; // Import Gem icon

/**
 * @typedef {object} GameControlsProps
 * @property {function(): void} onShuffleLetters - Callback to shuffle letters.
 * @property {function(): void} onRevealHint - Callback to reveal a hint.
 */

/**
 * Renders the shuffle and hint buttons.
 * @component
 * @param {GameControlsProps} props
 */
function GameControls({ onShuffleLetters, onRevealHint }) {
  const { unlimitedHintsMode } = useGameStore(); // Get unlimitedHintsMode from store

  return (
    <div className="flex justify-center gap-4 mt-8 flex-wrap">
      <button
        onClick={onShuffleLetters}
        className="px-5 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95 text-sm sm:text-base lg:text-lg font-semibold"
        aria-label="Shuffle letters"
      >
        🔄 Shuffle
      </button>
      <button
        onClick={onRevealHint}
        className="px-5 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-95 text-sm sm:text-base lg:text-lg font-semibold"
        aria-label={`Reveal hint ${unlimitedHintsMode ? '(Free)' : `(Costs ${HINT_COST} coins)`}`}
      >
        💡 Hint {unlimitedHintsMode ? '(Free)' : `(${HINT_COST} `}
        {!unlimitedHintsMode && <Gem className="inline-block w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 -mt-0.5" />}
        {!unlimitedHintsMode && `)`}
      </button>
    </div>
  );
}

export default GameControls;
