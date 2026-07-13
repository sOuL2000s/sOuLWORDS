import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LetterWheel({ letters, onWordComplete }) {
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const radius = 80;
  const centerX = 125;
  const centerY = 125;

  const getCoords = (index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const handleMouseDown = (i) => {
    setIsDragging(true);
    setSelectedIndices([i]);
  };

  const handleMouseEnter = (i) => {
    if (isDragging && !selectedIndices.includes(i)) {
      setSelectedIndices([...selectedIndices, i]);
    }
  };

  const handleGlobalMouseUp = () => {
    if (!isDragging) return;
    const word = selectedIndices.map(i => letters[i]).join("");
    onWordComplete(word);
    setIsDragging(false);
    setSelectedIndices([]);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [selectedIndices, isDragging]);

  return (
    <div className="relative w-64 h-64 touch-none select-none" ref={containerRef}
         onMouseMove={(e) => {
           const rect = containerRef.current.getBoundingClientRect();
           setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
         }}>
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Lines between selected letters */}
        {selectedIndices.length > 0 && (
          <polyline
            points={selectedIndices.map(i => `${getCoords(i, letters.length).x},${getCoords(i, letters.length).y}`).join(" ")}
            stroke="#60A5FA" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round"
          />
        )}
        {/* Line to current mouse pos */}
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
            style={{ left: x - 24, top: y - 24 }}
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-xl font-bold">{letter}</span>
          </motion.div>
        );
      })}
    </div>
  );
}