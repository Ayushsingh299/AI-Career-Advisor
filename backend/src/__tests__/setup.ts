// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Mock console methods to reduce test output noise
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = (...args) => {
  // Allow logging of test results but suppress application logs
  if (args[0] && typeof args[0] === 'string' && args[0].includes('🤖')) {
    return; // Suppress AI processing logs
  }
  originalConsoleLog(...args);
};

console.warn = (...args) => {
  // Suppress Firebase warnings in tests
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Firebase')) {
    return;
  }
  originalConsoleWarn(...args);
};

console.error = (...args) => {
  // Still show actual errors but suppress expected ones
  if (args[0] === 'Error:' && args[1] && args[1].message && args[1].message.includes('invalid json')) {
    return; // This is expected in our malformed JSON test
  }
  originalConsoleError(...args);
};