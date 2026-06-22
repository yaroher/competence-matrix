import { expect, test } from '@playwright/test';

test('renders the MVP competence matrix slice', async ({ page, request }) => {
  await expect
    .poll(async () => (await request.get('http://127.0.0.1:4000/healthz')).ok(), { timeout: 30_000 })
    .toBe(true);

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Backend Go Engineer / Senior', exact: true })).toBeVisible();
  await expect(page.getByText('Organization-owned IT tree')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Backend API contract design', exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Assessment scores by source' })).toBeVisible();
  await expect(page.getByText('Plan items')).toBeVisible();
});
