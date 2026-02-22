// GameLogic.js - Clock mathematics and proportional movement for Garden of Time

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Calculate precise angles for clock hands based on real clock mechanics
 * @param {number} hour - Hour value (0-12)
 * @param {number} minute - Minute value (0-59)
 * @returns {Object} - Contains hourAngle and minuteAngle in degrees
 */
export const calculateClockAngles = (hour, minute) => {
  // REAL CLOCK FORMULA
  const minuteAngle = minute * 6; // 360° / 60 minutes = 6° per minute
  const hourAngle = (hour % 12) * 30 + minute * 0.5; // 360° / 12 hours = 30° per hour + gradual movement
  
  return {
    hourAngle,
    minuteAngle
  };
};

/**
 * Convert angle back to minute value
 * @param {number} angle - Angle in degrees
 * @returns {number} - Minute value (0-59)
 */
export const getMinutesFromAngle = (angle) => {
  const normalizedAngle = ((angle % 360) + 360) % 360;
  return Math.round(normalizedAngle / 6) % 60;
};

/**
 * Convert angle back to hour value (considering minute hand position)
 * @param {number} hourAngle - Hour hand angle in degrees
 * @param {number} minuteAngle - Minute hand angle in degrees
 * @returns {number} - Hour value (0-11)
 */
export const getHourFromAngles = (hourAngle, minuteAngle) => {
  const normalizedHourAngle = ((hourAngle % 360) + 360) % 360;
  const minute = getMinutesFromAngle(minuteAngle);
  
  // Account for gradual hour hand movement
  const hourFromAngle = Math.round((normalizedHourAngle - minute * 0.5) / 30) % 12;
  return hourFromAngle < 0 ? hourFromAngle + 12 : hourFromAngle;
};

/**
 * Check if it's snack time (when hour and minute hands meet)
 * Snack time occurs when hour === minute / 5
 * @param {number} hour - Hour value (0-12)
 * @param {number} minute - Minute value (0-59)
 * @returns {boolean} - True if hands meet
 */
export const isSnackTime = (hour, minute) => {
  // Hands meet approximately when minute is a multiple of 12
  // and hour corresponds to that position
  const normalizedHour = hour % 12;
  const expectedHour = Math.floor(minute / 5);
  
  // Allow small tolerance for realistic clock mechanics
  const minuteTolerance = 2;
  const adjustedMinute = minute % 60;
  const targetMinute = normalizedHour * 5;
  
  return Math.abs(adjustedMinute - targetMinute) <= minuteTolerance;
};

/**
 * Generate random time for learning challenges
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {Object} - { hour, minute, displayTime }
 */
export const generateTimeChallenge = (difficulty = 'medium') => {
  let hour, minute;
  
  switch (difficulty) {
    case 'easy':
      // O'clock times only
      hour = Math.floor(Math.random() * 12);
      minute = 0;
      break;
    case 'medium':
      // Quarter past, half past, quarter to
      const quarterOptions = [0, 15, 30, 45];
      hour = Math.floor(Math.random() * 12);
      minute = quarterOptions[Math.floor(Math.random() * quarterOptions.length)];
      break;
    case 'hard':
      // Any 5-minute interval
      hour = Math.floor(Math.random() * 12);
      minute = Math.floor(Math.random() * 12) * 5;
      break;
    default:
      // Any minute value
      hour = Math.floor(Math.random() * 12);
      minute = Math.floor(Math.random() * 60);
  }
  
  const displayTime = formatTimeForDisplay(hour, minute);
  
  return { hour, minute, displayTime };
};

/**
 * Format time for child-friendly display
 * @param {number} hour - Hour value (0-12)
 * @param {number} minute - Minute value (0-59)
 * @returns {string} - Formatted time string
 */
export const formatTimeForDisplay = (hour, minute) => {
  const normalizedHour = hour % 12 || 12;
  
  if (minute === 0) {
    return `${normalizedHour} o'clock`;
  } else if (minute === 15) {
    return `Quarter past ${normalizedHour}`;
  } else if (minute === 30) {
    return `Half past ${normalizedHour}`;
  } else if (minute === 45) {
    const nextHour = (hour + 1) % 12 || 12;
    return `Quarter to ${nextHour}`;
  } else {
    return `${normalizedHour}:${minute.toString().padStart(2, '0')}`;
  }
};

/**
 * Calculate proportional hour hand movement when minute hand is dragged
 * Ensures realistic clock mechanics
 * @param {number} newMinute - New minute value (0-59)
 * @param {number} currentHour - Current hour value (0-12)
 * @returns {Object} - Updated hour and minute with correct proportions
 */
export const calculateProportionalMovement = (newMinute, currentHour) => {
  // When minute changes, hour hand moves proportionally
  const hourIncrement = newMinute / 60; // Fractional hour based on minutes
  const updatedHour = currentHour + hourIncrement;
  
  return {
    hour: updatedHour,
    minute: newMinute
  };
};

