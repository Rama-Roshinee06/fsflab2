// Enhanced GameLogic.js - Advanced neurodivergent learning algorithms

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Multi-Modal Learning Progression System
 * Based on EdQueries pedagogical strategies for neurodivergent learners
 */

// Sequencing progression levels
export const SEQUENCING_LEVELS = {
  1: {
    name: 'Hours Only',
    description: 'Focus on hour hand positioning',
    tolerance: 30, // 30 minute tolerance
    generateChallenge: () => {
      const hour = Math.floor(Math.random() * 12) + 1;
      return { hour, minute: 0, displayTime: `${hour} o'clock` };
    },
    validate: (userTime, targetTime) => {
      const userHour = userTime.hour % 12 || 12;
      const targetHour = targetTime.hour % 12 || 12;
      return Math.abs(userHour - targetHour) <= 1; // Within 1 hour
    }
  },
  2: {
    name: 'Half Hours',
    description: 'Add half-hour precision',
    tolerance: 15,
    generateChallenge: () => {
      const hour = Math.floor(Math.random() * 12) + 1;
      const minute = Math.random() > 0.5 ? 30 : 0;
      return { hour, minute, displayTime: minute === 0 ? `${hour} o'clock` : `${hour}:30` };
    },
    validate: (userTime, targetTime) => {
      const hourDiff = Math.abs((userTime.hour % 12 || 12) - (targetTime.hour % 12 || 12));
      const minuteDiff = Math.abs(userTime.minute - targetTime.minute);
      return hourDiff <= 1 && minuteDiff <= 15;
    }
  },
  3: {
    name: 'Quarter Hours',
    description: 'Introduce 15 and 45 minute marks',
    tolerance: 7,
    generateChallenge: () => {
      const hour = Math.floor(Math.random() * 12) + 1;
      const minutes = [0, 15, 30, 45];
      const minute = minutes[Math.floor(Math.random() * minutes.length)];
      return { hour, minute, displayTime: minute === 0 ? `${hour} o'clock` : `${hour}:${minute}` };
    },
    validate: (userTime, targetTime) => {
      const hourDiff = Math.abs((userTime.hour % 12 || 12) - (targetTime.hour % 12 || 12));
      const minuteDiff = Math.abs(userTime.minute - targetTime.minute);
      return hourDiff === 0 && minuteDiff <= 7;
    }
  },
  4: {
    name: 'Exact Minutes',
    description: 'Full precision with all minute values',
    tolerance: 2,
    generateChallenge: () => {
      const hour = Math.floor(Math.random() * 12) + 1;
      const minute = Math.floor(Math.random() * 60);
      return { hour, minute, displayTime: `${hour}:${minute.toString().padStart(2, '0')}` };
    },
    validate: (userTime, targetTime) => {
      const hourDiff = Math.abs((userTime.hour % 12 || 12) - (targetTime.hour % 12 || 12));
      const minuteDiff = Math.abs(userTime.minute - targetTime.minute);
      return hourDiff === 0 && minuteDiff <= 2;
    }
  }
};

// Scaffolding levels for gradual complexity introduction
export const SCAFFOLDING_LEVELS = {
  1: {
    name: 'Hour Hand Only',
    description: 'Focus on hour hand without minute hand',
    enabledHands: ['hour'],
    visualAids: true,
    hints: 'Focus on where the carrot (hour hand) points'
  },
  2: {
    name: 'Both Hands',
    description: 'Introduce minute hand with hour hand',
    enabledHands: ['hour', 'minute'],
    visualAids: true,
    hints: 'Now use both carrot (hour) and rabbit (minute) hands'
  },
  3: {
    name: 'Independent Practice',
    description: 'Full clock with minimal guidance',
    enabledHands: ['hour', 'minute'],
    visualAids: false,
    hints: 'You can do it! Use both hands to set the time'
  }
};

// 24-hour to daily event mapping
export const DAILY_EVENTS_24H = {
  6: { event: '🌅 Wake Up', routine: 'Morning routine starts' },
  7: { event: '🍳 Breakfast', routine: 'Time for breakfast' },
  8: { event: '🚌 School', routine: 'School or learning time' },
  9: { event: '📚 Learning', routine: 'Focused learning period' },
  10: { event: '🎯 Activity', routine: 'Activity or exercise time' },
  11: { event: '🧃 Snack', routine: 'Morning snack break' },
  12: { event: '🍽️ Lunch', routine: 'Lunch time' },
  13: { event: '😴 Quiet', routine: 'Quiet time or rest' },
  14: { event: '🎨 Creative', routine: 'Creative activities' },
  15: { event: '🥪 Snack', routine: 'Afternoon snack' },
  16: { event: '🏃 Play', routine: 'Outdoor or active play' },
  17: { event: '🧹 Cleanup', routine: 'Tidy up time' },
  18: { event: '👨‍👩‍👧‍👦 Family', routine: 'Family time' },
  19: { event: '🍽️ Dinner', routine: 'Dinner time' },
  20: { event: '🛁 Bath', routine: 'Bath time' },
  21: { event: '📖 Story', routine: 'Story time' },
  22: { event: '🌙 Bedtime', routine: 'Bedtime routine' }
};

