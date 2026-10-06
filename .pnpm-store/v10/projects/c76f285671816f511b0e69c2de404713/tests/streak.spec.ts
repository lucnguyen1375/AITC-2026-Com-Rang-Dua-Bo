import { test, expect } from '@playwright/test';
import path from 'node:path';
import { starterCheckIns, streakSummary } from '../src/services/streak';
import type { CheckIns } from '../src/types';

test('Streak nối ngày qua tháng/năm, giữ chuỗi hôm qua và bỏ qua ngày tương lai', () => {
  const checkIns: CheckIns = {
    '2025-12-30': { nutrition: true, training: true },
    '2025-12-31': { nutrition: true, training: true },
    '2026-01-01': { nutrition: true, training: true },
    '2026-01-02': { nutrition: true, training: false },
    '2026-01-03': { nutrition: true, training: true },
  };
  expect(streakSummary(checkIns, new Date(2026, 0, 2))).toEqual({ current: 3, longest: 3, completed: 3 });
  expect(streakSummary(checkIns, new Date(2026, 0, 4))).toEqual({ current: 1, longest: 3, completed: 4 });
  expect(streakSummary(checkIns, new Date(2026, 0, 5))).toEqual({ current: 0, longest: 3, completed: 4 });
  expect(streakSummary({}, new Date(2026, 0, 5))).toEqual({ current: 0, longest: 0, completed: 0 });
  const weekBoundary = { '2026-10-04': { nutrition: true, training: true }, '2026-10-05': { nutrition: true, training: true } };
  expect(streakSummary(weekBoundary, new Date(2026, 9, 5)).current).toBe(2);
  const starter = starterCheckIns(new Date(2026, 9, 5));
  expect(streakSummary(starter, new Date(2026, 9, 5))).toEqual({ current: 3, longest: 3, completed: 3 });
  expect(starter['2026-10-05']).toBeUndefined();
});

for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]] as const) {
  test(`${name}: tick bổ sung, phục hồi, mốc mới, sửa tick và xóa phiên`, async ({ page }) => {
    test.setTimeout(60_000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.clock.install({ time: new Date('2026-10-08T12:00:00+07:00') });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const chat = page.getByRole('complementary', { name: 'Trò chuyện với trợ lý Vi' });
    await chat.getByRole('textbox', { name: 'Tin nhắn cho Vi' }).fill('25 tuổi, 65 kg, 170 cm');
    await chat.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click();
    for (const label of ['Không cung cấp', 'Tăng cơ', 'Tập sức mạnh', 'Vừa']) await chat.getByRole('button', { name: label, exact: true }).click();
    await chat.getByRole('button', { name: 'Thứ Hai', exact: true }).click();
    await chat.getByRole('button', { name: 'Thứ Ba', exact: true }).click();
    await chat.getByRole('button', { name: 'Xác nhận lịch tập' }).click();
    await chat.getByRole('button', { name: 'Đồng ý kế hoạch', exact: true }).click();
    const tracker = page.getByRole('region', { name: '3 ngày giữ lửa' });
    await expect(tracker).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Tập luyện Thứ Hai', exact: true })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Phục hồi Thứ Tư', exact: true })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Dinh dưỡng Thứ Năm', exact: true })).not.toBeChecked();
    await page.getByRole('checkbox', { name: 'Dinh dưỡng Thứ Năm', exact: true }).check();
    await expect(page.getByRole('heading', { name: '3 ngày giữ lửa' })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Phục hồi Thứ Năm', exact: true }).check();
    await expect(page.getByRole('heading', { name: '4 ngày giữ lửa' })).toBeVisible();
    await expect(page.locator('.streak-celebration')).toContainText('4 ngày liên tiếp');
    await expect(page.getByRole('checkbox', { name: 'Dinh dưỡng Thứ Sáu', exact: true })).toBeDisabled();
    await expect(page.locator('.streak-milestones .unlocked')).toHaveCount(2);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.locator('.streak-tracker').screenshot({ path: path.resolve(`../../.impeccable/review/streak-${name}.png`) });
    await page.evaluate(() => { window.scrollTo(0, 0); document.getElementById('main')?.scrollTo(0, 0); });
    await page.screenshot({ path: path.resolve(`../../.impeccable/review/streak-${name}-page.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Đóng lời động viên' }).click();
    const nav = page.getByRole('navigation', { name: 'Điều hướng chính' });
    await nav.getByRole('button', { name: 'Hồ sơ', exact: true }).click();
    await nav.getByRole('button', { name: 'Kế hoạch', exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Phục hồi Thứ Năm', exact: true })).toBeChecked();
    await expect(page.locator('.streak-celebration')).toBeEmpty();
    await page.getByRole('checkbox', { name: 'Tập luyện Thứ Ba', exact: true }).uncheck();
    await expect(page.getByRole('heading', { name: '2 ngày giữ lửa' })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Tập luyện Thứ Ba', exact: true }).check();
    await expect(page.locator('.streak-celebration')).toContainText('Thêm một ngày được ghi nhận');
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /^Xóa dữ liệu/ }).click();
    await expect(page.locator('.onboarding-screen')).toBeVisible();
    await expect(page.locator('.streak-tracker')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
