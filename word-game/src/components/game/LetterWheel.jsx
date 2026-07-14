import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * @typedef {object} SelectedLetter
 * @property {string} letter - The letter character.
 * @property {number} index - The original index of the letter in the `letters` array.
 */

/**
 * @typedef {object} LetterWheelProps
 * @property {string[]} letters - Array of letters to display in the wheel.
 * @property {(word: string) => void} onWordComplete - Callback when a word is completed.
 * @property {(selectedLetterObjects: SelectedLetter[]) => void} onLetterSelect - Callback with currently selected letters.
 */

/**
 * A circular interactive component for selecting letters to form words.
 * @component
 * @param {LetterWheelProps} props
 */
export default function LetterWheel({ letters, onWordComplete, onLetterSelect }) {
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const radius = 80;
  const centerX = 125;
  const centerY = 125;

  /**
   * Calculates the SVG coordinates for a letter based on its index and total letters.
   * @param {number} index - The index of the letter.
   * @param {number} total - The total number of letters.
   * @returns {{x: number, y: number}} SVG coordinates.
   */
  const getCoords = useCallback((index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start at top, go clockwise
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  }, [centerX, centerY, radius]);

  const handleMouseDown = useCallback((i) => {
    setIsDragging(true);
    const newSelection = [{ letter: letters[i], index: i }];
    setSelectedIndices([i]);
    onLetterSelect(newSelection);
  }, [letters, onLetterSelect]);

  const handleMouseEnter = useCallback((i) => {
    if (isDragging && !selectedIndices.includes(i)) {
      const newSelectionIndices = [...selectedIndices, i];
      setSelectedIndices(newSelectionIndices);
      onLetterSelect(newSelectionIndices.map(idx => ({ letter: letters[idx], index: idx })));
    }
  }, [isDragging, selectedIndices, letters, onLetterSelect]);

  const handleGlobalMouseUp = useCallback(() => {
    if (!isDragging) return;
    const word = selectedIndices.map(i => letters[i]).join("");
    onWordComplete(word);
    setIsDragging(false);
    setSelectedIndices([]);
    onLetterSelect([]);
  }, [isDragging, selectedIndices, letters, onWordComplete, onLetterSelect]);

  // Attach/detach global mouseup listener
  useEffect(() => {
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseUp]);

  // Effect to update parent's selected letters when local selectedIndices changes
  useEffect(() => {
    // This effect is mostly redundant now that handleMouseDown/Enter/Up also call onLetterSelect
    // but can be kept as a safeguard or for more complex state sync in the future.
    if (!isDragging) {
      onLetterSelect([]);
    } else {
      onLetterSelect(selectedIndices.map(idx => ({ letter: letters[idx], index: idx })));
    }
  }, [selectedIndices, isDragging, letters, onLetterSelect]);


  return (
    <div
      className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 touch-none select-none max-w-[calc(100vw-4rem)] max-h-[calc(100vw-4rem)] aspect-square"
      ref={containerRef}
      onMouseMove={(e) => {
        if (isDragging && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const scaleX = 250 / rect.width;
          const scaleY = 250 / rect.height;
          setMousePos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
          });
        }
      }}
      role="region"
      aria-label="Letter selection wheel"
    >
      <svg viewBox="0 0 250 250" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        {selectedIndices.length > 0 && (
          <polyline
            points={selectedIndices.map(i => `${getCoords(i, letters.length).x},${getCoords(i, letters.length).y}`).join(" ")}
            stroke="#60A5FA" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round"
          />
        )}
        {isDragging && selectedIndices.length > 0 && (
          <line
            x1={getCoords(selectedIndices[selectedIndices.length - 1], letters.length).x}
            y1={getCoords(selectedIndices[selectedIndices.length - 1], letters.length).y}
            x2={mousePos.x} y2={mousePos.y}
            stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" opacity="0.6"
          />
        )}
      </svg>

      {letters.map((letter, i) => {
        const { x, y } = getCoords(i, letters.length);
        const isSelected = selectedIndices.includes(i);
        return (
          <motion.div
            key={i}
            onMouseDown={() => handleMouseDown(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            className={`absolute flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-colors
              ${isSelected ? 'bg-blue-500 text-white shadow-lg scale-110' : 'bg-white text-gray-800 border-2'}`}
            style={{ left: `calc(${(x / 250) * 100}% - 24px)`, top: `calc(${(y / 250) * 100}% - 24px)` }}
            whileHover={{ scale: 1.1 }}
            role="button"
            aria-label={`Letter ${letter}`}
            aria-pressed={isSelected}
            tabIndex={0} // Make div focusable
            onKeyDown={(e) => { // Keyboard navigation
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!isDragging) { // Start drag with space/enter
                  handleMouseDown(i);
                } else { // Extend selection
                  handleMouseEnter(i);
                }
              }
            }}
            onKeyUp={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && isDragging) {
                e.preventDefault();
                handleGlobalMouseUp();
              }
            }}
          >
            <span className="text-xl font-bold">{letter}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