/**
 * Generate adaptive challenge based on learner performance
 */
export const generateAdaptiveChallenge = (performanceHistory, learningMode, currentLevel) => {
  const successRate = performanceHistory.slice(-10).filter(attempt => attempt.success).length / Math.min(performanceHistory.length, 10);
  
  if (learningMode === 'sequencing') {
    // Adjust sequencing level based on performance
    if (successRate > 0.8 && currentLevel < 4) {
      return SEQUENCING_LEVELS[currentLevel + 1].generateChallenge();
    } else if (successRate < 0.5 && currentLevel > 1) {
      return SEQUENCING_LEVELS[currentLevel - 1].generateChallenge();
    }
    return SEQUENCING_LEVELS[currentLevel].generateChallenge();
  }
  
  // Standard difficulty adjustment
  if (successRate > 0.9) {
    return generateTimeChallenge('hard');
  } else if (successRate < 0.4) {
    return generateTimeChallenge('easy');
  }
  return generateTimeChallenge('medium');
};

/**
 * Enhanced validation with pedagogical feedback
 */
export const validateWithFeedback = (userTime, targetTime, learningMode, currentLevel) => {
  const isCorrect = validateTimeMatch(userTime, targetTime);
  
  let feedback = {
    success: isCorrect,
    message: '',
    hints: [],
    nextSteps: []
  };

  if (isCorrect) {
    feedback.message = '🌟 Perfect! You got it right!';
    feedback.nextSteps = learningMode === 'sequencing' && currentLevel < 4 
      ? ['Ready for the next challenge level!'] 
      : ['Keep practicing to improve your skills!'];
  } else {
    const hourDiff = Math.abs((userTime.hour % 12 || 12) - (targetTime.hour % 12 || 12));
    const minuteDiff = Math.abs(userTime.minute - targetTime.minute);
    
    if (learningMode === 'sequencing') {
      const level = SEQUENCING_LEVELS[currentLevel];
      if (hourDiff > 1) {
        feedback.message = '🥕 Check your hour hand - the carrot needs to point to the right hour';
        feedback.hints = [level.hints];
      } else if (currentLevel > 1 && minuteDiff > level.tolerance) {
        feedback.message = '🐰 Check your minute hand - the rabbit needs adjustment';
        feedback.hints = ['Remember: each number represents 5 minutes for the rabbit hand'];
      } else {
        feedback.message = '🌱 Very close! Try a small adjustment';
      }
    } else {
      if (hourDiff > 1) {
        feedback.message = '🥕 Check your hour hand position';
      } else if (minuteDiff > 5) {
        feedback.message = '🐰 Check your minute hand position';
      } else {
        feedback.message = '🌱 Almost there! Make a small adjustment';
      }
    }
  }

  return feedback;
};

/**
 * Calculate precise angles for clock hands based on real clock mechanics
 */
export const calculateClockAngles = (hour, minute) => {
  const minuteAngle = minute * 6; // 360° / 60 minutes = 6° per minute
  const hourAngle = (hour % 12) * 30 + minute * 0.5; // 360° / 12 hours = 30° per hour + gradual movement
  
  return {
    hourAngle,
    minuteAngle
  };
};

/**
 * Convert angle back to minute value
 */
export const getMinutesFromAngle = (angle) => {
  const normalizedAngle = ((angle % 360) + 360) % 360;
  return Math.round(normalizedAngle / 6) % 60;
};

/**
 * Convert angle back to hour value (considering minute hand position)
 */
export const getHourFromAngles = (hourAngle, minuteAngle) => {
  const normalizedHourAngle = ((hourAngle % 360) + 360) % 360;
  const minute = getMinutesFromAngle(minuteAngle);
  
  const hourFromAngle = Math.round((normalizedHourAngle - minute * 0.5) / 30) % 12;
  return hourFromAngle < 0 ? hourFromAngle + 12 : hourFromAngle;
};

/**
 * Check if it's snack time (when hour and minute hands meet)
 */
export const isSnackTime = (hour, minute) => {
  return Math.abs((hour % 12) * 30 - minute * 6) < 3;
};

/**
 * Generate time challenge based on difficulty
 */
export const generateTimeChallenge = (difficulty = 'easy') => {
  const challenges = {
    easy: () => {
      const hour = Math.floor(Math.random() * 12) + 1;
      const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      return { hour, minute, displayTime: minute === 0 ? `${hour} o'clock` : `${hour}:${minute}` };
    },
    medium: () => {
      const hour = Math.floor(Math.random() * 12) + 1;
      const minute = Math.floor(Math.random() * 12) * 5; // Multiples of 5
      return { hour, minute, displayTime: `${hour}:${minute.toString().padStart(2, '0')}` };
    },
    hard: () => {
      const hour = Math.floor(Math.random() * 12) + 1;
      const minute = Math.floor(Math.random() * 60);
      return { hour, minute, displayTime: `${hour}:${minute.toString().padStart(2, '0')}` };
    }
  };

  return challenges[difficulty]();
};

