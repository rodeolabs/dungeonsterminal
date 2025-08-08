import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock external services for testing
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
          }))
        }))
      }))
    }))
  },
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}));

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      chat: {
        completions: {
          create: jest.fn(() => Promise.resolve({
            choices: [{
              message: {
                content: 'Mock AI response for testing'
              }
            }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30
            }
          }))
        }
      }
    }))
  };
});

// Mock Playwright
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn(() => Promise.resolve({
      newPage: jest.fn(() => Promise.resolve({
        goto: jest.fn(),
        click: jest.fn(),
        fill: jest.fn(),
        waitForSelector: jest.fn(),
        evaluate: jest.fn(),
        screenshot: jest.fn(),
        locator: jest.fn(() => ({
          screenshot: jest.fn()
        }))
      })),
      close: jest.fn()
    }))
  }
}));

// Set up global test timeout
jest.setTimeout(30000);

// Console log suppression for tests
if (process.env.SUPPRESS_LOGS === 'true') {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

export {};