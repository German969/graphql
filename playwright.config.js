import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for exercise E2E tests.
 * Starts the client automatically. Requires server on port 4000 (run: cd server && npm run dev).
 */
export default defineConfig({
  testDir: './exercises',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'cd client && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  timeout: 15000,
})
