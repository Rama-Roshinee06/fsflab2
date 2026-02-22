const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to generate random time
const generateRandomTime = () => {
  const hour = Math.floor(Math.random() * 12); // 0-11 (12-hour format)
  const minute = Math.floor(Math.random() * 60); // 0-59
  return { hour, minute };
};

// Helper function to validate time answer
const validateTimeAnswer = (submittedTime, targetTime, tolerance = 5) => {
  const submittedTotalMinutes = (submittedTime.hour % 12) * 60 + submittedTime.minute;
  const targetTotalMinutes = (targetTime.hour % 12) * 60 + targetTime.minute;
  
  const difference = Math.abs(submittedTotalMinutes - targetTotalMinutes);
  
  // Handle wrap-around (e.g., 11:55 vs 12:05)
  const circularDifference = Math.min(difference, 720 - difference);
  
  return circularDifference <= tolerance;
};

// API Endpoints

/**
 * GET /api/generate-time
 * Generates a random time for the clock learning exercise
 * Returns: { hour: number, minute: number }
 */
app.get('/api/generate-time', (req, res) => {
  try {
    const { difficulty = 'medium' } = req.query;
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
    
    res.json({ hour, minute });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate time' });
  }
});

/**
 * POST /api/submit-answer
 * Validates the user's time answer
 * Body: { hour: number, minute: number, targetHour: number, targetMinute: number }
 * Returns: { correct: boolean, difference: number }
 */
app.post('/api/submit-answer', (req, res) => {
  try {
    const { hour, minute, targetHour, targetMinute, tolerance = 5 } = req.body;
    
    if (typeof hour !== 'number' || typeof minute !== 'number' ||
        typeof targetHour !== 'number' || typeof targetMinute !== 'number') {
      return res.status(400).json({ error: 'Invalid time format' });
    }
    
    const submittedTime = { hour, minute };
    const targetTime = { hour: targetHour, minute: targetMinute };
    
    const correct = validateTimeAnswer(submittedTime, targetTime, tolerance);
    
    // Calculate difference for feedback
    const submittedTotalMinutes = (hour % 12) * 60 + minute;
    const targetTotalMinutes = (targetHour % 12) * 60 + targetMinute;
    const difference = Math.abs(submittedTotalMinutes - targetTotalMinutes);
    
    res.json({ 
      correct, 
      difference,
      submittedTime: formatTimeForDisplay(hour, minute),
      targetTime: formatTimeForDisplay(targetHour, targetMinute)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate answer' });
  }
});

/**
 * GET /api/time-challenges
 * Returns multiple time challenges for batch generation
 * Query: count (number of challenges, default 5)
 * Returns: [{ hour, minute }, ...]
 */
app.get('/api/time-challenges', (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5;
    const { difficulty = 'medium' } = req.query;
    
    const challenges = [];
    for (let i = 0; i < count; i++) {
      let hour, minute;
      
      switch (difficulty) {
        case 'easy':
          hour = Math.floor(Math.random() * 12);
          minute = 0;
          break;
        case 'medium':
          const quarterOptions = [0, 15, 30, 45];
          hour = Math.floor(Math.random() * 12);
          minute = quarterOptions[Math.floor(Math.random() * quarterOptions.length)];
          break;
        case 'hard':
          hour = Math.floor(Math.random() * 12);
          minute = Math.floor(Math.random() * 12) * 5;
          break;
        default:
          hour = Math.floor(Math.random() * 12);
          minute = Math.floor(Math.random() * 60);
      }
      
      challenges.push({ hour, minute });
    }
    
    res.json({ challenges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate challenges' });
  }
});

/**
 * POST /api/save-progress
 * Saves user progress (for future use with database)
 * Body: { userId, seedsCollected, snackTimesUnlocked, lastCorrectTime }
 */
app.post('/api/save-progress', (req, res) => {
  try {
    const { userId, seedsCollected, snackTimesUnlocked, lastCorrectTime } = req.body;
    
    // Here you would typically save to a database
    // For now, just return success
    console.log('Progress saved:', { userId, seedsCollected, snackTimesUnlocked, lastCorrectTime });
    
    res.json({ 
      success: true, 
      message: 'Progress saved successfully',
      progress: { userId, seedsCollected, snackTimesUnlocked, lastCorrectTime }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Helper function to format time for display
function formatTimeForDisplay(hour, minute) {
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
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Clock learning API server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/generate-time - Generate random time`);
  console.log(`  POST /api/submit-answer - Validate time answer`);
  console.log(`  GET  /api/time-challenges - Get multiple challenges`);
  console.log(`  POST /api/save-progress - Save user progress`);
  console.log(`  GET  /api/health - Health check`);
});

module.exports = app;
