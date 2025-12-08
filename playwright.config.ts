import { defineConfig, devices } from '@playwright/test';

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const shouldStartServer = !process.env.PLAYWRIGHT_SKIP_WEB_SERVER;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${DEFAULT_PORT}`;

export default defineConfig({
  testDir: './playwright',
  timeout: 60 * 1000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    headless: true,
  },
  webServer: shouldStartServer
    ? {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        env: {
          ...process.env,
          PORT: String(DEFAULT_PORT),
        },
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
