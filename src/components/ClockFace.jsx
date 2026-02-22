import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { calculateClockAngles, isSnackTime, getMinutesFromAngle } from '../utils/GameLogic';

const ClockFace = ({ currentHour, currentMinute, onTimeChange, soundEnabled = true }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showSnackTime, setShowSnackTime] = useState(false);
  const [selectedHand, setSelectedHand] = useState(null); // 'hour' or 'minute'
  const [isHandSelected, setIsHandSelected] = useState(false);
  const clockRef = useRef(null);
  
  const clockRadius = 120;
  const centerX = 150;
  const centerY = 150;

  const { hourAngle, minuteAngle } = calculateClockAngles(currentHour, currentMinute);

  // Play gentle chime sound
  const playChime = (frequency = 523.25, duration = 0.3) => {
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
  };

  // Check for snack time event
  useEffect(() => {
    if (isSnackTime(currentHour, currentMinute)) {
      if (!showSnackTime) { // Only trigger once per snack time
        setShowSnackTime(true);
        playChime(659.25, 0.5); // E5 note for snack time
        onTimeChange && onTimeChange({ 
          hour: currentHour, 
          minute: currentMinute, 
          snackTime: true 
        });
        
        setTimeout(() => setShowSnackTime(false), 2000);
      }
    } else {
      setShowSnackTime(false);
    }
  }, [currentHour, currentMinute, onTimeChange, soundEnabled, showSnackTime]);

  // Handle hand selection
  const handleHandClick = (handType) => {
    setSelectedHand(handType);
    setIsHandSelected(true);
    playChime(440, 0.2); // A4 note for selection
  };

  // Handle number click when hand is selected
  const handleNumberClick = (number) => {
    if (!isHandSelected) return;
    
    let newHour = currentHour;
    let newMinute = currentMinute;
    
    if (selectedHand === 'hour') {
      // Convert 12-hour clock to 0-11 format
      newHour = number === 12 ? 0 : number;
    } else if (selectedHand === 'minute') {
      // Convert number to minutes (multiply by 5)
      newMinute = number * 5;
      // Update hour proportionally
      const hourIncrement = newMinute / 60;
      newHour = currentHour + hourIncrement;
    }
    
    onTimeChange && onTimeChange({
      hour: newHour,
      minute: newMinute,
      snackTime: isSnackTime(newHour, newMinute)
    });
    
    // Reset selection
    setIsHandSelected(false);
    setSelectedHand(null);
    playChime(523.25, 0.3); // C5 note for placement
  };

  const handleDrag = (event, info) => {
    if (!clockRef.current) return;
    
    const rect = clockRef.current.getBoundingClientRect();
    const clockCenterX = rect.left + rect.width / 2;
    const clockCenterY = rect.top + rect.height / 2;
    
    const x = info.point.x - clockCenterX;
    const y = info.point.y - clockCenterY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    
    const minutes = Math.round(angle / 6) % 60;
    const hourIncrement = minutes / 60;
    const newHour = (currentHour + hourIncrement) % 12;
    
    onTimeChange && onTimeChange({
      hour: newHour,
      minute: minutes,
      snackTime: isSnackTime(newHour, minutes)
    });
  };

  const CarrotHand = ({ angle }) => (
    <motion.g
      animate={{ rotate: angle }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
      style={{ transformOrigin: `${centerX}px ${centerY}px` }}
      className="pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
      onClick={() => handleHandClick('hour')}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Carrot (Hour Hand) - Short and thick - positioned from center */}
      <rect
        x={centerX - 6}
        y={centerY - 50}
        width="12"
        height="50"
        fill="#FF8C42"
        rx="6"
        className="drop-shadow-md"
      />
      {/* Green leaf at base - centered */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx="10"
        ry="6"
        fill="#90EE90"
        opacity="0.8"
      />
      {/* Carrot tip */}
      <circle
        cx={centerX}
        cy={centerY - 50}
        r="6"
        fill="#FF8C42"
      />
      {/* Cute carrot face */}
      <circle cx={centerX - 2} cy={centerY - 45} r="1" fill="#333" />
      <circle cx={centerX + 2} cy={centerY - 45} r="1" fill="#333" />
      <path d={`M ${centerX - 3} ${centerY - 42} Q ${centerX} ${centerY - 40} ${centerX + 3} ${centerY - 42}`} 
            stroke="#333" strokeWidth="0.5" fill="none" />
    </motion.g>
  );

  const RabbitHand = ({ angle }) => (
    <motion.g
      animate={{ rotate: angle }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
      style={{ transformOrigin: `${centerX}px ${centerY}px` }}
      drag
      dragElastic={0}
      dragMomentum={false}
      onDrag={handleDrag}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className="cursor-grab active:cursor-grabbing"
      whileDrag={{ scale: 1.1 }}
      onClick={() => handleHandClick('minute')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Rabbit (Minute Hand) - Long and thin - positioned from center */}
      <rect
        x={centerX - 3}
        y={centerY - 90}
        width="6"
        height="90"
        fill="#E6E6FA"
        rx="3"
        className="drop-shadow-md"
      />
      {/* Rabbit ears at tip */}
      <ellipse
        cx={centerX - 2}
        cy={centerY - 90}
        rx="2"
        ry="6"
        fill="#E6E6FA"
        transform={`rotate(-10 ${centerX - 2} ${centerY - 90})`}
      />
      <ellipse
        cx={centerX + 2}
        cy={centerY - 90}
        rx="2"
        ry="6"
        fill="#E6E6FA"
        transform={`rotate(10 ${centerX + 2} ${centerY - 90})`}
      />
      {/* Rabbit face at tip */}
      <circle
        cx={centerX}
        cy={centerY - 90}
        r="4"
        fill="#E6E6FA"
      />
      {/* Cute rabbit face */}
      <circle cx={centerX - 1.5} cy={centerY - 90} r="0.8" fill="#FF69B4" />
      <circle cx={centerX + 1.5} cy={centerY - 90} r="0.8" fill="#FF69B4" />
      <circle cx={centerX} cy={centerY - 88} r="0.5" fill="#FF69B4" />
      {/* Pink nose */}
    </motion.g>
  );

  return (
    <motion.div
      ref={clockRef}
      className={`relative ${showSnackTime ? 'animate-pulse-gentle' : ''}`}
      animate={showSnackTime ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.6 }}
    >
      <svg width="300" height="300" className="drop-shadow-xl">
        {/* Cute themed background pattern */}
        <defs>
          <pattern id="carrotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="3" fill="#FFE4B5" opacity="0.3" />
            <path d="M 15 20 Q 20 15 25 20" stroke="#FF8C42" strokeWidth="1" fill="none" opacity="0.3" />
          </pattern>
          <pattern id="rabbitPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="#E6E6FA" opacity="0.3" />
            <ellipse cx="18" cy="18" rx="1" ry="2" fill="#E6E6FA" opacity="0.3" />
            <ellipse cx="22" cy="18" rx="1" ry="2" fill="#E6E6FA" opacity="0.3" />
          </pattern>
        </defs>
        
        {/* Clock Face with cute theme */}
        <circle
          cx={centerX}
          cy={centerY}
          r={clockRadius}
          fill="#FFF8DC"
          stroke="#FFB6C1"
          strokeWidth="4"
        />
        
        {/* Decorative carrot border */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x = centerX + Math.cos(angle) * (clockRadius - 15);
          const y = centerY + Math.sin(angle) * (clockRadius - 15);
          
          return (
            <g key={`carrot-${i}`}>
              <circle cx={x} cy={y} r="4" fill="#FF8C42" opacity="0.6" />
              <path d={`M ${x - 2} ${y - 2} Q ${x} ${y - 4} ${x + 2} ${y - 2}`} 
                    stroke="#90EE90" strokeWidth="1" fill="none" />
            </g>
          );
        })}
        
        {/* Hour markers with cute design */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = centerX + Math.cos(angle) * (clockRadius - 10);
          const y1 = centerY + Math.sin(angle) * (clockRadius - 10);
          const x2 = centerX + Math.cos(angle) * (clockRadius - 20);
          const y2 = centerY + Math.sin(angle) * (clockRadius - 20);
          
          return (
            <g key={`marker-${i}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FF69B4"
                strokeWidth={i % 3 === 0 ? 4 : 2}
                strokeLinecap="round"
              />
              {i % 3 === 0 && (
                <circle cx={x1} cy={y1} r="3" fill="#FFB6C1" />
              )}
            </g>
          );
        })}
        
        {/* Numbers with click functionality */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = centerX + Math.cos(angle) * (clockRadius - 35);
          const y = centerY + Math.sin(angle) * (clockRadius - 35);
          
          return (
            <g key={num} className="cursor-pointer" onClick={() => handleNumberClick(num)}>
              <circle
                cx={x}
                cy={y}
                r="18"
                fill={isHandSelected ? "#FFE4E1" : "#FFF"}
                stroke={isHandSelected ? "#FF69B4" : "#FFB6C1"}
                strokeWidth="2"
                className="hover:fill-pink-100 transition-colors"
              />
              <text
                x={x}
                y={y + 6}
                textAnchor="middle"
                fill="#FF1493"
                fontSize="16"
                fontWeight="bold"
                className="select-none font-rounded pointer-events-none"
              >
                {num}
              </text>
              {/* Cute decorations around numbers */}
              {num === 12 && (
                <text x={x} y={y - 8} textAnchor="middle" fontSize="12">🥕</text>
              )}
              {num === 6 && (
                <text x={x} y={y - 8} textAnchor="middle" fontSize="12">🐰</text>
              )}
            </g>
          );
        })}
        
        {/* Center dot with cute design */}
        <circle
          cx={centerX}
          cy={centerY}
          r="10"
          fill="#FFB6C1"
          stroke="#FF69B4"
          strokeWidth="2"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="6"
          fill="#FFF"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="3"
          fill="#FF69B4"
        />
        
        {/* Clock Hands */}
        <CarrotHand angle={hourAngle} />
        <RabbitHand angle={minuteAngle} />
      </svg>
      
      {/* Selection indicator */}
      {isHandSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center bg-white/30 rounded-full"
        >
          <div className="bg-white/90 px-4 py-2 rounded-full text-sm font-bold text-pink-500 shadow-lg border-2 border-pink-300">
            {selectedHand === 'hour' ? '🥕 Click a number!' : '🐰 Click a number!'}
          </div>
        </motion.div>
      )}
      
      {/* Snack Time Indicator */}
      {showSnackTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-pink-100 px-6 py-3 rounded-full text-pink-600 font-bold text-sm shadow-lg border-2 border-pink-300"
        >
          🥕🐰 Snack Time! 🥕🐰
        </motion.div>
      )}

      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center">
          <div className="bg-white/80 px-4 py-2 rounded-full text-xs font-bold text-pink-500 shadow-lg border border-pink-300">
            🐰 Dragging Rabbit...
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-pink-50 px-4 py-2 rounded-full text-xs text-pink-600 text-center max-w-xs"
      >
        Click 🥕 carrot or 🐰 rabbit, then click a number!
      </motion.div>
    </motion.div>
  );
};

export default ClockFace;
