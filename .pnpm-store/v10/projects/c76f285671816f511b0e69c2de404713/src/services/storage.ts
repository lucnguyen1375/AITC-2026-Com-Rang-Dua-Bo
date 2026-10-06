import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

const prefix = 'bua-viet:v1:';
const noticeEvent = 'bua-viet-storage-notice';
let pendingNotice = '';
const currentData: Record<string, unknown> = {};
function report(message: string) {
 pendingNotice = message;
 window.dispatchEvent(new CustomEvent(noticeEvent, { detail: message }));
}

/** Versioned JSON only. All keys belong to this app; no database or server. */
export function useJsonState<T>(key: string, initial: T | (() => T), valid?: (value: unknown) => boolean): [T, Dispatch<SetStateAction<T>>] {
 const [value, setValue] = useState<T>(() => {
  const fallback = typeof initial === 'function' ? (initial as () => T)() : initial;
  try {
   const raw = localStorage.getItem(prefix + key);
   if (raw === null) return fallback;
   const stored = JSON.parse(raw);
   const shapeMatches = valid ? valid(stored?.value) : Array.isArray(fallback) ? Array.isArray(stored?.value) : fallback === undefined || typeof stored?.value === typeof fallback;
   if (!stored || stored.version !== 1 || !('value' in stored) || !shapeMatches) throw new Error('Invalid data');
   return stored.value as T;
  } catch {
   // A damaged key does not prevent other screens or data from loading.
   queueMicrotask(() => report('Có dữ liệu lưu chưa đọc được. Bạn có thể nhập lại mục này; các mục khác vẫn được giữ.'));
   return fallback;
  }
 });
 useEffect(() => {
  if (value === undefined) delete currentData[key];
  else currentData[key] = { version: 1, value };
  try {
   if (value === undefined) localStorage.removeItem(prefix + key);
   else localStorage.setItem(prefix + key, JSON.stringify({ version: 1, value }));
  } catch {
   report('Chưa lưu được trên thiết bị. Bộ nhớ có thể đã đầy hoặc bị chặn; hãy tải bản JSON trước khi rời trang.');
  }
 }, [key, value]);
 return [value, setValue];
}

export function clearStoredData() {
 try {
  Object.keys(localStorage).filter(key => key.startsWith(prefix)).forEach(key => localStorage.removeItem(key));
  Object.keys(currentData).forEach(key => delete currentData[key]);
  return true;
 } catch {
  report('Chưa xóa được dữ liệu lưu. Hãy cho phép lưu trữ trong trình duyệt rồi thử lại.');
  return false;
 }
}

export function forgetStoredKeys(keys: string[]) {
 keys.forEach(key => delete currentData[key]);
 try { keys.forEach(key => localStorage.removeItem(prefix + key)); }
 catch { report('Chưa cập nhật được dữ liệu lưu trên thiết bị. Hãy kiểm tra quyền lưu trữ của trình duyệt.'); }
}

export function downloadStoredData() {
 try {
  const data: Record<string, unknown> = {};
  try {
   Object.keys(localStorage).filter(key => key.startsWith(prefix)).forEach(key => { data[key.slice(prefix.length)] = JSON.parse(localStorage.getItem(key)!); });
  } catch { /* The in-memory copy remains exportable if browser storage is unavailable. */ }
  Object.assign(data, currentData);
  const url = URL.createObjectURL(new Blob([JSON.stringify({ app: 'Bữa Việt', version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'bua-viet.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
 } catch { report('Chưa tải được bản JSON. Hãy kiểm tra quyền lưu trữ của trình duyệt rồi thử lại.'); }
}

export function useStorageNotice() {
 const [notice, setNotice] = useState(pendingNotice);
 useEffect(() => {
  const listener = (event: Event) => setNotice((event as CustomEvent<string>).detail);
  window.addEventListener(noticeEvent, listener);
  if (pendingNotice) setNotice(pendingNotice);
  return () => window.removeEventListener(noticeEvent, listener);
 }, []);
 return [notice, setNotice] as const;
}

/** Downsize previews before putting them in JSON to avoid storing original photos. */
export async function imagePreview(file: File): Promise<string> {
 const bitmap = await createImageBitmap(file);
 try {
  const scale = Math.min(1, 960 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.7);
 } finally { bitmap.close(); }
}

export function previewFile(url: string): File {
 const [header, encoded] = url.split(',');
 const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
 return new File([bytes], 'photo.jpg', { type: header.match(/data:(.*?);/)?.[1] ?? 'image/jpeg' });
}
