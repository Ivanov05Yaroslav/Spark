import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Папка, де лежать ваші .spec.ts файли тестів
  testDir: './tests',

  // Запуск тестів усередині одного файлу паралельно
  fullyParallel: true,

  // Заборона використання test.only на CI серверах
  forbidOnly: !!process.env.CI,

  // Кількість повторних спроб для упавших тестів (на CI робимо 2, локально — 0)
  retries: process.env.CI ? 2 : 0,

  // Кількість потоків (на CI запускаємо в 1 потік для стабільності)
  workers: process.env.CI ? 1 : undefined,

  // Формат звіту про проходження тестів
  reporter: 'html',

  use: {
    /* Змінюємо на localhost, щоб Node.js сам обрав правильний протокол */
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  /* ... інші налаштування ... */

  /* Конфігурація браузерів, у яких будуть ганятися тести */
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
  ],

  webServer: {
    command: 'npm run dev',
    /* Змінюємо на localhost тут також */
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    /* ЗБІЛЬШУЄМО ТАЙМАУТ до 30 або 60 секунд, щоб сервер встиг завантажитись */
    timeout: 30 * 1000,
  },
});
