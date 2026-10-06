import { dateKey } from '../data/fixtures';
import type { CheckIns } from '../types';

export const streakMilestones = [1, 3, 7, 14, 30];
export function starterCheckIns(today = new Date()): CheckIns {
  const cursor = new Date(today);
  cursor.setHours(12, 0, 0, 0);
  const checkIns: CheckIns = {};
  for (let day = 0; day < 3; day++) {
    cursor.setDate(cursor.getDate() - 1);
    checkIns[dateKey(cursor)] = { nutrition: true, training: true };
  }
  return checkIns;
}
export function isDayComplete(checkIns: CheckIns, key: string) {
  return Boolean(checkIns[key]?.nutrition && checkIns[key]?.training);
}

// Calendar arithmetic keeps consecutive days correct across month/year and DST boundaries.
export function streakSummary(checkIns: CheckIns, today = new Date()) {
  const todayKey = dateKey(today);
  const completed = Object.keys(checkIns).filter(key => key <= todayKey && isDayComplete(checkIns, key)).sort();
  let longest = 0;
  let run = 0;
  let previous = '';
  for (const key of completed) {
    const [year, month, day] = key.split('-').map(Number);
    const yesterday = new Date(year, month - 1, day, 12);
    yesterday.setDate(yesterday.getDate() - 1);
    run = dateKey(yesterday) === previous ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = key;
  }
  const cursor = new Date(today);
  cursor.setHours(12, 0, 0, 0);
  // Today's unfinished check-in does not break yesterday's streak until the day ends.
  if (!isDayComplete(checkIns, todayKey)) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (isDayComplete(checkIns, dateKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { current, longest, completed: completed.length };
}

export function streakEncouragement(days: number) {
  const messages: Record<number, string> = {
    1: 'Bạn đã nhóm lửa! Một ngày chăm sóc bản thân là bước khởi đầu đáng tự hào.',
    3: 'Ba ngày giữ nhịp! Những bước nhỏ đang tạo nên một thói quen bền vững.',
    7: 'Trọn một tuần giữ lửa! Bạn đã dành thời gian cho bản thân mỗi ngày. Thật đáng tự hào!',
    14: 'Hai tuần bền bỉ! Hãy giữ nhịp vừa sức và dành chỗ cho phục hồi nhé.',
    30: 'Một tháng giữ lửa! Sự kiên trì của bạn xứng đáng được ghi nhận. Tiếp tục theo nhịp của mình nhé.',
  };
  return messages[days] ?? `${days} ngày liên tiếp! Bạn đang giữ đà rất tốt. Thêm một ngày vừa sức, thêm một bước tiến.`;
}
