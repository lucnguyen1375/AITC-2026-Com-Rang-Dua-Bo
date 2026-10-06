import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const installed = process.env.LOCALAPPDATA + '/ms-playwright/chromium-1208/chrome-win64/chrome.exe';
export default defineConfig({
 testDir:'./tests', testMatch:'onboarding-ai.spec.ts', workers:1, timeout:60000, reporter:'list',
 use:{baseURL:'http://127.0.0.1:4175', browserName:'chromium', launchOptions:existsSync(installed)?{executablePath:installed}:{}},
 outputDir:'test-results-onboarding',
});
