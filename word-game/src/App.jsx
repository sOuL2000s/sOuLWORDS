import React from 'react';
import GamePage from './pages/GamePage'; // Import the new GamePage component

export function App() {
  return (
    // App now serves as a layout wrapper for the GamePage
    // Future routing, authentication context, etc., would go here
    <div className="min-h-dvh bg-gradient-to-b from-blue-900 to-indigo-900 text-white flex flex-col items-center relative overflow-hidden">
      {/* Desktop Background: Subtle gradient blobs for visual interest */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob lg:w-96 lg:h-96"></div>
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 lg:w-96 lg:h-96"></div>
      <div className="absolute bottom-1/4 left-1/2 w-48 h-48 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 lg:w-96 lg:h-96"></div>
      
      <GamePage />
    </div>
  );
}
