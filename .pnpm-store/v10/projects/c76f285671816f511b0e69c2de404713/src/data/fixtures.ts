import type { UserProfile } from '../types';
export const weekdays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
export const demoProfile: UserProfile = { age: 25, weightKg: 65, heightCm: 170, sex: 'male', goal: 'gainMuscle', trainingType: 'Tập sức mạnh', trainingIntensity: 'Vừa', weekSchedule: Array.from({length: 7}, (_, i) => ({ weekday: i + 1, isRestDay: [2, 6].includes(i), startTime: '17:30', durationMinutes: 60 })) };
export function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function weekDates() { const start = new Date(); start.setHours(12,0,0,0); start.setDate(start.getDate() - (start.getDay()+6)%7); return Array.from({length:7}, (_, i) => { const date = new Date(start); date.setDate(start.getDate()+i); return date; }); }