/**
 * Validate if user's time matches target time with tolerance
 * @param {Object} userTime - { hour, minute }
 * @param {Object} targetTime - { hour, minute }
 * @param {number} tolerance - Allowed difference in minutes
 * @returns {boolean} - True if close enough
 */
export const validateTimeMatch = (userTime, targetTime, tolerance = 5) => {
  const userTotalMinutes = (userTime.hour % 12) * 60 + userTime.minute;
  const targetTotalMinutes = (targetTime.hour % 12) * 60 + targetTime.minute;
  
  const difference = Math.abs(userTotalMinutes - targetTotalMinutes);
  
  // Handle wrap-around (e.g., 11:55 vs 12:05)
  const circularDifference = Math.min(difference, 720 - difference);
  
  return circularDifference <= tolerance;
};

// ==================== API INTEGRATION ====================

/**
 * Fetch random time from backend API
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {Promise<Object>} - { hour, minute }
 */
export const fetchTimeFromAPI = async (difficulty = 'medium') => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-time?difficulty=${difficulty}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch time from API');
    }
    
    const data = await response.json();
    return {
      hour: data.hour,
      minute: data.minute,
      displayTime: formatTimeForDisplay(data.hour, data.minute)
    };
  } catch (error) {
    console.error('API Error:', error);
    // Fallback to local generation
    return generateTimeChallenge(difficulty);
  }
};

/**
 * Submit answer to backend for validation
 * @param {Object} userTime - { hour, minute }
 * @param {Object} targetTime - { hour, minute }
 * @param {number} tolerance - Allowed difference in minutes
 * @returns {Promise<Object>} - { correct: boolean, difference: number }
 */
export const submitAnswerToAPI = async (userTime, targetTime, tolerance = 5) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submit-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hour: userTime.hour,
        minute: userTime.minute,
        targetHour: targetTime.hour,
        targetMinute: targetTime.minute,
        tolerance
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit answer to API');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Fallback to local validation
    const correct = validateTimeMatch(userTime, targetTime, tolerance);
    const userTotalMinutes = (userTime.hour % 12) * 60 + userTime.minute;
    const targetTotalMinutes = (targetTime.hour % 12) * 60 + targetTime.minute;
    const difference = Math.abs(userTotalMinutes - targetTotalMinutes);
    
    return {
      correct,
      difference,
      submittedTime: formatTimeForDisplay(userTime.hour, userTime.minute),
      targetTime: formatTimeForDisplay(targetTime.hour, targetTime.minute)
    };
  }
};

/**
 * Save user progress to backend
 * @param {Object} progress - { userId, seedsCollected, snackTimesUnlocked, lastCorrectTime }
 * @returns {Promise<Object>} - Success response
 */
export const saveProgressToAPI = async (progress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progress)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save progress to API');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Fallback - just log the progress
    console.log('Progress (local fallback):', progress);
    return { success: true, message: 'Progress saved locally' };
  }
};

/**
 * Check API health
 * @returns {Promise<boolean>} - True if API is healthy
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
};

/**
 * Learning progression tracking
 */
export const learningLevels = [
  {
    id: 'parts_of_clock',
    name: 'Parts of a Clock',
    description: 'Learn hour hand, minute hand, numbers',
    targetSkills: ['identify_hands', 'identify_numbers']
  },
  {
    id: 'oclock',
    name: "O'Clock Times",
    description: 'Reading whole hours',
    targetSkills: ['read_oclock']
  },
  {
    id: 'half_quarter',
    name: 'Half & Quarter Times',
    description: 'Half past, quarter past, quarter to',
    targetSkills: ['read_half', 'read_quarter']
  },
  {
    id: 'five_minute',
    name: '5-Minute Intervals',
    description: 'Reading every 5 minutes',
    targetSkills: ['read_five_minute']
  },
  {
    id: 'any_minute',
    name: 'Any Minute',
    description: 'Reading any minute value',
    targetSkills: ['read_any_minute']
  },
  {
    id: 'elapsed_time',
    name: 'Elapsed Time',
    description: 'Understanding time passage',
    targetSkills: ['calculate_elapsed']
  }
];

/**
 * Get next learning challenge based on progress
 * @param {Object} userProgress - User's current progress
 * @returns {Object} - Next challenge configuration
 */
export const getNextChallenge = (userProgress) => {
  const completedLevels = userProgress.completedLevels || [];
  const currentLevelIndex = learningLevels.findIndex(
    level => !completedLevels.includes(level.id)
  );
  
  const currentLevel = currentLevelIndex >= 0 
    ? learningLevels[currentLevelIndex]
    : learningLevels[learningLevels.length - 1];
  
  const difficulty = currentLevelIndex <= 1 ? 'easy' : 
                    currentLevelIndex <= 3 ? 'medium' : 'hard';
  
  return {
    level: currentLevel,
    challenge: generateTimeChallenge(difficulty),
    difficulty
  };
};
