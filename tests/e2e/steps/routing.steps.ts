import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on "/"', async function () {
  await this.page.goto('http://localhost:3000/');
});

When('I click the card titled {string}', async function (title: string) {
  await this.page.getByRole('button', { name: title }).click();
});

Then('I should see a loader with text {string}', async function (text: string) {
  await expect(this.page.getByText(text)).toBeVisible();
});

Then(
  'within {int} seconds I should be on the {string} screen',
  async function (sec: number, path: string) {
    await this.page.waitForURL(`**${path}**`, { timeout: sec * 1000 });
  }
);
