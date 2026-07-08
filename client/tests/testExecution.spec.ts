import { test, expect } from '@playwright/test';
import { ApiTestDetailResponse } from '../src/types/tests.types';

const courseId = 'course-123';
const testId = 'test-456';

const mockTestResponse: ApiTestDetailResponse = {
  id: testId,
  courseId: courseId,
  creatorId: 'creator-789',
  createdAt: new Date().toISOString(),
  title: 'Основи React & Playwright',
  timeLimitMinutes: 2,
  deadline: null,
  maxAttempts: 3,
  nusGroupId: null,
  courseModuleId: null,
  isResultHidden: false,
  isAttemptHidden: false,
  isShowCorrectAnswers: true,
  isShuffleQuestions: false,
  isShuffleAnswers: false,
  isHidden: false,
  questions: [
    {
      id: 'q1',
      testId: testId,
      content: 'Що таке React?',
      type: 'ONE_CHOICE',
      points: 1,
      answers: [
        { id: 'a1', questionId: 'q1', content: 'UI Бібліотека', isCorrect: true },
        { id: 'a2', questionId: 'q1', content: 'База даних', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      testId: testId,
      content: 'Які хуки є вбудованими?',
      type: 'MULTIPLE_CHOICE',
      points: 2,
      answers: [
        { id: 'a3', questionId: 'q2', content: 'useState', isCorrect: true },
        { id: 'a4', questionId: 'q2', content: 'useStore', isCorrect: false },
        { id: 'a5', questionId: 'q2', content: 'useEffect', isCorrect: true },
      ],
    },
  ],
};

test.describe('Проходження тесту (TestExecutionWorkspace)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'fake-jwt-token',
          user: {
            id: 'user-123',
            email: 'test@example.com',
            roles: ['STUDENT'],
            permissions: [],
          },
        }),
      });
    });

    await page.route(`**/api/tests/${testId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockTestResponse),
      });
    });

    await page.route(`**/api/tests/${testId}/submit`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: 'УВІЙТИ', exact: true }).click();

    await page.goto(`/courses/${courseId}/tests/${testId}/execute`);
  });

  test('повинен коректно завантажити тест, відобразити перше питання', async ({ page }) => {
    await expect(page.getByText(mockTestResponse.title, { exact: false })).toBeVisible();

    await expect(page.getByText('Що таке React?')).toBeVisible();
  });

  test('повинен дозволяти обирати відповіді, зберігати стан при навігації та успішно завершувати тест', async ({
    page,
  }) => {
    await page.getByText('UI Бібліотека').click();

    await page.getByRole('button', { name: /Наступне/i }).click();
    await expect(page.getByText('Які хуки є вбудованими?')).toBeVisible();

    await page.getByText('useState').click();
    await page.getByText('useEffect').click();

    await page.getByText('Попереднє').click();
    await expect(page.getByText('Що таке React?')).toBeVisible();

    await page.getByRole('button', { name: /Наступне/i }).click();
    await page.getByText('Завершити тест').click();

    await page.waitForURL(`**/courses/${courseId}/tests/${testId}`);
  });

  test('повинен блокувати кнопку відправки при повільному інтернеті (захист від подвійного кліку)', async ({
    page,
  }) => {
    await page.route(`**/api/tests/${testId}/submit`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.getByText('UI Бібліотека').click();
    await page.getByRole('button', { name: /Наступне/i }).click();
    await page.getByText('useState').click();

    const submitButton = page.getByRole('button', { name: /Завершити тест/i });

    await submitButton.click();

    const loadingButton = page.getByRole('button', { name: /Відправка/i });

    await expect(loadingButton).toBeVisible();
    await expect(loadingButton).toBeDisabled();

    await page.waitForURL(`**/courses/${courseId}/tests/${testId}`, { timeout: 6000 });
  });
});
