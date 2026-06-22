import { expect, test } from '@playwright/test';

test('opens the people and org admin screen', async ({ page, request }) => {
  await expect
    .poll(async () => (await request.get('http://127.0.0.1:4000/healthz')).ok(), { timeout: 30_000 })
    .toBe(true);

  await page.goto('/');

  await page.getByRole('button', { name: 'Admin', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Platform Engineering', exact: true })).toBeVisible();
  await expect(page.getByText('Site Reliability')).toBeVisible();
  await expect(page.getByRole('heading', { name: /records/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Alexey Morozov/ })).toBeVisible();

  await page.getByRole('button', { name: /Marina Volkova/ }).click();
  await expect(page.getByRole('heading', { name: 'Marina Volkova', exact: true })).toBeVisible();
});
