import { expect, test } from '@playwright/test';

test('renders and edits the competence matrix catalog', async ({ page, request }) => {
  await expect
    .poll(
      async () => {
        try {
          return (await request.get('http://127.0.0.1:4000/healthz')).ok();
        } catch {
          return false;
        }
      },
      { timeout: 30_000 },
    )
    .toBe(true);

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Skill catalog', exact: true })).toBeVisible();
  await expect(page.getByText('GraphQL + DB online')).toBeVisible();
  await expect(page.getByRole('treeitem', { name: /Go concurrency/ })).toBeVisible();
  await page.getByRole('treeitem', { name: /Go concurrency/ }).click();
  await expect(page.getByRole('heading', { name: 'Go concurrency', exact: true })).toBeVisible();
  await expect(page.getByText('Go developer')).toBeVisible();
  await expect(page.getByText('Go team lead')).toBeVisible();
  await expect(page.getByText('3 / 5')).toBeVisible();
  await expect(page.getByText('5 / 5')).toBeVisible();

  await page.getByRole('tab', { name: 'Create' }).click();
  await page.locator('#new-folder-name').fill('Runtime');
  await page.getByRole('button', { name: 'Create folder' }).click();
  await expect(page.getByRole('treeitem', { name: /Runtime/ })).toBeVisible();

  await page.locator('#new-skill-name').fill('Profiling');
  await page.locator('#new-skill-description').fill('CPU profiles, traces, and runtime metrics');
  await page.locator('#new-skill-parent').click();
  await page.getByRole('option', { name: 'Runtime' }).click();
  await page.getByRole('button', { name: 'Create skill' }).click();
  await expect(page.getByRole('heading', { name: 'Profiling', exact: true })).toBeVisible();

  await page.locator('#skill-name-skill-profiling').fill('CPU profiling');
  await page.getByRole('button', { name: 'Save skill' }).click();
  await expect(page.getByRole('heading', { name: 'CPU profiling', exact: true })).toBeVisible();

  await page.locator('#mark-value-skill-profiling').fill('4');
  await page.locator('#mark-label-skill-profiling').fill('Advanced');
  await page.getByRole('button', { name: 'Add mark' }).click();
  await expect(page.getByText('Advanced')).toBeVisible();

  await page.getByRole('tab', { name: 'Grades' }).click();
  await page.locator('#new-grade-name').fill('Principal');
  await page.locator('#new-grade-sort').fill('4');
  await page.getByRole('button', { name: 'Create grade' }).click();
  await expect(page.locator('#grade-name-grade-principal')).toHaveValue('Principal');

  await page.getByRole('tab', { name: 'Roles' }).click();
  await page.locator('#new-role-name').fill('Platform architect');
  await page.locator('#new-role-description').fill('Platform-level backend role');
  await page.getByRole('button', { name: 'Create role' }).click();
  await expect(page.locator('#role-name-role-platform-architect')).toHaveValue('Platform architect');

  await page.locator('#role-skill-role').click();
  await page.getByRole('option', { name: 'Platform architect' }).click();
  await page.locator('#role-skill-skill').click();
  await page.getByRole('option', { name: 'CPU profiling' }).click();
  await page.getByRole('button', { name: 'Add skill' }).click();
  await expect(page.locator('#role-skill-sort-role-skill-platform-architect-cpu-profiling')).toBeVisible();

  await page.locator('#target-role-skill').click();
  await page.getByRole('option', { name: 'Platform architect / CPU profiling' }).click();
  await page.locator('#target-grade').click();
  await page.getByRole('option', { name: 'Principal' }).click();
  await page.locator('#target-value').fill('5');
  await page.getByRole('button', { name: 'Set target' }).click();
  await expect(page.locator('#target-row-role-skill-platform-architect-cpu-profiling-grade-principal')).toHaveValue('5');
});
