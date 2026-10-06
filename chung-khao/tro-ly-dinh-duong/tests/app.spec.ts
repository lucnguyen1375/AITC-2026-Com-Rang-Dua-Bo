import { test, expect } from '@playwright/test';
import { createPlan, recalculateMeal, sumNutrition } from '../src/services/nutrition';
import { foodItem } from '../src/data/foods';
import { demoProfile } from '../src/data/fixtures';
import { safetyResponse } from '../src/services/chat';
import path from 'node:path';
const review = path.resolve('../../.impeccable/review');
// UI flow uses a fixed response; chatbot content is verified by its own workflow.
test.beforeEach(async({page})=>{await page.route('**/api/chat',route=>route.fulfill({json:{reply:'Phản hồi kiểm thử giao diện.',profile_request:[]}}));});
test('Khoảng nhu cầu và dữ liệu thiếu được bảo toàn',async()=>{
 const plans=await createPlan({...demoProfile,sex:'unspecified'});
 expect(plans).toHaveLength(7);
 for(const plan of plans){expect(plan.targetMin.caloriesKcal).toBeLessThan(plan.targetMax.caloriesKcal);for(const target of [plan.targetMin,plan.targetMax])expect(4*target.proteinG+4*target.carbG+9*target.fatG).toBeCloseTo(target.caloriesKcal,6);}
 await expect(createPlan({...demoProfile,age:17})).rejects.toThrow('18');
 const analysis=recalculateMeal([foodItem('rice',200),foodItem('chicken',null)]);
 expect(analysis.isComplete).toBe(false);expect(analysis.knownTotal.caloriesKcal).toBe(260);
 expect(recalculateMeal([foodItem('rice',NaN)]).isComplete).toBe(false);
 const known=recalculateMeal([foodItem('rice',200),foodItem('chicken',150)]);
 expect(sumNutrition([known.knownTotal,known.knownTotal]).caloriesKcal).toBe(1015);
 expect(safetyResponse('đau ngực khi tập')).toContain('115');
 expect(safetyResponse('tôi muốn ngừng thuốc')).toContain('không chẩn đoán');
});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]] as const){
 test(`${name}: onboarding hội thoại, 3D, chat, ảnh, nhật ký và xóa phiên`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});
  const chat=page.getByRole('complementary',{name:'Trò chuyện với trợ lý Vi'});
  await expect(page.locator('.avatar-mount canvas')).toBeVisible();await expect(page.getByRole('navigation',{name:'Điều hướng chính'})).toHaveCount(0);
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0,0); });await page.screenshot({path:path.join(review,`${name}.png`),fullPage:false});
  async function send(text:string){await chat.getByRole('textbox',{name:'Tin nhắn cho Vi'}).fill(text);await chat.getByRole('button',{name:'Gửi tin nhắn',exact:true}).click();}
  await send('17 tuổi, 65 kg, 170 cm');await expect(chat.getByText('Người dưới 18 tuổi cần chuyên gia hướng dẫn.',{exact:false})).toBeVisible();
  await send('25 tuổi, 65 kg, 170 cm');await chat.getByRole('button',{name:'Không cung cấp',exact:true}).click();await chat.getByRole('button',{name:'Tăng cơ',exact:true}).click();await chat.getByRole('button',{name:'Tập sức mạnh',exact:true}).click();await chat.getByRole('button',{name:'Vừa',exact:true}).click();
  await chat.getByRole('button',{name:'Thứ Hai',exact:true}).click();await chat.getByRole('button',{name:'Thứ Ba',exact:true}).click();await chat.getByRole('button',{name:'Xác nhận lịch tập'}).click();await expect(page.getByRole('heading',{name:'Kế hoạch để bạn thống nhất'})).toBeVisible();await expect(page.getByRole('heading',{name:'Kế hoạch của bạn'})).toHaveCount(0);await page.getByRole('button',{name:'Đồng ý kế hoạch',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(review,name+'-agreement.png')});await chat.getByRole('button',{name:'Đồng ý kế hoạch',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Kế hoạch của bạn'})).toBeVisible();await expect(page.locator('.week-day')).toHaveCount(7);
  await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);document.getElementById('main')?.scrollTo(0,0);});await page.screenshot({path:path.join(review,`${name}-plan.png`),fullPage:false});
  await send('Ức gà 150 g có bao nhiêu calo?');await expect(chat.locator('.message.assistant').last()).toContainText('Phản hồi kiểm thử giao diện.');
  await send('đau ngực khi tập');await expect(chat.getByText('nếu đang có triệu chứng nặng hãy gọi 115',{exact:false})).toBeVisible();
  await chat.locator('input[type=file]').setInputFiles({name:'meal.png',mimeType:'image/png',buffer:Buffer.from(await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const context=canvas.getContext('2d')!;context.fillStyle='#ff8950';context.fillRect(0,0,32,32);return canvas.toDataURL('image/png').split(',')[1];}),'base64')});await chat.getByRole('button',{name:'Gửi tin nhắn',exact:true}).click();await expect(chat.locator('.message img')).toHaveCount(1);await page.reload();await expect(chat.locator('.message img')).toHaveCount(1);
  if(width<900){await chat.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(review,'mobile-chat.png')});} await chat.getByRole('button',{name:'Ghi bữa ăn',exact:true}).click();await page.getByRole('button',{name:'Thử với bữa mẫu'}).click();
  await page.getByRole('combobox',{name:'Cách chế biến Cơm trắng'}).selectOption('Khác / chưa rõ');await page.getByRole('spinbutton',{name:'Khối lượng Cơm trắng (g)'}).fill('250');await expect(page.getByRole('button',{name:'Ghi nhận bữa ăn',exact:true})).toBeDisabled();await expect(page.getByRole('combobox',{name:'Cách chế biến Cơm trắng'})).toHaveValue('Khác / chưa rõ');
  await page.getByRole('combobox',{name:'Cách chế biến Cơm trắng'}).selectOption('Đã nấu chín');await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);document.getElementById('main')?.scrollTo(0,0);});await page.screenshot({path:path.join(review,`${name}-meal.png`),fullPage:false});
  await page.getByRole('heading',{name:'Khẩu phần của bạn'}).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(review,`${name}-meal-result.png`)});await page.getByRole('button',{name:'Ghi nhận bữa ăn',exact:true}).click();await expect(page.getByRole('button',{name:'Đã ghi nhận bữa ăn'})).toBeDisabled();
  await page.getByRole('navigation',{name:'Điều hướng chính'}).getByRole('button',{name:'Kế hoạch',exact:true}).click();await expect(page.getByText('1 bữa',{exact:true})).toBeVisible();
  const current=await page.locator('.week-day').evaluateAll(nodes=>nodes.findIndex(n=>n.classList.contains('active')));await page.locator('.week-day').nth((current+1)%7).click();await expect(page.getByText('0 bữa',{exact:true})).toBeVisible();await page.locator('.week-day').nth(current).click();await page.getByRole('button',{name:'Xóa Bữa trưa'}).click();await expect(page.getByText('0 bữa',{exact:true})).toBeVisible();
  page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Xóa dữ liệu',exact:true}).click();await expect(page.getByRole('heading',{name:'Làm quen một chút. Lên kế hoạch cùng Vi.'})).toBeVisible();await expect(chat.locator('.message')).toHaveCount(1);await expect(chat.locator('.message img')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);expect(errors).toEqual([]);
 });
}
test('Quiz có quay lại và giữ thông tin; chỉ mở kế hoạch sau khi đồng ý',async({page})=>{
 await page.setViewportSize({width:1280,height:900});await page.goto('/');const chat=page.getByRole('complementary',{name:'Trò chuyện với trợ lý Vi'});
 await chat.getByRole('textbox',{name:'Tin nhắn cho Vi'}).fill('25 tuổi, 65 kg, 170 cm');await chat.getByRole('button',{name:'Gửi tin nhắn'}).click();await chat.getByRole('button',{name:'Nam',exact:true}).click();await chat.getByRole('button',{name:'Quay lại câu trước'}).click();await chat.getByRole('button',{name:'Không cung cấp',exact:true}).click();await chat.getByRole('button',{name:'Giữ thể trạng',exact:true}).click();await chat.getByRole('button',{name:'Chạy bộ',exact:true}).click();await chat.getByRole('button',{name:'Vừa',exact:true}).click();await chat.getByRole('button',{name:'Xác nhận lịch tập'}).click();await expect(page.getByRole('heading',{name:'Kế hoạch để bạn thống nhất'})).toBeVisible();await expect(page.getByText('25 tuổi · 65 kg · 170 cm · Giữ thể trạng',{exact:true})).toBeVisible();await expect(page.locator('.sidebar')).toHaveCount(0);await chat.getByRole('button',{name:'Đồng ý kế hoạch',exact:true}).click();await expect(page.getByRole('heading',{name:'Kế hoạch của bạn'})).toBeVisible();await expect(page.locator('.sidebar')).toBeVisible();await expect(page.locator('.avatar-mount canvas')).toBeVisible();
});
