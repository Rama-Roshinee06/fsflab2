import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { calculateClockAngles, isSnackTime, getMinutesFromAngle } from '../utils/GameLogic';

const ClockFace = ({ 
  currentHour, 
  currentMinute, 
  onTimeChange, 
  soundEnabled = true,
  scaffoldingLevel = null,
  ariaLabel = "Interactive clock face"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showSnackTime, setShowSnackTime] = useState(false);
  const [selectedHand, setSelectedHand] = useState(null);
  const [isHandSelected, setIsHandSelected] = useState(false);
  const [draggedHand, setDraggedHand] = useState(null);
  const clockRef = useRef(null);
  
  const clockRadius = 120;
  const centerX = 150;
  const centerY = 150;

  const { hourAngle, minuteAngle } = calculateClockAngles(currentHour, currentMinute);

  // Enhanced drag handlers with accessibility
  const handleDragStart = useCallback((handType) => {
    if (scaffoldingLevel === 1 && handType === 'minute') return;
    setDraggedHand(handType);
    setIsDragging(true);
    playChime(440, 0.1);
  }, [scaffoldingLevel]);

  const handleDragEnd = useCallback((info: PanInfo) => {
    if (!draggedHand || !clockRef.current) return;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(info.point.y - centerY, info.point.x - centerX);
    const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
    
    let newHour = currentHour;
    let newMinute = currentMinute;
    
    if (draggedHand === 'hour') {
      const hourFromAngle = Math.round(degrees / 30) % 12 || 12;
      newHour = hourFromAngle;
    } else {
      newMinute = Math.round(degrees / 6) % 60;
    }
    
    onTimeChange?.({ hour: newHour, minute: newMinute, snackTime: false });
    setIsDragging(false);
    setDraggedHand(null);
    playChime(523, 0.2);
  }, [draggedHand, currentHour, currentMinute, onTimeChange]);

  // Enhanced click handlers for accessibility
  const handleHandClick = useCallback((handType) => {
    if (scaffoldingLevel === 1 && handType === 'minute') return;
    
    setSelectedHand(selectedHand === handType ? null : handType);
    setIsHandSelected(selectedHand !== handType);
    playChime(440, 0.1);
  }, [selectedHand, scaffoldingLevel]);

  const handleNumberClick = useCallback((number) => {
    if (!selectedHand) return;
    
    let newHour = currentHour;
    let newMinute = currentMinute;
    
    if (selectedHand === 'hour') {
      newHour = number;
    } else {
      newMinute = (number % 12) * 5;
    }
    
    onTimeChange?.({ hour: newHour, minute: newMinute, snackTime: false });
    setSelectedHand(null);
    setIsHandSelected(false);
    playChime(523, 0.2);
  }, [selectedHand, currentHour, currentMinute, onTimeChange]);

  const playChime = useCallback((frequency = 523.25, duration = 0.3) => {
    if (!soundEnabled) return;
    
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  // Check for snack time
  useEffect(() => {
    if (isSnackTime(currentHour, currentMinute)) {
      if (!showSnackTime) {
        setShowSnackTime(true);
        playChime(659.25, 0.5);
        onTimeChange?.({ hour: currentHour, minute: currentMinute, snackTime: true });
      }
    } else {
      setShowSnackTime(false);
    }
  }, [currentHour, currentMinute, showSnackTime, playChime, onTimeChange]);

  // Enhanced clock hands with drag-and-drop
  const CarrotHand = () => (
    <motion.g
      drag={!scaffoldingLevel || scaffoldingLevel > 1}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => handleDragStart('hour')}
      onDragEnd={handleDragEnd}
      animate={{ rotate: hourAngle }}
      style={{ transformOrigin: '150px 150px' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`Hour hand pointing to ${currentHour} o'clock`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleHandClick('hour');
        }
      }}
    >
      <line
        x1="150"
        y1="150"
        x2="150"
        y2="90"
        stroke="#FF8C42"
        strokeWidth="8"
        strokeLinecap="round"
        className={selectedHand === 'hour' ? 'drop-shadow-lg' : ''}
      />
      <circle cx="150" cy="85" r="12" fill="#FF8C42" />
      <text x="150" y="90" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">🥕</text>
    </motion.g>
  );

  const RabbitHand = () => (
    <motion.g
      drag={scaffoldingLevel !== 1}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => handleDragStart('minute')}
      onDragEnd={handleDragEnd}
      animate={{ rotate: minuteAngle }}
      style={{ transformOrigin: '150px 150px' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`cursor-pointer ${scaffoldingLevel === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
      role="button"
      tabIndex={scaffoldingLevel === 1 ? -1 : 0}
      aria-label={`Minute hand pointing to ${currentMinute} minutes`}
      aria-disabled={scaffoldingLevel === 1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (scaffoldingLevel !== 1) handleHandClick('minute');
        }
      }}
    >
      <line
        x1="150"
        y1="150"
        x2="150"
        y2="60"
        stroke="#F472B6"
        strokeWidth="6"
        strokeLinecap="round"
        className={selectedHand === 'minute' ? 'drop-shadow-lg' : ''}
      />
      <circle cx="150" cy="55" r="10" fill="#F472B6" />
      <text x="150" y="60" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">🐰</text>
    </motion.g>
  );

  return (
    <div 
      ref={clockRef}
      className="relative"
      role="application"
      aria-label={ariaLabel}
    >
      <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-xl">
        {/* Clock face with enhanced accessibility */}
        <circle
          cx="150"
          cy="150"
          r="140"
          fill="white"
          stroke="#FB923C"
          strokeWidth="4"
        />
        
        {/* Decorative carrot border */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x = 150 + Math.cos(angle) * 130;
          const y = 150 + Math.sin(angle) * 130;
          return (
            <text
              key={`carrot-${i}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#FF8C42"
            >
              🥕
            </text>
          );
        })}

        {/* Hour markers with better contrast */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          const x1 = 150 + Math.cos(angle) * 120;
          const y1 = 150 + Math.sin(angle) * 120;
          const x2 = 150 + Math.cos(angle) * 110;
          const y2 = 150 + Math.sin(angle) * 110;
          
          return (
            <line
              key={`marker-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#1F2937"
              strokeWidth={i % 3 === 0 ? "3" : "2"}
            />
          );
        })}

        {/* Numbers with enhanced accessibility */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x = 150 + Math.cos(angle) * 95;
          const y = 150 + Math.sin(angle) * 95;
          
          return (
            <g key={`number-${num}`}>
              <circle
                cx={x}
                cy={y}
                r="18"
                fill={selectedHand ? "#FEF3C7" : "white"}
                stroke={selectedHand ? "#FB923C" : "#FDBA74"}
                strokeWidth="2"
                className="cursor-pointer hover:fill-yellow-100 transition-colors"
                onClick={() => handleNumberClick(num)}
                role="button"
                tabIndex={selectedHand ? 0 : -1}
                aria-label={`Set time to ${num}`}
                aria-disabled={!selectedHand}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="20"
                fontWeight="bold"
                fill="#1F2937"
                className="pointer-events-none select-none"
              >
                {num}
              </text>
            </g>
          );
        })}

        {/* Enhanced clock hands */}
        <CarrotHand />
        <RabbitHand />

        {/* Center pivot */}
        <circle cx="150" cy="150" r="8" fill="#1F2937" />
        <circle cx="150" cy="150" r="5" fill="#FF8C42" />
      </svg>

      {/* Visual feedback for selected hand */}
      {isHandSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold"
        >
          Click a number to set {selectedHand === 'hour' ? 'hour' : 'minute'}! 🎯
        </motion.div>
      )}

      {/* Scaffolding indicator */}
      {scaffoldingLevel === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold"
        >
          🏗️ Scaffolding Mode: Hour Hand Only
        </motion.div>
      )}

      {/* Snack time celebration */}
      {showSnackTime && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-6xl font-bold text-orange-600 animate-pulse">
            🥕🐰 Snack Time! 🥕🐰
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ClockFace;
