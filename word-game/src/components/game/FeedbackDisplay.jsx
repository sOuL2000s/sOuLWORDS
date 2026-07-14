import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @typedef {object} FeedbackDisplayProps
 * @property {string} message - The message to display.
 * @property {string} colorClass - Tailwind CSS class for text color (e.g., 'text-red-400').
 * @property {string[]} currentSelectionLetters - Array of selected letters to display if no message is active.
 */

/**
 * Displays user feedback messages or current letter selection.
 * @component
 * @param {FeedbackDisplayProps} props
 */
function FeedbackDisplay({ message, colorClass, currentSelectionLetters }) {
  const displayMessage = message || currentSelectionLetters.join('');
  const displayColorClass = message ? colorClass : 'text-blue-300';

  return (
    <div className="h-10 mb-8 flex items-center justify-center min-h-[40px] max-w-md text-center mx-auto" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait">
        <motion.span
          key={displayMessage} // Key ensures re-animation on message change
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-widest uppercase ${displayColorClass}`}
        >
          {displayMessage}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default FeedbackDisplay;
