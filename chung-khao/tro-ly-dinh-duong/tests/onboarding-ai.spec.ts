import {test,expect} from '@playwright/test';
import path from 'node:path';
const review=path.resolve('../../.impeccable/review/onboarding-ai');
const profile={age:25,weightKg:65,heightCm:170,sex:'unspecified',goal:'gainMuscle',trainingType:'Tập sức mạnh',trainingIntensity:'Vừa',weekSchedule:Array.from({length:7},(_,i)=>({weekday:i+1,isRestDay:![0,2,4].includes(i),startTime:[0,2,4].includes(i)?'18:00':'00:00',durationMinutes:[0,2,4].includes(i)?60:10}))};
const question={field:'goal',label:'Bạn muốn tập trung vào mục tiêu nào lúc này?',placeholder:'Hoặc chia sẻ mục tiêu riêng của bạn',input_type:'text',options:[{label:'Tăng cơ cùng Vi',value:'Tăng cơ'},{label:'Giữ nhịp hiện tại',value:'Giữ thể trạng'}]};
test('Chọn đáp án tiếp tục khi câu hỏi AI thiếu các thuộc tính UI',async({page})=>{
 const errors:string[]=[];const bodies:any[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/onboarding',async route=>{
  bodies.push(route.request().postDataJSON());
  await route.fulfill({json:bodies.length===1?{reply:'Chọn mục tiêu nhé.',profile:{age:25,weightKg:65,heightCm:170},questions:[{field:'goal',label:'Mục tiêu của bạn?',options:[{label:'Tăng cơ',value:'gainMuscle'}]}]}:{reply:'Bạn thường tập gì?',profile:{goal:'gainMuscle'},questions:[{field:'trainingType',label:'Loại hình tập của bạn?'}]}});
 });
 await page.goto('/');
 await page.getByRole('spinbutton',{name:'Tuổi',exact:true}).fill('25');
 await page.getByRole('button',{name:'Gửi câu trả lời',exact:true}).click();
 await page.getByRole('button',{name:'Tăng cơ',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Loại hình tập của bạn?',exact:true})).toBeVisible();
 await expect(page.getByRole('alert')).toHaveCount(0);
 expect(bodies[1].answers).toEqual({goal:'gainMuscle'});
 await expect(page.getByText('4 / 8 thông tin đã rõ',{exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});

test('Chọn đáp án lỗi mạng vẫn giữ lựa chọn để thử lại',async({page})=>{
 let calls=0;const bodies:any[]=[];
 await page.route('**/api/onboarding',async route=>{
  calls++;bodies.push(route.request().postDataJSON());
  await route.fulfill(calls===2?{status:504,json:{error:'Chờ phản hồi quá lâu.'}}:{json:{reply:'Chọn mục tiêu nhé.',profile:{age:25},questions:[question],ready:false,blocked:false}});
 });
 await page.goto('/');await page.getByRole('spinbutton',{name:'Tuổi',exact:true}).fill('25');
 await page.getByRole('button',{name:'Gửi câu trả lời',exact:true}).click();
 await page.getByRole('button',{name:'Tăng cơ cùng Vi',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Chờ phản hồi quá lâu');
 await expect(page.getByRole('textbox',{name:question.label})).toHaveValue('Tăng cơ');
 await page.getByRole('button',{name:'Thử lại',exact:true}).click();
 await expect(page.getByRole('alert')).toHaveCount(0);
 expect(bodies[2]).toEqual(bodies[1]);
});
test('Desktop: UI do LLM sinh, chọn nhanh, trả lời tự do, sửa và thống nhất',async({page})=>{
 const errors:string[]=[];const requests:any[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/api/onboarding',async route=>{
  requests.push(route.request().postDataJSON());const index=requests.length;
  const turn=index===1?{reply:'Bạn muốn mình đồng hành với mục tiêu nào?',profile:{age:25,weightKg:65,heightCm:170},questions:[question],ready:false,blocked:false}:index===2?{reply:'Mình cần lịch tập để sắp nhịp ăn cùng bạn.',profile:{...profile,weekSchedule:undefined},questions:[{field:'weekSchedule',label:'Bạn tập vào những ngày nào, lúc mấy giờ và bao lâu?',placeholder:'Ví dụ: thứ Hai, Tư, Sáu lúc 18:00, 60 phút',input_type:'textarea',options:[]}],ready:false,blocked:false}:{reply:'Mình đã hiểu hồ sơ. Bạn xem đề xuất rồi đồng ý khi phù hợp nhé.',profile:{...profile,weightKg:index===4?68:65},questions:[],ready:true,blocked:false};
  await route.fulfill({json:turn});
 });
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await expect(page.locator('.avatar-mount canvas')).toBeVisible();await expect(page.locator('.sidebar')).toHaveCount(0);
 await page.getByRole('button',{name:'Bắt đầu với Vi'}).click();
 await expect(page.getByRole('textbox',{name:question.label})).toBeVisible();
 await page.getByRole('button',{name:'Tăng cơ cùng Vi'}).click();
 await expect(page.getByRole('textbox',{name:question.label})).toHaveValue('Tăng cơ');
 await page.screenshot({path:path.join(review,'desktop-questions.png'),fullPage:false});
 await page.getByRole('button',{name:'Gửi câu trả lời',exact:true}).click();
 expect(requests[1].answers).toEqual({goal:'Tăng cơ'});
 await page.getByRole('textbox',{name:'Hoặc trả lời tự do'}).fill('Mình tập thứ Hai, Tư, Sáu lúc 18:00 trong 60 phút. Không cung cấp giới tính.');
 await page.getByRole('button',{name:'Gửi tin nhắn',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Kế hoạch để bạn thống nhất'})).toBeVisible();await expect(page.locator('.sidebar')).toHaveCount(0);
 await page.getByRole('textbox',{name:'Nhắn cho Vi',exact:true}).fill('Sửa cân nặng của mình thành 68 kg.');await page.getByRole('button',{name:'Gửi tin nhắn',exact:true}).click();
 await expect(page.getByText('25 tuổi · 68 kg · 170 cm · Tăng cơ',{exact:true})).toBeVisible();
 await page.reload();await expect(page.getByText('25 tuổi · 68 kg · 170 cm · Tăng cơ',{exact:true})).toBeVisible();
 await page.getByText('Cách tính, giả định và nguồn',{exact:true}).click();await expect(page.getByText(/Mifflin–St Jeor ước lượng năng lượng nghỉ/)).toBeVisible();await page.getByText('Cách tính, giả định và nguồn',{exact:true}).click();
 await expect(page.locator('.avatar-mount canvas')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>{window.scrollTo(0,0);document.querySelector('.onboarding-ai-chat .chat-actions')?.scrollTo(0,0);});
 await page.screenshot({path:path.join(review,'desktop-agreement.png'),fullPage:false});
 await page.screenshot({path:path.join(review,'desktop-agreement-full.png'),fullPage:true});
 await page.getByRole('button',{name:'Đồng ý kế hoạch',exact:true}).click();await expect(page.getByRole('heading',{name:'Kế hoạch của bạn'})).toBeVisible();
 await expect(page.locator('.onboarding-screen')).toHaveCount(0);expect(errors).toEqual([]);
});
test('Lỗi AI giữ câu trả lời; thử lại không thêm trùng hội thoại',async({page})=>{
 let calls=0;const bodies:any[]=[];
 await page.route('**/api/onboarding',async route=>{calls++;bodies.push(route.request().postDataJSON());await route.fulfill(calls===1?{status:504,json:{error:'Chờ phản hồi quá lâu.'}}:{json:{reply:'Vi đã nhận được. Bạn chia sẻ tuổi nhé.',profile:{},questions:[{field:'age',label:'Bạn bao nhiêu tuổi?',placeholder:'Nhập tuổi',input_type:'number',options:[]}],ready:false,blocked:false}});});
 await page.goto('/');await page.getByRole('textbox',{name:'Nhắn cho Vi',exact:true}).fill('Mình muốn tăng cơ');await page.getByRole('button',{name:'Gửi tin nhắn'}).click();
 await expect(page.getByRole('alert')).toContainText('Chờ phản hồi quá lâu');await expect(page.getByRole('textbox',{name:'Nhắn cho Vi',exact:true})).toHaveValue('Mình muốn tăng cơ');
 await page.getByRole('button',{name:'Thử lại',exact:true}).click();await expect(page.getByRole('spinbutton',{name:'Bạn bao nhiêu tuổi?'})).toBeVisible();expect(bodies[1].messages).toEqual(bodies[0].messages);
});
test('AI chưa đủ hồ sơ hoặc dưới 18 tuổi không thể mở kế hoạch',async({page})=>{
 await page.route('**/api/onboarding',route=>route.fulfill({json:{reply:'Người dưới 18 tuổi cần chuyên gia hướng dẫn.',profile:{age:17},questions:[],ready:false,blocked:true}}));
 await page.goto('/');await page.getByRole('button',{name:'Bắt đầu với Vi'}).click();await expect(page.getByText('Người dưới 18 tuổi cần chuyên gia hướng dẫn.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Đồng ý kế hoạch',exact:true})).toHaveCount(0);await expect(page.locator('.sidebar')).toHaveCount(0);
});
test('OpenAI thật: sinh textbox và trích hồ sơ để tạo đề xuất',async({page})=>{
 test.skip(process.env.RUN_OPENAI_LIVE!=='1','Chỉ gọi OpenAI khi yêu cầu chạy kiểm tra tích hợp thật.');
 test.setTimeout(140000);
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.getByRole('button',{name:'Bắt đầu với Vi'}).click();
 await expect(page.locator('.ai-question input,.ai-question textarea').first()).toBeVisible({timeout:55000});
 await expect(page.locator('.avatar-mount canvas')).toBeVisible();
 await page.screenshot({path:path.join(review,'desktop-live-questions.png'),fullPage:false});
 await page.getByRole('textbox',{name:'Hoặc trả lời tự do'}).fill('Mình 25 tuổi, nặng 65 kg, cao 170 cm. Không cung cấp giới tính. Mục tiêu tăng cơ. Tập sức mạnh, cường độ vừa. Tập thứ Hai, thứ Tư và thứ Sáu lúc 18:00, mỗi buổi 60 phút. Những ngày khác nghỉ.');
 await page.getByRole('button',{name:'Gửi tin nhắn',exact:true}).click();
 await expect(page.getByRole('button',{name:'Đồng ý kế hoạch',exact:true})).toBeVisible({timeout:55000});
 await expect(page.getByText('25 tuổi · 65 kg · 170 cm · Tăng cơ',{exact:true})).toBeVisible();
 await page.evaluate(()=>{window.scrollTo(0,0);document.querySelector('.onboarding-ai-chat .chat-actions')?.scrollTo(0,0);});
 await page.screenshot({path:path.join(review,'desktop-live-agreement.png'),fullPage:false});
 await expect(page.locator('.sidebar')).toHaveCount(0);
 await page.getByRole('button',{name:'Đồng ý kế hoạch',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Kế hoạch của bạn'})).toBeVisible();
});
