import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/test-setup.ts'],
    testTimeout: 15000, // Integration tests need more time than unit tests
  },
});
