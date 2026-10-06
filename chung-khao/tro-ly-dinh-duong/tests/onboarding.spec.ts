import { test, expect } from '@playwright/test';
import path from 'node:path';
const review = path.resolve('../../.impeccable/review/onboarding');
for (const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]] as const) {
 test(`${device}: quiz riêng, giữ câu trả lời, chỉ mở kế hoạch sau đồng ý`, async ({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width,height});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);
  const chat=page.getByRole('complementary',{name:'Trò chuyện với trợ lý Vi'});
  await expect(page.locator('.avatar-mount canvas')).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await page.screenshot({path:path.join(review,`${device}.png`),fullPage:false});
  await chat.getByRole('textbox',{name:'Tin nhắn cho Vi'}).fill('25 tuổi, 65 kg, 170 cm');
  await chat.getByRole('button',{name:'Gửi tin nhắn',exact:true}).click();
  await page.reload();
  await expect(chat.getByRole('button',{name:'Nam',exact:true})).toBeVisible();
  await chat.getByRole('button',{name:'Nam',exact:true}).click();
  await chat.getByRole('button',{name:'Quay lại câu trước'}).click();
  await chat.getByRole('button',{name:'Không cung cấp',exact:true}).click();
  await chat.getByRole('button',{name:'Giữ thể trạng',exact:true}).click();
  await chat.getByRole('button',{name:'Chạy bộ',exact:true}).click();
  await chat.getByRole('button',{name:'Vừa',exact:true}).click();
  await chat.getByRole('button',{name:'Thứ Hai',exact:true}).click();
  await chat.getByRole('button',{name:'Xác nhận lịch tập'}).click();
  await expect(page.getByRole('heading',{name:'Kế hoạch để bạn thống nhất'})).toBeVisible();
  await expect(chat.getByText('25 tuổi · 65 kg · 170 cm · Giữ thể trạng',{exact:true})).toBeVisible();
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await chat.getByText('Cách tính, giả định và nguồn',{exact:true}).click();
  await expect(chat.getByText(/Mifflin–St Jeor ước lượng/)).toBeVisible();
  await chat.getByText('Cách tính, giả định và nguồn',{exact:true}).click();
  await chat.locator('.chat-actions').evaluate(element=>element.scrollTo(0,0));
  await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);});
  await page.screenshot({path:path.join(review,`${device}-agreement.png`),fullPage:false});
  if(device==='mobile') {
   await page.locator('.onboarding-quiz').evaluate(element=>window.scrollTo(0,element.getBoundingClientRect().top+scrollY-16));
   await page.screenshot({path:path.join(review,'mobile-agreement-detail.png'),fullPage:false});
  }
  await chat.getByRole('button',{name:'Đồng ý kế hoạch',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Kế hoạch của bạn'})).toBeVisible();
  await expect(page.locator('.onboarding-screen')).toHaveCount(0);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(review,`${device}-plan.png`),fullPage:false});
  await page.reload();
  await expect(page.getByRole('heading',{name:'Kế hoạch của bạn'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  expect(errors).toEqual([]);
 });
}
test('Nhập tay tùy chọn vẫn có Vi và phải thống nhất đề xuất',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Muốn tự nhập? Mở biểu mẫu'}).click();
 await expect(page.getByRole('complementary',{name:'Trò chuyện với trợ lý Vi'})).toBeVisible();
 await expect(page.locator('.avatar-mount canvas')).toBeVisible();
 await page.getByRole('button',{name:'Thử hồ sơ mẫu'}).click();
 await expect(page.getByRole('heading',{name:'Kế hoạch để bạn thống nhất'})).toBeVisible();
 await expect(page.locator('.sidebar')).toHaveCount(0);
 await page.getByRole('button',{name:'Đồng ý kế hoạch',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Kế hoạch của bạn'})).toBeVisible();
});
