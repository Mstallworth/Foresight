import path from 'path';
import { test, expect } from '@playwright/test';
import { loadConfiguration, loadSupport, runCucumber } from '@cucumber/cucumber/api';

test.describe('BDD specs', () => {
  test('execute feature files', async () => {
    const configuration = await loadConfiguration({
      cwd: path.resolve(__dirname, '..', '..'),
      argv: ['node', 'cucumber-js', '--config', 'cucumber.cjs']
    });

    const support = await loadSupport(configuration);
    const { success } = await runCucumber(configuration, support);
    expect(success).toBe(true);
  });
});

// TODO[codegen]: Add Cucumber + Playwright runner to execute spec/bdd/*.feature.
