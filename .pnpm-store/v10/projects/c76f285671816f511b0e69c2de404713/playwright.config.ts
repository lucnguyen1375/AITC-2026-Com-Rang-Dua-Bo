import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const installed = process.env.LOCALAPPDATA + '/ms-playwright/chromium-1208/chrome-win64/chrome.exe';
export default defineConfig({testDir:'./tests',fullyParallel:false,workers:1,reporter:'list',use:{baseURL:'http://127.0.0.1:5173',browserName:'chromium',launchOptions:existsSync(installed)?{executablePath:installed}:{}},webServer:{command:'pnpm dev --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},outputDir:'test-results'});