/**
 * Validate time match with tolerance
 */
export const validateTimeMatch = (userTime, targetTime, tolerance = 2) => {
  const hourMatch = (userTime.hour % 12 || 12) === (targetTime.hour % 12 || 12);
  const minuteMatch = Math.abs(userTime.minute - targetTime.minute) <= tolerance;
  return hourMatch && minuteMatch;
};

/**
 * Format time for display
 */
export const formatTimeForDisplay = (hour, minute, is24Hour = false) => {
  if (is24Hour) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
  
  const displayHour = hour % 12 || 12;
  if (minute === 0) {
    return `${displayHour} o'clock`;
  }
  return `${displayHour}:${minute.toString().padStart(2, '0')}`;
};

/**
 * Convert 12-hour to 24-hour format
 */
export const convertTo24Hour = (hour12, minute, isPM = false) => {
  if (hour12 === 12) {
    return isPM ? 12 : 0;
  }
  return isPM ? hour12 + 12 : hour12;
};

/**
 * Convert 24-hour to 12-hour format
 */
export const convertTo12Hour = (hour24) => {
  return hour24 % 12 || 12;
};

/**
 * Get daily event for 24-hour time
 */
export const getDailyEvent = (hour24, minute) => {
  const event = DAILY_EVENTS_24H[hour24];
  if (!event) return null;
  
  // Check if within 15 minutes of the event time
  if (minute <= 15) {
    return { ...event, isNear: true };
  }
  return { ...event, isNear: false };
};

/**
 * Calculate learning progress metrics
 */
export const calculateProgressMetrics = (performanceHistory) => {
  if (performanceHistory.length === 0) {
    return {
      successRate: 0,
      averageAttempts: 0,
      improvementTrend: 'stable',
      currentStreak: 0,
      bestStreak: 0
    };
  }

  const recentAttempts = performanceHistory.slice(-20);
  const successRate = recentAttempts.filter(attempt => attempt.success).length / recentAttempts.length;
  const averageAttempts = recentAttempts.reduce((sum, attempt) => sum + attempt.attempts, 0) / recentAttempts.length;
  
  // Calculate improvement trend
  const firstHalf = recentAttempts.slice(0, Math.floor(recentAttempts.length / 2));
  const secondHalf = recentAttempts.slice(Math.floor(recentAttempts.length / 2));
  
  const firstHalfSuccess = firstHalf.filter(attempt => attempt.success).length / firstHalf.length;
  const secondHalfSuccess = secondHalf.filter(attempt => attempt.success).length / secondHalf.length;
  
  let improvementTrend = 'stable';
  if (secondHalfSuccess > firstHalfSuccess + 0.1) improvementTrend = 'improving';
  else if (secondHalfSuccess < firstHalfSuccess - 0.1) improvementTrend = 'declining';
  
  // Calculate streaks
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  for (const attempt of performanceHistory) {
    if (attempt.success) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  currentStreak = tempStreak;
  
  return {
    successRate: Math.round(successRate * 100),
    averageAttempts: Math.round(averageAttempts * 10) / 10,
    improvementTrend,
    currentStreak,
    bestStreak
  };
};

/**
 * API Integration Functions
 */
export const fetchTimeFromAPI = async (difficulty) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-time?difficulty=${difficulty}`);
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching time from API:', error);
    return generateTimeChallenge(difficulty);
  }
};

export const submitAnswerToAPI = async (answer) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submit-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answer)
    });
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.error('Error submitting answer to API:', error);
    return { correct: validateTimeMatch(answer.userTime, answer.targetTime) };
  }
};

export const saveProgressToAPI = async (progress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress)
    });
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.error('Error saving progress to API:', error);
    return { success: true, message: 'Progress saved locally' };
  }
};

/**
 * Accessibility helpers
 */
export const getAriaLabelForTime = (hour, minute, is24Hour = false) => {
  const hour12 = convertTo12Hour(hour);
  const period = hour >= 12 ? 'PM' : 'AM';
  
  if (is24Hour) {
    return `${hour} hours and ${minute} minutes`;
  }
  
  if (minute === 0) {
    return `${hour12} o'clock ${period}`;
  }
  
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

export const getKeyboardInstructions = (learningMode, scaffoldingLevel) => {
  const baseInstructions = [
    'Use arrow keys to adjust clock hands',
    'Press Space to toggle between analog and digital views',
    'Press S to start the sand timer',
    'Press C with Ctrl to capture progress'
  ];
  
  if (learningMode === 'sequencing') {
    baseInstructions.push('Press M to cycle through sequencing levels');
  }
  
  if (scaffoldingLevel === 1) {
    baseInstructions.push('Only hour hand is available in this level');
  }
  
  return baseInstructions;
};
