/**
 * @fileoverview Playwright設定ファイル
 * @module playwright.config
 *
 * EC-271: iPhoneカテゴリページE2Eテスト自動化
 *
 * organization-standards準拠:
 * - HTML/JSON/JUnitレポート出力
 * - 複数ブラウザ対応（Chromium, Firefox, WebKit）
 * - パフォーマンス測定対応
 */

import { defineConfig, devices } from '@playwright/test'

/**
 * 環境変数から設定を取得
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'
const CI = process.env.CI === 'true'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: CI
    ? undefined
    : {
        command: 'echo "Please start frontend and backend servers manually"',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120000,
      },
})

export { BASE_URL, API_BASE_URL }
