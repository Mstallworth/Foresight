import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import { setWorldConstructor, setDefaultTimeout, Before, After } from '@cucumber/cucumber';

setDefaultTimeout(60 * 1000);

class ForesightWorld {
  browser?: Browser;
  context?: BrowserContext;
  page!: Page;
}

setWorldConstructor(ForesightWorld);

Before(async function () {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});
