import { test, expect } from '@playwright/test';
import { demoProfile } from '../src/data/fixtures';
import { createPlan } from '../src/services/nutrition';

for (const width of [1440, 390]) {
 test(`onboarding ${width}: chọn nhiều đáp án rồi gửi một lượt`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const questions = [
   { field: 'goal', label: 'Mục tiêu của bạn?', placeholder: '', input_type: 'text', options: [{ label: 'Tăng cơ', value: 'gainMuscle' }, { label: 'Duy trì', value: 'maintain' }] },
   { field: 'sex', label: 'Biến thể công thức?', placeholder: '', input_type: 'text', options: [{ label: 'Không cung cấp', value: 'unspecified' }] },
   { field: 'trainingIntensity', label: 'Cường độ tập?', placeholder: '', input_type: 'text', options: [{ label: 'Vừa', value: 'Vừa' }] },
  ];
  await page.addInitScript(questions => {
   localStorage.setItem('bua-viet:v1:ai-onboarding', JSON.stringify({ version: 1, value: { started: true, messages: [{ role: 'assistant', text: 'Chọn các thông tin rồi gửi nhé.' }], turn: { reply: 'Chọn các thông tin rồi gửi nhé.', profile: { age: 25, weightKg: 65, heightCm: 170 }, questions, ready: false, blocked: false } } }));
  }, questions);
  const requests: any[] = [];
  await page.route('**/api/onboarding', async route => {
   requests.push(route.request().postDataJSON());
   await route.fulfill({ json: { reply: 'Bạn tập những ngày nào?', profile: { goal: 'maintain', sex: 'unspecified', trainingIntensity: 'Vừa' }, questions: [{ field: 'weekSchedule', label: 'Lịch tập?', placeholder: '', input_type: 'textarea', options: [] }], ready: false, blocked: false } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Tăng cơ', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tăng cơ', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Duy trì', exact: true }).click();
  await page.getByRole('button', { name: 'Không cung cấp', exact: true }).click();
  await page.getByRole('button', { name: 'Vừa', exact: true }).click();
  expect(requests).toHaveLength(0);
  await expect(page.getByRole('textbox', { name: 'Mục tiêu của bạn?', exact: true })).toHaveValue('maintain');
  await page.getByRole('button', { name: 'Gửi câu trả lời', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Lịch tập?', exact: true })).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].answers).toEqual({ goal: 'maintain', sex: 'unspecified', trainingIntensity: 'Vừa' });
  await page.screenshot({ path: `../../.tmp/onboarding-batch-${width}.png` });
 });
}
for (const size of [{ width: 1440, height: 900 }, { width: 1280, height: 620 }]) {
 test(`workspace ${size.width}x${size.height}: cuộn nội dung giữ nguyên trợ lý`, async ({ page }) => {
  await page.setViewportSize(size);
  const plans = await createPlan(demoProfile);
  await page.addInitScript(({ profile, plans }) => {
   for (const [key, value] of Object.entries({ profile, draft: profile, plans, stage: 'ready', screen: 'plan' })) localStorage.setItem(`bua-viet:v1:${key}`, JSON.stringify({ version: 1, value }));
  }, { profile: demoProfile, plans });
  await page.goto('/');
  await expect(page.locator('.avatar-mount canvas')).toBeVisible();
  const before = await page.locator('.coach-stage').boundingBox();
  const main = page.locator('#main');
  await main.evaluate(el => { el.scrollTop = el.scrollHeight; });
  await main.hover();
  await page.mouse.wheel(0, 5000);
  await page.waitForTimeout(200);
  const geometry = await page.evaluate(() => ({ scrollY, height: innerHeight, pageHeight: document.documentElement.scrollHeight, mainHeight: document.getElementById('main')!.clientHeight, mainScroll: document.getElementById('main')!.scrollTop }));
  await page.screenshot({ path: `../../.tmp/workspace-scroll-${size.width}.png` });
  expect(geometry.scrollY).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 5000));
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(geometry.mainHeight).toBeLessThanOrEqual(geometry.height);
  expect(geometry.mainScroll).toBeGreaterThan(0);
  expect(await page.locator('.coach-stage').boundingBox()).toEqual(before);
  await expect(page.getByRole('button', { name: 'Gửi tin nhắn', exact: true })).toBeInViewport();
  await page.screenshot({ path: `../../.tmp/workspace-scroll-${size.width}.png` });
 });
}
