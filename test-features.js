// Feature Testing Script for Enhanced Garden of Time
// Run this in browser console to test all features

console.log('🧪 Testing Enhanced Garden of Time Features...\n');

// Test 1: Check if enhanced components are loaded
const testComponents = () => {
  console.log('📦 Component Check:');
  
  // Check for enhanced App component
  const appElement = document.querySelector('.min-h-screen');
  if (appElement) {
    console.log('✅ App component loaded');
  } else {
    console.log('❌ App component not found');
  }
  
  // Check for learning mode controls
  const learningModePanel = document.querySelector('button[aria-label*="Learning"]');
  if (learningModePanel) {
    console.log('✅ Learning mode controls found');
  } else {
    console.log('❌ Learning mode controls not found');
  }
  
  // Check for view mode controls
  const viewModePanel = document.querySelector('button[aria-label*="View"]');
  if (viewModePanel) {
    console.log('✅ View mode controls found');
  } else {
    console.log('❌ View mode controls not found');
  }
};

// Test 2: Check keyboard event listeners
const testKeyboardEvents = () => {
  console.log('\n⌨️ Keyboard Events Test:');
  
  // Simulate spacebar press
  const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
  document.dispatchEvent(spaceEvent);
  console.log('✅ Spacebar event dispatched');
  
  // Simulate 'S' key press
  const sEvent = new KeyboardEvent('keydown', { key: 's' });
  document.dispatchEvent(sEvent);
  console.log('✅ Sand timer event dispatched');
  
  // Simulate 'M' key press
  const mEvent = new KeyboardEvent('keydown', { key: 'm' });
  document.dispatchEvent(mEvent);
  console.log('✅ Mode switch event dispatched');
};

// Test 3: Check drag and drop functionality
const testDragDrop = () => {
  console.log('\n🖱️ Drag & Drop Test:');
  
  const clockHands = document.querySelectorAll('svg line[stroke="#FF8C42"], svg line[stroke="#F472B6"]');
  if (clockHands.length >= 2) {
    console.log('✅ Clock hands found for drag testing');
    clockHands.forEach((hand, index) => {
      const color = hand.getAttribute('stroke');
      console.log(`   Hand ${index + 1}: ${color === '#FF8C42' ? 'Carrot (Hour)' : 'Rabbit (Minute)'}`);
    });
  } else {
    console.log('❌ Clock hands not found');
  }
};

// Test 4: Check learning modes
const testLearningModes = () => {
  console.log('\n🎯 Learning Modes Test:');
  
  const modeButtons = document.querySelectorAll('button[aria-label*="Mode"]');
  console.log(`✅ Found ${modeButtons.length} learning mode buttons`);
  
  modeButtons.forEach(button => {
    console.log(`   - ${button.textContent.trim()}`);
  });
};

// Test 5: Check view modes
const testViewModes = () => {
  console.log('\n👁️ View Modes Test:');
  
  const viewButtons = document.querySelectorAll('button[aria-label*="View"]');
  console.log(`✅ Found ${viewButtons.length} view mode buttons`);
  
  viewButtons.forEach(button => {
    console.log(`   - ${button.textContent.trim()}`);
  });
};

// Test 6: Check sand timer functionality
const testSandTimer = () => {
  console.log('\n⏳ Sand Timer Test:');
  
  const sandTimerButton = document.querySelector('button[aria-label*="Start sand timer"]');
  if (sandTimerButton) {
    console.log('✅ Sand timer button found');
  } else {
    console.log('❌ Sand timer button not found');
  }
};

// Test 7: Check progress capture
const testProgressCapture = () => {
  console.log('\n📸 Progress Capture Test:');
  
  const captureButton = document.querySelector('button[aria-label*="Capture Progress"]');
  if (captureButton) {
    console.log('✅ Progress capture button found');
  } else {
    console.log('❌ Progress capture button not found');
  }
};

// Test 8: Check accessibility features
const testAccessibility = () => {
  console.log('\n♿ Accessibility Test:');
  
  const ariaElements = document.querySelectorAll('[aria-label]');
  console.log(`✅ Found ${ariaElements.length} elements with ARIA labels`);
  
  const keyboardNavigable = document.querySelectorAll('button[tabindex="0"], button[tabindex="-1"]');
  console.log(`✅ Found ${keyboardNavigable.length} keyboard-navigable elements`);
};

// Run all tests
const runAllTests = () => {
  console.log('🚀 Starting Feature Tests...\n');
  
  testComponents();
  testKeyboardEvents();
  testDragDrop();
  testLearningModes();
  testViewModes();
  testSandTimer();
  testProgressCapture();
  testAccessibility();
  
  console.log('\n🎉 Feature Testing Complete!');
  console.log('\n📋 Manual Testing Checklist:');
  console.log('1. Try dragging clock hands');
  console.log('2. Press Spacebar to toggle views');
  console.log('3. Press S to start sand timer');
  console.log('4. Press M to cycle learning modes');
  console.log('5. Click learning mode buttons');
  console.log('6. Try 24-hour mode toggle');
  console.log('7. Test progress capture');
  console.log('8. Navigate with Tab key');
};

// Auto-run tests
runAllTests();

// Make testing function available globally
window.testEnhancedFeatures = runAllTests;
console.log('\n💡 Type testEnhancedFeatures() in console to re-run tests');
