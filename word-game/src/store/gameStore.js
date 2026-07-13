import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGameStore = create(
  persist(
    (set) => ({
      currentLevel: 0,
      coins: 200,
      foundWords: [],
      selectedLetters: [],
      isWin: false,
      
      setLevel: (level) => set({ currentLevel: level, foundWords: [], isWin: false }),
      addFoundWord: (word) => set((state) => ({ 
        foundWords: [...state.foundWords, word] 
      })),
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      setSelectedLetters: (letters) => set({ selectedLetters: letters }),
      setWin: (val) => set({ isWin: val }),
    }),
    {
      name: 'word-game-storage', // unique name for local storage
      partialize: (state) => ({ 
        currentLevel: state.currentLevel, 
        coins: state.coins 
      }), // only persist currentLevel and coins
    }
  )
);