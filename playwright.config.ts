import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', outputDir: 'test-results', use: { baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev -- --hostname 127.0.0.1 --port 3100', url: 'http://127.0.0.1:3100', reuseExistingServer: false, env: { LOCAL_SYNTHETIC_MODE: 'true', NODE_ENV: 'development' }, timeout: 120_000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 }, browserName: 'chromium' } }
  ]
});
