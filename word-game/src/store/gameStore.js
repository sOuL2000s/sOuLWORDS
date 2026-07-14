import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_STARTING_COINS } from '../config/gameConfig'; // Import default coins

export const useGameStore = create(
  persist(
    (set) => ({
      currentLevel: 0,
      coins: DEFAULT_STARTING_COINS, // Use constant for starting coins
      foundWords: [],
      selectedLetters: [],
      isWin: false,
      unlimitedHintsMode: false, // New state for unlimited hints mode
      
      setLevel: (levelOrUpdater) => set((state) => {
        const nextLevel = typeof levelOrUpdater === 'function'
          ? levelOrUpdater(state.currentLevel)
          : levelOrUpdater;
        console.log(`Setting level from ${state.currentLevel} to ${nextLevel}. Resetting found words.`);
        return { currentLevel: nextLevel, foundWords: [], isWin: false };
      }),
      addFoundWord: (word) => set((state) => ({ 
        foundWords: [...state.foundWords, word] 
      })),
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      setSelectedLetters: (letters) => set({ selectedLetters: letters }),
      setWin: (val) => set({ isWin: val }),
      toggleUnlimitedHintsMode: () => set((state) => {
        console.log("Toggling unlimited hints mode:", !state.unlimitedHintsMode);
        return { unlimitedHintsMode: !state.unlimitedHintsMode };
      }), // New action
    }),
    {
      name: 'word-game-storage', // unique name for local storage
      partialize: (state) => ({ 
        currentLevel: state.currentLevel, 
        coins: state.coins,
        foundWords: state.foundWords, // Persist found words for the current level
        unlimitedHintsMode: state.unlimitedHintsMode, // Persist hints mode
      }),
    }
  )
);