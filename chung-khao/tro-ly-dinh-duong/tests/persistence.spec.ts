import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

for (const [device, width, height] of [['desktop', 1440, 1000]] as const) {
 test(`${device}: nhập dở, lưu JSON, sửa bữa, hồ sơ và xóa dữ liệu`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width, height });
  await page.goto('/');
  const chat = page.getByRole('complementary', { name: 'Trò chuyện với trợ lý Vi' });
  await chat.getByRole('textbox', { name: 'Tin nhắn cho Vi' }).fill('25 tuổi, 65 kg, 170 cm');
  await chat.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click();
  await page.reload();
  await expect(chat.getByRole('button', { name: 'Không cung cấp', exact: true })).toBeVisible();
  await expect(chat.getByText('25 tuổi, 65 kg, 170 cm', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Muốn tự nhập? Mở biểu mẫu' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Cân nặng' })).toHaveValue('65');
  await page.getByRole('spinbutton', { name: 'Cân nặng' }).fill('68');
  await page.reload();
  await expect(page.getByRole('spinbutton', { name: 'Cân nặng' })).toHaveValue('68');
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: 'Tạo kế hoạch tham khảo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Kế hoạch để bạn thống nhất' })).toBeVisible();
  await page.getByRole('button', { name: 'Đồng ý kế hoạch', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Kế hoạch của bạn' })).toBeVisible();
  await page.getByRole('button', { name: 'Thêm bữa ăn', exact: true }).click();
  await page.getByRole('button', { name: 'Thử với bữa mẫu' }).click();
  await page.getByRole('spinbutton', { name: 'Khối lượng Cơm trắng (g)' }).fill('250');
  await page.reload();
  await expect(page.getByRole('spinbutton', { name: 'Khối lượng Cơm trắng (g)' })).toHaveValue('250');
  await page.getByRole('button', { name: 'Ghi nhận bữa ăn', exact: true }).click();
  await page.getByRole('button', { name: 'Về kế hoạch', exact: true }).click();
  await expect(page.getByText('1 bữa', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sửa Bữa trưa', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Sửa bữa ăn' })).toBeVisible();
  await page.getByRole('spinbutton', { name: 'Khối lượng Cơm trắng (g)' }).fill('300');
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await page.getByRole('button', { name: 'Về kế hoạch', exact: true }).click();
  await page.reload();
  await expect(page.getByText('1 bữa', { exact: true })).toBeVisible();
  const entries = await page.evaluate(() => JSON.parse(localStorage.getItem('bua-viet:v1:entries')!).value);
  expect(entries).toHaveLength(1);
  expect(entries[0].analysis.items.find((item: { id: string }) => item.id === 'rice').grams).toBe(300);
  await page.getByRole('button', { name: 'Sửa hồ sơ', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Cân nặng' }).fill('70');
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: 'Tạo kế hoạch tham khảo', exact: true }).click();
  await expect(page.getByText('1 bữa', { exact: true })).toBeVisible();
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('bua-viet:v1:profile')!).value.weightKg)).toBe(70);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Tải bản JSON', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('bua-viet.json');
  await expect(page.locator('.avatar-mount canvas')).toBeVisible();
  await page.screenshot({ path: `test-results/storage-${device}.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Xóa dữ liệu', exact: true }).click();
  await expect(page.getByText('1 bữa', { exact: true })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Xóa dữ liệu', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Làm quen một chút. Lên kế hoạch cùng Vi.' })).toBeVisible();
  await expect(chat.locator('.message')).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem('bua-viet:v1:profile'))).toBeNull();
  expect(errors).toEqual([]);
 });
}

test('JSON hỏng không làm giao diện ngừng hoạt động', async ({ page }) => {
 await page.goto('/');
 await page.evaluate(() => {
  localStorage.setItem('bua-viet:v1:profile', '{invalid');
  localStorage.setItem('bua-viet:v1:chat-messages', JSON.stringify({ version: 1, value: 3 }));
 });
 await page.reload();
 await expect(page.getByRole('textbox', { name: 'Tin nhắn cho Vi' })).toBeVisible();
 await expect(page.locator('.message')).toHaveCount(1);
});

test('Bộ nhớ bị chặn vẫn báo lỗi và cho tải dữ liệu mới bằng JSON', async ({ page }) => {
 await page.goto('/');
 await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage blocked', 'QuotaExceededError'); }; });
 await page.getByRole('button', { name: 'Muốn tự nhập? Mở biểu mẫu' }).click();
 await page.getByRole('button', { name: 'Thử hồ sơ mẫu' }).click();
 await page.getByRole('button', { name: 'Đồng ý kế hoạch', exact: true }).click();
 await expect(page.getByRole('alert')).toContainText('Chưa lưu được trên thiết bị');
 const pendingDownload = page.waitForEvent('download');
 await page.getByRole('button', { name: 'Tải bản JSON', exact: true }).click();
 const download = await pendingDownload;
 const backup = JSON.parse(await readFile((await download.path())!, 'utf-8'));
 expect(backup.data.profile.value.weightKg).toBe(65);
 expect(backup.data.plans.value).toHaveLength(7);
});
