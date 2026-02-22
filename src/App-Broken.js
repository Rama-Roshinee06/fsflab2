import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ClockFace from './components/ClockFace';
import { 
  generateTimeChallenge, 
  formatTimeForDisplay, 
  validateTimeMatch, 
  getNextChallenge,
  learningLevels 
} from './utils/GameLogic';

// Gentle chime sound for feedback
const playChime = (frequency = 523.25, duration = 0.3) => {
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

function App() {
  const [currentHour, setCurrentHour] = useState(3);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [targetTime, setTargetTime] = useState({ hour: 3, minute: 0 });
  const [seedsCollected, setSeedsCollected] = useState(0);
  const [snackTimesUnlocked, setSnackTimesUnlocked] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGentleFeedback, setShowGentleFeedback] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(learningLevels[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCorrectTime, setLastCorrectTime] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [showInstructions, setShowInstructions] = useState(true);
  const [attempts, setAttempts] = useState(0);

  // Generate initial challenge
  useEffect(() => {
    generateNewChallenge();
  }, []);

  const generateNewChallenge = useCallback(() => {
    const newChallenge = generateTimeChallenge(difficulty);
    setTargetTime(newChallenge);
    setCurrentHour(newChallenge.hour);
    setCurrentMinute(newChallenge.minute);
    setShowSuccess(false);
    setShowGentleFeedback(false);
    setAttempts(0);
  }, [difficulty]);

  const handleCorrectAnswer = useCallback(() => {
    setSeedsCollected(prev => prev + 1);
    setLastCorrectTime(formatTimeForDisplay(currentHour, currentMinute));
    setShowSuccess(true);
    
    if (soundEnabled) {
      playChime(783.99, 0.6); // G5 note for success
    }

    // Auto-generate next challenge after celebration
    setTimeout(() => {
      generateNewChallenge();
    }, 3000);
  }, [currentHour, currentMinute, soundEnabled, generateNewChallenge]);

  const handleTimeChange = useCallback((timeUpdate) => {
    setCurrentHour(timeUpdate.hour);
    setCurrentMinute(timeUpdate.minute);

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
  }, [targetTime, soundEnabled, handleCorrectAnswer]);

  const handleManualCheck = useCallback(() => {
    setAttempts(prev => prev + 1);
    const isMatch = validateTimeMatch(
      { hour: currentHour, minute: currentMinute },
      targetTime
    );

    if (isMatch) {
      handleCorrectAnswer();
    } else {
      // Gentle feedback - no harsh errors
      setShowGentleFeedback(true);
      if (soundEnabled) {
        playChime(392.00, 0.2); // G4 note for gentle feedback
      }
      
      setTimeout(() => {
        setShowGentleFeedback(false);
      }, 2000);
    }
  }, [currentHour, currentMinute, targetTime, soundEnabled, handleCorrectAnswer]);

  const resetProgress = useCallback(() => {
    setSeedsCollected(0);
    setSnackTimesUnlocked(0);
    setLastCorrectTime(null);
    generateNewChallenge();
  }, [generateNewChallenge]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const changeDifficulty = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
    generateNewChallenge();
  }, [generateNewChallenge]);

  return (
    <div className="min-h-screen bg-vanilla-cream font-rounded text-slate-blue p-4">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-slate-blue mb-2">
          🌿 Garden of Time 🌿
        </h1>
        <p className="text-lg opacity-80">
          Learn to tell time with Carrot and Rabbit!
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-6">
            className="absolute text-4xl opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 15, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🐰
          </motion.div>
        ))}
        
        {/* Floating Stars */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-2xl opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>

      {/* Learning Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-lg shadow-2xl z-20 overflow-y-auto border-r-4 border-pink-300"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-purple-600 flex items-center">
            📚 Learning Corner 📚
          </h2>
          
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
            </div>
          </div>

          {/* How to Read Time */}
          <div className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-2xl border-2 border-green-300">
            <h3 className="text-lg font-bold mb-3 text-green-600">📖 How to Read Time</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Step 1:</strong> Look where 🥕 carrot points</p>
              <p><strong>Step 2:</strong> Look where 🐰 rabbit points</p>
              <p><strong>Step 3:</strong> Say the hour first!</p>
              <p><strong>Step 4:</strong> Then say the minutes!</p>
            </div>
          </div>

          {/* Minute Rules */}
          <div className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-2xl border-2 border-purple-300">
            <h3 className="text-lg font-bold mb-3 text-purple-600">🔢 Minute Rules</h3>
            <div className="space-y-2 text-sm">
              <p><strong>1 = 5 minutes</strong> 🐰 points to 1</p>
              <p><strong>2 = 10 minutes</strong> 🐰 points to 2</p>
              <p><strong>3 = 15 minutes</strong> 🐰 points to 3</p>
              <p><strong>6 = 30 minutes</strong> 🐰 points to 6</p>
              <p><strong>9 = 45 minutes</strong> 🐰 points to 9</p>
              <p><strong>12 = 00 minutes</strong> 🐰 points to 12</p>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="mb-6 bg-gradient-to-r from-pink-100 to-yellow-100 p-4 rounded-2xl border-2 border-pink-300">
            <h3 className="text-lg font-bold mb-3 text-pink-600">✨ Fun Facts!</h3>
            <div className="space-y-2 text-sm">
              <p>🌟 There are 60 minutes in 1 hour!</p>
              <p>🌟 The rabbit hand goes around 12 times for 1 carrot turn!</p>
              <p>🌟 When hands meet, it's snack time! 🥕🐰</p>
              <p>🌟 Practice makes you a time expert! 🎓</p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-blue-100 to-green-100 p-4 rounded-2xl border-2 border-blue-300">
            <h3 className="text-lg font-bold mb-3 text-blue-600">💡 Quick Tips</h3>
            <div className="space-y-2 text-sm">
              <p>👆 Click the hand you want to move</p>
              <p>👆 Then click the number where it should go</p>
              <p>🎯 Match the time shown at the top</p>
              <p>🏆 Collect seeds when you're correct!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content - Shifted right for sidebar */}
      <div className="ml-80 min-h-screen">
        <header className="text-center py-8 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
          >
            🥕🐰 Garden of Time 🥕🐰
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-purple-600 font-semibold"
          >
            Learn to Tell Time with Carrots & Rabbits! 🕐
          </motion.p>
        </header>

        <main className="max-w-6xl mx-auto px-8 py-6">
          {/* Progress Section - Much Larger */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="cute-card p-8">
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                🌟 Your Garden Progress 🌟
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="progress-item text-center p-6">
                  <div className="text-5xl mb-2">🥕</div>
                  <div className="text-2xl font-bold text-orange-600">{seedsCollected}</div>
                  <div className="text-lg font-semibold">Seeds Collected</div>
                </div>
                <div className="progress-item text-center p-6">
                  <div className="text-5xl mb-2">🍎</div>
                  <div className="text-2xl font-bold text-red-600">{snackTimesUnlocked}</div>
                  <div className="text-lg font-semibold">Snack Times</div>
                </div>
                <div className="progress-item text-center p-6">
                  <div className="text-5xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-yellow-600">{currentLevel}</div>
                  <div className="text-lg font-semibold">Current Level</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Challenge Section - Much Larger */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="cute-card p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Today's Challenge 🎯
                </h2>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`sound-toggle ${!soundEnabled ? 'muted' : ''}`}
                >
                  {soundEnabled ? '🔊' : '🔇'}
                </button>
              </div>
              
              <div className="challenge-display text-center text-3xl mb-8">
                Show me: <span className="text-4xl font-bold text-purple-600">{targetTime.displayTime}</span>
              </div>

              {/* Difficulty Selector - Larger */}
              <div className="difficulty-selector mb-6">
                {['easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`difficulty-button text-lg px-6 py-3 ${difficulty === level ? 'active' : ''}`}
                  >
                    {level === 'easy' ? '🌱 Easy' : level === 'medium' ? '🌿 Medium' : '🌳 Hard'}
                  </button>
                ))}
              </div>

              {/* Clock Display - Much Larger */}
              <div className="flex justify-center mb-8">
                <div className="transform scale-125">
                  <ClockFace 
                    currentHour={currentHour}
                    currentMinute={currentMinute}
                    onTimeChange={handleTimeChange}
                    soundEnabled={soundEnabled}
                  />
                </div>
              </div>

              {/* Action Buttons - Larger */}
              <div className="flex justify-center gap-6">
                <button
                  onClick={handleManualCheck}
                  className="cute-button text-xl px-8 py-4"
                >
                  Check My Answer ✅
                </button>
                <button
                  onClick={generateNewChallenge}
                  className="cute-button secondary text-xl px-8 py-4"
                >
                  New Challenge 🔄
                </button>
              </div>
            </div>
          </motion.div>

          {/* Feedback Messages */}
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
              </motion.div>
            </div>
          )}
        </main>

        {/* Learning Tips */}
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
    </div>
  );
}

export default App;