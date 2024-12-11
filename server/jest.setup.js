// Global test setup
jest.setTimeout(10000); // 10 second timeout for tests

// Mock any global dependencies or configurations here
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};
