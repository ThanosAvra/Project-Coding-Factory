// Test setup file
require('dotenv').config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  // Set test environment variables if not already set
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
  }
  
  if (!process.env.MONGO_TEST_URI) {
    process.env.MONGO_TEST_URI = 'mongodb://localhost:27017/apartment-booking-test';
  }
});

// Suppress console.log during tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
