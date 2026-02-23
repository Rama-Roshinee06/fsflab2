import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import ClockFace from './components/ClockFace';
import { 
  generateTimeChallenge, 
  validateTimeMatch, 
  formatTimeForDisplay,
  fetchTimeFromAPI,
  submitAnswerToAPI,
  saveProgressToAPI
} from './utils/GameLogic';

function App() {
  // Existing game state
  const [currentHour, setCurrentHour] = useState(3);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [targetTime, setTargetTime] = useState({ hour: 3, minute: 0, displayTime: '3 o\'clock' });
  const [seedsCollected, setSeedsCollected] = useState(0);
  const [snackTimesUnlocked, setSnackTimesUnlocked] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGentleFeedback, setShowGentleFeedback] = useState(false);
  const [currentLevel, setCurrentLevel] = useState('easy');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCorrectTime, setLastCorrectTime] = useState('');
  const [attempts, setAttempts] = useState(0);

  // NEW: Multi-Modal Learning State
  const [learningMode, setLearningMode] = useState('freeplay'); // 'freeplay', 'sequencing', 'scaffolding'
  const [sequencingStep, setSequencingStep] = useState(1); // 1: hours, 2: half-hours, 3: quarters, 4: exact
  const [showSandTimer, setShowSandTimer] = useState(false);
  const [sandTimerSeconds, setSandTimerSeconds] = useState(60);
  const [scaffoldingLevel, setScaffoldingLevel] = useState(1); // 1: hour only, 2: hour + minute
  const [dailyEvent, setDailyEvent] = useState(null);
  const [is24HourMode, setIs24HourMode] = useState(false);
  const [viewMode, setViewMode] = useState('analog'); // 'analog', 'digital', 'both'
  const [digitalInput, setDigitalInput] = useState('');
  const [showProgressCapture, setShowProgressCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  // Refs for screen capture
  const appRef = useRef(null);
  const sandTimerRef = useRef(null);

  // Daily events mapping for 24-hour format
  const dailyEvents = {
    7: '🌅 Morning Routine',
    8: '🍳 Breakfast Time',
    9: '📚 Learning Time',
    10: '🎯 Activity Time',
    11: '🧸 Play Time',
    12: '🍽️ Lunch Time',
    13: '😴 Quiet Time',
    14: '🎨 Creative Time',
    15: '🥪 Snack Time',
    16: '🏃 Outdoor Play',
    17: '🧹 Cleanup Time',
    18: '👨‍👩‍👧‍👦 Family Time',
    19: '🍽️ Dinner Time',
    20: '🛁 Bath Time',
    21: '📖 Story Time',
    22: '🌙 Bedtime Routine'
  };

  // Play gentle chime sound
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

  // NEW: Sand Timer Logic
  const startSandTimer = useCallback((seconds = 60) => {
    setSandTimerSeconds(seconds);
    setShowSandTimer(true);
    
    const timer = setInterval(() => {
      setSandTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowSandTimer(false);
          playChime(880, 0.5); // Higher pitch for completion
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playChime]);

  // NEW: Progress Capture Logic
  const captureProgress = useCallback(() => {
    if (!appRef.current) return;

    // Use html2canvas or similar library in production
    // For now, create a simple data URL representation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    // Draw progress summary
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 24px Fredoka';
    ctx.fillText('🥕🐰 Garden of Time Progress 🥕🐰', 200, 50);
    ctx.font = '18px Fredoka';
    ctx.fillText(`Seeds Collected: ${seedsCollected}`, 250, 100);
    ctx.fillText(`Flowers Bloomed: ${snackTimesUnlocked}`, 250, 130);
    ctx.fillText(`Current Level: ${currentLevel}`, 250, 160);
    ctx.fillText(`Last Correct Time: ${lastCorrectTime}`, 250, 190);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 250, 220);
    
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
    setShowProgressCapture(true);

    // Auto-download
    const link = document.createElement('a');
    link.download = `garden-of-time-progress-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, [seedsCollected, snackTimesUnlocked, currentLevel, lastCorrectTime]);

  // NEW: Keyboard Event Handler
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Number keys for digital input
      if (event.key >= '0' && event.key <= '9') {
        if (viewMode === 'digital' || viewMode === 'both') {
          setDigitalInput(prev => prev + event.key);
        }
      }
      
      // Spacebar to toggle view mode
      if (event.key === ' ') {
        event.preventDefault();
        setViewMode(prev => {
          if (prev === 'analog') return 'digital';
          if (prev === 'digital') return 'both';
          return 'analog';
        });
      }
      
      // 'S' for sand timer
      if (event.key.toLowerCase() === 's') {
        startSandTimer();
      }
      
      // 'C' for capture progress
      if (event.key.toLowerCase() === 'c' && event.ctrlKey) {
        event.preventDefault();
        captureProgress();
      }
      
      // 'M' for learning mode toggle
      if (event.key.toLowerCase() === 'm') {
        setLearningMode(prev => {
          const modes = ['freeplay', 'sequencing', 'scaffolding'];
          const currentIndex = modes.indexOf(prev);
          return modes[(currentIndex + 1) % modes.length];
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, startSandTimer, captureProgress]);

  // NEW: Sequencing Mode Logic
  const generateSequencingChallenge = useCallback(() => {
    const challenges = {
      1: { // Hours only
        generate: () => {
          const hour = Math.floor(Math.random() * 12) + 1;
          return { hour, minute: 0, displayTime: `${hour} o'clock` };
        }
      },
      2: { // Half hours
        generate: () => {
          const hour = Math.floor(Math.random() * 12) + 1;
          const minute = Math.random() > 0.5 ? 30 : 0;
          return { hour, minute, displayTime: minute === 0 ? `${hour} o'clock` : `${hour}:30` };
        }
      },
      3: { // Quarter hours (15, 45)
        generate: () => {
          const hour = Math.floor(Math.random() * 12) + 1;
          const minutes = [0, 15, 30, 45];
          const minute = minutes[Math.floor(Math.random() * minutes.length)];
          return { hour, minute, displayTime: minute === 0 ? `${hour} o'clock` : `${hour}:${minute}` };
        }
      },
      4: { // Exact minutes
        generate: () => {
          const hour = Math.floor(Math.random() * 12) + 1;
          const minute = Math.floor(Math.random() * 60);
          return { hour, minute, displayTime: `${hour}:${minute.toString().padStart(2, '0')}` };
        }
      }
    };

    return challenges[sequencingStep].generate();
  }, [sequencingStep]);

  // NEW: 24-Hour to Daily Event Mapping
  const getDailyEventForTime = useCallback((hour, minute) => {
    const eventHour = is24HourMode ? hour : (hour % 12 || 12);
    return dailyEvents[eventHour] || null;
  }, [is24HourMode]);

  // Generate new challenge with enhanced logic
  const generateNewChallenge = useCallback(async () => {
    try {
      let newChallenge;
      
      if (learningMode === 'sequencing') {
        newChallenge = generateSequencingChallenge();
      } else {
        newChallenge = await fetchTimeFromAPI(currentLevel);
      }
      
      setTargetTime(newChallenge);
      setCurrentHour(newChallenge.hour);
      setCurrentMinute(newChallenge.minute);
      
      // Set daily event for 24-hour mode
      if (is24HourMode) {
        setDailyEvent(getDailyEventForTime(newChallenge.hour, newChallenge.minute));
      }
      
      setShowSuccess(false);
      setShowGentleFeedback(false);
      setAttempts(0);
      setDigitalInput('');
    } catch (error) {
      console.error('Error generating challenge:', error);
      // Fallback to local generation
      const newChallenge = generateTimeChallenge(currentLevel);
      setTargetTime(newChallenge);
      setCurrentHour(newChallenge.hour);
      setCurrentMinute(newChallenge.minute);
      setShowSuccess(false);
      setShowGentleFeedback(false);
      setAttempts(0);
      setDigitalInput('');
    }
  }, [currentLevel, learningMode, sequencingStep, generateSequencingChallenge, is24HourMode, getDailyEventForTime]);

  // Initialize challenge on mount
  useEffect(() => {
    generateNewChallenge();
  }, [generateNewChallenge]);

  const handleCorrectAnswer = useCallback(() => {
    setSeedsCollected(prev => prev + 1);
    setLastCorrectTime(formatTimeForDisplay(currentHour, currentMinute));
    setShowSuccess(true);
    
    if (soundEnabled) {
      playChime(783.99, 0.6); // G5 note for success
    }

    // Save progress
    saveProgressToAPI({
      userId: 'demo-user',
      seedsCollected: seedsCollected + 1,
      snackTimesUnlocked,
      lastCorrectTime: formatTimeForDisplay(currentHour, currentMinute),
      learningMode,
      sequencingStep,
      scaffoldingLevel
    });

    // Progress sequencing mode
    if (learningMode === 'sequencing' && attempts === 0) {
      // Perfect on first try - advance to next step
      if (sequencingStep < 4) {
        setSequencingStep(prev => prev + 1);
      }
    }

    // Auto-generate next challenge after celebration
    setTimeout(() => {
      generateNewChallenge();
    }, 3000);
  }, [currentHour, currentMinute, soundEnabled, generateNewChallenge, seedsCollected, snackTimesUnlocked, learningMode, sequencingStep, scaffoldingLevel, attempts, playChime]);

  const handleTimeChange = useCallback((timeUpdate) => {
    // Apply scaffolding logic
    if (learningMode === 'scaffolding' && scaffoldingLevel === 1) {
      // Only allow hour changes in level 1
      setCurrentHour(timeUpdate.hour);
    } else {
      setCurrentHour(timeUpdate.hour);
      setCurrentMinute(timeUpdate.minute);
    }

    // Check for snack time event
    if (timeUpdate.snackTime) {
      setSnackTimesUnlocked(prev => prev + 1);
      if (soundEnabled) {
        playChime(659.25, 0.5); // E5 note for snack time
      }
    }

    // Validate if time matches target
    const isMatch = validateTimeMatch(
      { hour: timeUpdate.hour, minute: timeUpdate.minute },
      targetTime
    );

    if (isMatch) {
      handleCorrectAnswer();
    }
  }, [targetTime, soundEnabled, handleCorrectAnswer, learningMode, scaffoldingLevel, playChime]);

  const handleManualCheck = useCallback(() => {
    setAttempts(prev => prev + 1);
    
    let isMatch;
    if (viewMode === 'digital' && digitalInput) {
      // Parse digital input
      const [hours, minutes] = digitalInput.split(':').map(Number);
      isMatch = validateTimeMatch(
        { hour: hours || 0, minute: minutes || 0 },
        targetTime
      );
    } else {
      isMatch = validateTimeMatch(
        { hour: currentHour, minute: currentMinute },
        targetTime
      );
    }

    if (isMatch) {
      handleCorrectAnswer();
    } else {
      setShowGentleFeedback(true);
      setTimeout(() => setShowGentleFeedback(false), 3000);
    }
  }, [currentHour, currentMinute, targetTime, handleCorrectAnswer, viewMode, digitalInput]);

  // Return the existing JSX with enhanced functionality
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 relative overflow-hidden" ref={appRef}>
      {/* Existing Interactive Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Flowers */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`flower-${i}`}
            className="absolute text-3xl opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {['🌸', '🌺', '🌻', '🌷', '🌹', '🏵️'][i % 6]}
          </motion.div>
        ))}
        
        {/* Other existing background elements... */}
      </div>

      {/* ENHANCED: Unified Left Sidebar with All Controls */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-lg shadow-2xl z-20 overflow-y-auto border-r-4 border-orange-300"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 text-purple-600 flex items-center justify-center">
              📚 Control Panel 📚
            </h2>
          </div>

          {/* Learning Modes Section */}
          <div className="mb-6 bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-2xl border-2 border-orange-300">
            <h3 className="text-lg font-bold mb-3 text-orange-600">🎯 Learning Modes</h3>
            <div className="space-y-2">
              <button
                onClick={() => setLearningMode('freeplay')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  learningMode === 'freeplay' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
                aria-label="Free Play Mode - Practice freely"
              >
                🎮 Free Play
              </button>
              <button
                onClick={() => setLearningMode('sequencing')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  learningMode === 'sequencing' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
                aria-label="Sequencing Mode - Progressive learning"
              >
                📈 Sequencing (Step {sequencingStep}/4)
              </button>
              <button
                onClick={() => setLearningMode('scaffolding')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  learningMode === 'scaffolding' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
                aria-label="Scaffolding Mode - Guided learning"
              >
                🏗️ Scaffolding (Level {scaffoldingLevel})
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <div><strong>Current:</strong> {learningMode}</div>
              <div><strong>Step:</strong> {sequencingStep}/4</div>
              <div><strong>Level:</strong> {scaffoldingLevel}</div>
            </div>
          </div>

          {/* View Modes Section */}
          <div className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-2xl border-2 border-green-300">
            <h3 className="text-lg font-bold mb-3 text-green-600">👁️ View Modes</h3>
            <div className="space-y-2">
              <button
                onClick={() => setViewMode('analog')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'analog' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                aria-label="Analog Clock View"
              >
                🕐 Analog
              </button>
              <button
                onClick={() => setViewMode('digital')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'digital' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                aria-label="Digital Clock View"
              >
                🔢 Digital
              </button>
              <button
                onClick={() => setViewMode('both')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'both' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                aria-label="Both Analog and Digital Views"
              >
                🔄 Both
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <div><strong>Current:</strong> {viewMode}</div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-2xl border-2 border-purple-300">
            <h3 className="text-lg font-bold mb-3 text-purple-600">⌨️ Keyboard Shortcuts</h3>
            <div className="space-y-1 text-xs">
              <div><kbd>Space</kbd> - Toggle View Mode</div>
              <div><kbd>S</kbd> - Start Sand Timer</div>
              <div><kbd>M</kbd> - Change Learning Mode</div>
              <div><kbd>Ctrl+C</kbd> - Capture Progress</div>
              <div><kbd>0-9</kbd> - Digital Input</div>
            </div>
          </div>

          {/* Clock Basics */}
          <div className="mb-6 bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-2xl border-2 border-orange-300">
            <h3 className="text-lg font-bold mb-3 text-orange-600">🕐 Clock Basics</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-start">
                <span className="text-2xl mr-2">🥕</span>
                <span><strong>Carrot Hand</strong> = Hour hand (short and fat)</span>
              </p>
              <p className="flex items-start">
                <span className="text-2xl mr-2">🐰</span>
                <span><strong>Rabbit Hand</strong> = Minute hand (long and thin)</span>
              </p>
              <p className="flex items-start">
                <span className="text-2xl mr-2">⏰</span>
                <span><strong>Big Numbers</strong> = Hours (1-12)</span>
              </p>
              <p className="flex items-start">
                <span className="text-2xl mr-2">🎯</span>
                <span><strong>Click Hand</strong> then <strong>Click Number</strong></span>
              </p>
            </div>
          </div>

          {/* Current Status */}
          <div className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-2xl border-2 border-blue-300">
            <h3 className="text-lg font-bold mb-3 text-blue-600">📊 Current Status</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Seeds:</strong> {seedsCollected} 🥕</div>
              <div><strong>Flowers:</strong> {snackTimesUnlocked} 🌸</div>
              <div><strong>Level:</strong> {currentLevel}</div>
              <div><strong>Sound:</strong> {soundEnabled ? '🔊 On' : '🔇 Off'}</div>
              <div><strong>24H:</strong> {is24HourMode ? '🕐 On' : '🕐 Off'}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* NEW: Digital Clock Display */}
      {(viewMode === 'digital' || viewMode === 'both') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 z-30 bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border-4 border-orange-300"
        >
          <h3 className="text-lg font-bold mb-3 text-orange-600">🔢 Digital Clock</h3>
          <input
            type="text"
            value={digitalInput}
            onChange={(e) => setDigitalInput(e.target.value)}
            placeholder="HH:MM"
            className="w-32 px-3 py-2 text-2xl font-bold text-center border-2 border-orange-300 rounded-lg"
            aria-label="Digital time input"
          />
          <div className="mt-2 text-sm text-gray-600">
            Current: {currentHour.toString().padStart(2, '0')}:{currentMinute.toString().padStart(2, '0')}
          </div>
        </motion.div>
      )}

      {/* NEW: 24-Hour Daily Event Display */}
      {is24HourMode && dailyEvent && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-4 left-4 z-30 bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border-4 border-orange-300"
        >
          <h3 className="text-lg font-bold text-orange-600">📅 Daily Event</h3>
          <div className="text-xl font-semibold text-gray-800">{dailyEvent}</div>
        </motion.div>
      )}

      {/* NEW: Progress Capture Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={captureProgress}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all"
        aria-label="Capture Progress Screenshot"
      >
        📸 Capture My Progress
      </motion.button>

      {/* Main Content - Updated for Unified Sidebar */}
      <div className="ml-80 min-h-screen pl-8 pr-8">
        <header className="text-center py-8 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
          >
            🏖️🥕🐰 Garden of Time 🥕🐰🏖️
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-orange-700 font-semibold"
          >
            Learn to Tell Time in Our Sandy Garden! 🕐🌸
          </motion.p>
        </header>

        <main className="max-w-5xl mx-auto py-6">
          {/* Existing Progress Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="cute-card p-8">
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                🌟 Your Garden Progress 🌟
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="progress-item text-center p-6">
                  <div className="text-5xl mb-2">🥕</div>
                  <div className="text-2xl font-bold text-orange-600">{seedsCollected}</div>
                  <div className="text-lg font-semibold text-gray-800">Seeds Collected</div>
                </div>
                <div className="progress-item text-center p-6">
                  <div className="text-5xl mb-2">🌸</div>
                  <div className="text-2xl font-bold text-pink-600">{snackTimesUnlocked}</div>
                  <div className="text-lg font-semibold text-gray-800">Flowers Bloomed</div>
                </div>
                <div className="progress-item text-center p-6">
                  <div className="text-5xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-yellow-600">{currentLevel}</div>
                  <div className="text-lg font-semibold text-gray-800">Garden Level</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Challenge Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="cute-card p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Today's Garden Challenge 🎯
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIs24HourMode(!is24HourMode)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      is24HourMode 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                    aria-label="Toggle 24-hour format"
                  >
                    {is24HourMode ? '24H' : '12H'}
                  </button>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`sound-toggle ${!soundEnabled ? 'muted' : ''}`}
                    aria-label="Toggle sound"
                  >
                    {soundEnabled ? '🔊' : '🔇'}
                  </button>
                </div>
              </div>
              
              <div className="challenge-display text-center text-3xl mb-8">
                Show me: <span className="text-4xl font-bold text-orange-600">{targetTime.displayTime}</span>
                {dailyEvent && <div className="text-lg text-blue-600 mt-2">{dailyEvent}</div>}
              </div>

              {/* Existing Difficulty Selector */}
              <div className="difficulty-selector mb-6">
                {['easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    onClick={() => setCurrentLevel(level)}
                    className={`difficulty-button text-lg px-6 py-3 ${currentLevel === level ? 'active' : ''}`}
                  >
                    {level === 'easy' ? '🌱 Easy' : level === 'medium' ? '🌿 Medium' : '🌳 Hard'}
                  </button>
                ))}
              </div>

              {/* Clock Display - Enhanced with view modes */}
              <div className="flex justify-center mb-8 p-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl border-4 border-orange-300">
                {(viewMode === 'analog' || viewMode === 'both') && (
                  <div className="transform scale-110">
                    <ClockFace 
                      currentHour={currentHour}
                      currentMinute={currentMinute}
                      onTimeChange={handleTimeChange}
                      soundEnabled={soundEnabled}
                      scaffoldingLevel={learningMode === 'scaffolding' ? scaffoldingLevel : null}
                    />
                  </div>
                )}
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex justify-center gap-6">
                <button
                  onClick={handleManualCheck}
                  className="cute-button text-xl px-8 py-4"
                  aria-label="Check my answer"
                >
                  Check My Answer ✅
                </button>
                <button
                  onClick={generateNewChallenge}
                  className="cute-button secondary text-xl px-8 py-4"
                  aria-label="Generate new challenge"
                >
                  New Challenge 🔄
                </button>
                <button
                  onClick={() => startSandTimer()}
                  className="cute-button text-xl px-8 py-4"
                  aria-label="Start sand timer"
                >
                  ⏳ Start Timer
                </button>
              </div>
            </div>
          </motion.div>

          {/* Existing Feedback Messages */}
          {showSuccess && (
            <div className="text-center mb-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="success-message inline-block"
              >
                🌟🥕🐰 Excellent! You collected a seed! 🥕🐰🌟
                {lastCorrectTime && (
                  <div className="text-sm mt-2">
                    Great job showing {lastCorrectTime}!
                  </div>
                )}
                {attempts === 1 && (
                  <div className="text-sm mt-1">✨ Perfect on first try!</div>
                )}
                {learningMode === 'sequencing' && (
                  <div className="text-sm mt-1">📈 Sequencing Progress: Step {sequencingStep}/4</div>
                )}
              </motion.div>
            </div>
          )}

          {showGentleFeedback && (
            <div className="text-center mb-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="gentle-feedback inline-block"
              >
                🌱 Almost there! Try clicking the 🐰 rabbit hand, then a number!
                {attempts > 2 && (
                  <div className="text-sm mt-1">💡 Hint: Click the rabbit, then click where it should go!</div>
                )}
                {learningMode === 'sequencing' && (
                  <div className="text-sm mt-1">📈 Focus on {sequencingStep === 1 ? 'hours only' : sequencingStep === 2 ? 'hours and half-hours' : 'quarter hours'}</div>
                )}
              </motion.div>
            </div>
          )}
        </main>

        {/* Existing Learning Tips */}
        <footer className="max-w-4xl mx-auto mt-12 text-center">
          <div className="learning-card inline-block">
            <h3 className="font-semibold mb-3">🌟🥕🐰 How to Play 🥕🐰🌟</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-1">🥕 Click the Carrot</h4>
                <p className="opacity-80">Then click a number for the hour</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">🐰 Click the Rabbit</h4>
                <p className="opacity-80">Then click a number for minutes</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">🥕🐰 You're Amazing!</h4>
                <p className="opacity-80">Keep practicing - you're doing great!</p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Progress Capture Modal */}
      {showProgressCapture && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowProgressCapture(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-orange-600">📸 Progress Captured!</h3>
            <p className="mb-4">Your progress screenshot has been saved and downloaded.</p>
            <button
              onClick={() => setShowProgressCapture(false)}
              className="cute-button w-full"
            >
              Close ✅
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default App;
