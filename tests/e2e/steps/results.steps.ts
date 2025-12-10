import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on "/results"', async function () {
  await this.page.goto('http://localhost:3000/results/demo-run');
});

Given('I enter {string}', async function (text: string) {
  await this.page.getByTestId('question-input').fill(text);
});

When('I click {string}', async function (label: string) {
  await this.page.getByRole('button', { name: label }).click();
});

Then('the results screen shows the card titled {string}', async function (title: string) {
  await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
});

When('I toggle "Credibility" on', async function () {
  const toggle = this.page.getByLabel('Credibility');
  if (!(await toggle.isChecked())) {
    await toggle.check();
  }
});

Then('I see text starting with "Assumptions"', async function () {
  await expect(this.page.getByText(/Assumptions/)).toBeVisible();
});

Then('I see "Confidence:" on the Quick Take card', async function () {
  const quickTake = this.page.locator('[data-testid="quick-take"]');
  await expect(quickTake.getByText(/Confidence:/)).toBeVisible();
});

Then('the "Quick Take" card shows at most 3 bullets by default', async function () {
  const bullets = this.page.locator('[data-testid="quick-take"] li');
  await expect(bullets).toHaveCount(3);
});

When('I click "Expand" on the "Quick Take" card', async function () {
  await this.page.getByRole('button', { name: /Expand|Collapse/ }).click();
});

Then('I see at least 6 bullets total', async function () {
  const bullets = this.page.locator('[data-testid="quick-take"] li');
  await expect(bullets).toHaveCount(6);
});
