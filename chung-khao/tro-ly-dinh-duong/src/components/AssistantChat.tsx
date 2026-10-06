import { useEffect, useRef, useState, type RefObject } from 'react';
import { useJsonState, imagePreview } from '../services/storage';
import { validPlans } from '../services/storageValidation';
import { Send, Paperclip, X, Sparkles, ArrowUpRight, Check, Utensils } from 'lucide-react';
import type { UserProfile, NutritionValues, ChatPlanContext, PlanUpdate } from '../types';
import { demoProfile, weekdays } from '../data/fixtures';
import { safetyResponse } from '../services/chat';
import { requestNutritionChat, type ChatProfileAnswers, type ChatProfileField } from '../services/assistant';
import { createPlan } from '../services/nutrition';
import { MacroSummary, format } from './MacroSummary';
import { SourceList } from './SourceList';
import type { DailyPlan } from '../types';
export type OnboardingStage = 'basics'|'sex'|'goal'|'type'|'intensity'|'schedule'|'confirm'|'ready';
type Message={id:string;role:'assistant'|'user';text:string;image?:string};
export const blankProfile:UserProfile={...demoProfile,age:0,weightKg:0,heightCm:0,sex:'unspecified',goal:'maintain',weekSchedule:demoProfile.weekSchedule.map(d=>({...d,isRestDay:true}))};
export default function AssistantChat({ planContext, onPlanUpdates, stage, cameraInputRef, onboardingMode = false, profile, plan, logged, mealFeedback, draft, onDraft, onStage, onSubmit, onTalking, onMeal }: {planContext?:ChatPlanContext;onPlanUpdates?:(updates:PlanUpdate[])=>string;stage:OnboardingStage;cameraInputRef?:RefObject<HTMLInputElement | null>;onboardingMode?:boolean;profile?:UserProfile;plan?:DailyPlan;logged?:NutritionValues;mealFeedback?:{id:string;text:string};draft:UserProfile;onDraft:(draft:UserProfile)=>void;onStage:(stage:OnboardingStage)=>void;onSubmit:(profile:UserProfile)=>Promise<void>;onTalking:(talking:boolean)=>void;onMeal:(description?:string)=>void}){
 const setStage=onStage;const [messages,setMessages]=useJsonState<Message[]>('chat-messages',[{id:'welcome',role:'assistant',text:profile?'Mình là Vi. Bạn muốn xem kế hoạch, hỏi về khẩu phần hay ghi bữa ăn hôm nay?':'Chào bạn! Mình là Vi, bạn đồng hành dinh dưỡng. Cùng lên kế hoạch theo nhịp tập nhé. Trước tiên, bạn bao nhiêu tuổi, nặng bao nhiêu kg và cao bao nhiêu cm?'}],value=>Array.isArray(value) && value.every(message=>message && typeof message.id==='string' && ['assistant','user'].includes(message.role) && typeof message.text==='string' && (!message.image || typeof message.image==='string' && message.image.startsWith('data:image/'))));
 const [profileRequest,setProfileRequest]=useJsonState<ChatProfileField[]>('chat-profile-request',[],value=>Array.isArray(value)&&value.every(field=>['age','sex','height','weight','goal','training_type','intensity','sessions','schedule'].includes(String(field))));const [profileAnswers,setProfileAnswers]=useJsonState<ChatProfileAnswers>('chat-profile-answers',{},value=>!!value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([field,answer])=>['age','sex','height','weight','goal','training_type','intensity','sessions','schedule'].includes(field)&&typeof answer==='string'));
 const [input,setInput]=useJsonState('chat-input','');const [busy,setBusy]=useState(false);const [attachment,setAttachment]=useJsonState<string | undefined>('chat-attachment',undefined,value=>typeof value==='string' && value.startsWith('data:image/'));const [error,setError]=useState('');const [days,setDays]=useJsonState<number[]>('chat-days',[],value=>Array.isArray(value) && value.every(day=>Number.isInteger(day) && day>=0 && day<=6));const [time,setTime]=useJsonState('chat-time','17:30');const [duration,setDuration]=useJsonState('chat-duration',60);const [preview,setPreview]=useJsonState<DailyPlan[] | undefined>('chat-preview',undefined,validPlans);const scroll=useRef<HTMLDivElement>(null);const upload=useRef<HTMLInputElement>(null);const urls=useRef(new Set<string>());const timer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 const lastFeedback=useRef<string | undefined>(undefined);
 const [uploading,setUploading]=useState(false);
 const requestController=useRef<AbortController | undefined>(undefined);
 useEffect(()=>{if(mealFeedback && lastFeedback.current!==mealFeedback.id){lastFeedback.current=mealFeedback.id;reply(mealFeedback.text);}},[mealFeedback]);
 useEffect(()=>{if(stage!=='confirm')return;let active=true;setBusy(true);setPreview(undefined);void createPlan(draft).then(result=>{if(active)setPreview(result);}).catch(()=>{if(active)setError('Chưa chuẩn bị được đề xuất. Quay lại lịch tập rồi xác nhận lại nhé.');}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[stage,draft]);
 useEffect(()=>{if(profile && stage!=='ready'){setStage('ready');}},[profile]);
 useEffect(()=>{scroll.current?.scrollTo({top:scroll.current.scrollHeight,behavior:'smooth'});},[messages,busy,stage]);
 useEffect(()=>()=>{requestController.current?.abort();urls.current.forEach(url=>URL.revokeObjectURL(url));if(timer.current)clearTimeout(timer.current);},[]);
 function append(role:Message['role'],text:string,image?:string){setMessages(previous=>[...previous,{id:crypto.randomUUID(),role,text,image}]);}
 function reply(text:string){append('assistant',text);onTalking(true);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>onTalking(false),2200);}
 async function send(value=input){
  if(busy || uploading || (!value.trim()&&!attachment))return;
  setError('');
  if(stage==='ready'){
   const text=value.trim() || 'Ước lượng năng lượng, đạm, bột đường và chất béo của bữa ăn trong ảnh này.';
   const image=attachment;
   const nextMessages=[...messages,{id:crypto.randomUUID(),role:'user' as const,text,image}];
   setMessages(nextMessages);setInput('');setAttachment(undefined);
   const safe=safetyResponse(text);if(safe){reply(safe);return;}
   setBusy(true);
   const controller=new AbortController();requestController.current=controller;
   try{
    const result=await requestNutritionChat(nextMessages,profile,undefined,planContext,controller.signal);
    if(controller.signal.aborted)return;
    let receipt='';
    if(result.plan_updates?.length){
     if(!onPlanUpdates) throw new Error('Chưa có kế hoạch để áp dụng thay đổi checklist.');
     receipt=onPlanUpdates(result.plan_updates);
    }
    reply([result.reply,receipt].filter(Boolean).join('\n\n'));
    setProfileRequest(result.profile_request??[]);setProfileAnswers({});
   }catch(e){if(!controller.signal.aborted){setError(e instanceof Error?e.message:'Chưa kết nối được trợ lý. Hãy thử lại.');setInput(value);if(image)setAttachment(image);}}
   finally{setBusy(false);}
   return;
  }
  append('user',value.trim() || 'Ảnh bữa ăn của mình',attachment);setInput('');const hadImage=!!attachment;setAttachment(undefined);
  const safe=safetyResponse(value);if(safe){reply(safe);return;}
  if(hadImage){reply('Mình đã nhận ảnh xem trước trên thiết bị. Chưa có AI nhận diện ảnh; bạn có thể mô tả món và mở “Ghi bữa ăn” để xác nhận thành phần.');return;}
  if(stage==='basics'){
   const numbers=value.match(/\d+(?:[.,]\d+)?/g)?.map(v=>Number(v.replace(',','.')))??[];const age=Number(value.match(/(\d+)\s*tuổi/i)?.[1]??numbers[0]);const weightKg=Number(value.match(/(\d+(?:[.,]\d+)?)\s*kg/i)?.[1]?.replace(',','.')??numbers[1]);const heightCm=Number(value.match(/(\d+(?:[.,]\d+)?)\s*cm/i)?.[1]?.replace(',','.')??numbers[2]);
   if(age>0&&age<18){reply('Người dưới 18 tuổi cần chuyên gia hướng dẫn. Mình không tạo kế hoạch tự động; bạn có thể tham khảo thông tin chung cùng phụ huynh hoặc chuyên gia.');return;}
   if(!Number.isInteger(age)||age<18||age>100||weightKg<30||weightKg>300||heightCm<100||heightCm>250||![age,weightKg,heightCm].every(Number.isFinite)){reply('Bạn nhập cùng lúc theo mẫu “25 tuổi, 65 kg, 170 cm” nhé. Tuổi 18–100, cân nặng 30–300 kg, chiều cao 100–250 cm.');return;}
   onDraft({...draft,age,weightKg,heightCm});setStage('sex');reply(`Mình đã ghi ${age} tuổi, ${weightKg} kg, ${heightCm} cm. Bạn muốn dùng biến thể nào trong công thức năng lượng? Nếu không cung cấp giới tính, mình sẽ giữ kết quả theo khoảng.`);return;
  }
  if(stage==='sex'){const sex=value==='Nam'?'male':value==='Nữ'?'female':value==='Không cung cấp'?'unspecified':null;if(!sex){reply('Chọn Nam, Nữ hoặc Không cung cấp bên dưới nhé.');return;}onDraft({...draft,sex});setStage('goal');reply('Cảm ơn bạn. Mục tiêu hiện tại của bạn là gì?');return;}
  if(stage==='goal'){const goal=value==='Tăng cơ'?'gainMuscle':value==='Giảm mỡ'?'loseFat':value==='Giữ thể trạng'?'maintain':null;if(!goal){reply('Chọn Giữ thể trạng, Tăng cơ hoặc Giảm mỡ bên dưới nhé.');return;}onDraft({...draft,goal});setStage('type');reply('Bạn thường tập theo hình thức nào?');return;}
  if(stage==='type'){if(!['Tập sức mạnh','Chạy bộ','Đạp xe','Bơi lội','Thể thao phối hợp'].includes(value)){reply('Chọn loại hình tập phù hợp bên dưới nhé.');return;}onDraft({...draft,trainingType:value});setStage('intensity');reply('Cường độ tập của bạn thường ở mức nào?');return;}
  if(stage==='intensity'){if(!['Nhẹ','Vừa','Cao'].includes(value)){reply('Chọn mức Nhẹ, Vừa hoặc Cao nhé.');return;}onDraft({...draft,trainingIntensity:value});setStage('schedule');reply('Chọn những ngày bạn tập và giờ bắt đầu. Các ngày còn lại là ngày phục hồi. Bạn có thể chỉnh lại sau.');return;}
  if(stage==='schedule'){if(!time||!Number.isFinite(duration)||duration<10||duration>300){setError('Chọn giờ tập và thời lượng từ 10 đến 300 phút.');return;}const next={...draft,weekSchedule:draft.weekSchedule.map((d,i)=>({...d,isRestDay:!days.includes(i),startTime:time,durationMinutes:duration}))};onDraft(next);setBusy(true);try{setPreview(await createPlan(next));setStage('confirm');reply(`${days.length} buổi / tuần, ${time}, ${duration} phút mỗi buổi. Đây là kế hoạch tham khảo mình đề xuất. Xem mục tiêu và cách tính bên dưới; bạn có thể quay lại sửa, hoặc đồng ý để bắt đầu.`);}catch(e){setError(e instanceof Error?e.message:'Chưa chuẩn bị được kế hoạch. Hãy thử lại.');}finally{setBusy(false);}return;}
  if(stage==='confirm'){if(value!=='Đồng ý kế hoạch'){reply('Xem đề xuất bên dưới rồi chọn Đồng ý kế hoạch, hoặc Quay lại để điều chỉnh.');return;}setBusy(true);onTalking(true);try{await onSubmit(draft);setStage('ready');}catch(e){reply(e instanceof Error?e.message:'Chưa tạo được kế hoạch. Hãy thử lại.');}finally{setBusy(false);}return;}
 }
 async function sendProfileAnswers(){if(busy||!profileRequest.length)return;const answers=Object.fromEntries(profileRequest.map(field=>[field,profileAnswers[field]?.trim()??''] as const).filter(([,value])=>value)) as ChatProfileAnswers;if(!Object.keys(answers).length){setError('Bổ sung ít nhất một thông tin được hỏi, hoặc nhập “Chưa cung cấp”.');return;}const labels:Record<ChatProfileField,string>={age:'Tuổi',sex:'Giới tính/nhóm công thức',height:'Chiều cao (cm)',weight:'Cân nặng (kg)',goal:'Mục tiêu',training_type:'Loại hình tập',intensity:'Cường độ',sessions:'Số buổi mỗi tuần',schedule:'Lịch tập'};const summary=`Thông tin bổ sung:\n${Object.entries(answers).map(([field,value])=>`- ${labels[field as ChatProfileField]}: ${value}`).join('\n')}`;const nextMessages=[...messages,{id:crypto.randomUUID(),role:'user' as const,text:summary}];setMessages(nextMessages);setError('');setBusy(true);try{const result=await requestNutritionChat(nextMessages,profile,answers,planContext);let receipt='';if(result.plan_updates?.length){if(!onPlanUpdates)throw new Error('Checklist unavailable');receipt=onPlanUpdates(result.plan_updates);}reply([result.reply,receipt].filter(Boolean).join('\n\n'));setProfileRequest(result.profile_request??[]);setProfileAnswers({});}catch(e){setError(e instanceof Error?e.message:'Chưa kết nối được trợ lý. Hãy thử lại.');}finally{setBusy(false);}}
 const quick:Partial<Record<OnboardingStage,string[]>>={sex:['Nam','Nữ','Không cung cấp'],goal:['Giữ thể trạng','Tăng cơ','Giảm mỡ'],type:['Tập sức mạnh','Chạy bộ','Đạp xe','Bơi lội','Thể thao phối hợp'],intensity:['Nhẹ','Vừa','Cao'],confirm:['Đồng ý kế hoạch']};
 const sequence:OnboardingStage[]=['basics','sex','goal','type','intensity','schedule','confirm'];
 function goBack(){const index=sequence.indexOf(stage);if(index<=0)return;const previous=sequence[index-1];if(previous==='ready')return;setStage(previous);setError('');reply({basics:'Bạn có thể sửa tuổi, cân nặng và chiều cao theo mẫu 25 tuổi, 65 kg, 170 cm.',sex:'Chọn lại biến thể công thức năng lượng nhé.',goal:'Mục tiêu nào phù hợp với bạn lúc này?',type:'Bạn muốn chọn lại loại hình tập nào?',intensity:'Cường độ tập thường ở mức nào?',schedule:'Chỉnh ngày, giờ và thời lượng tập rồi xác nhận nhé.',confirm:''}[previous]);}
 async function chooseFile(file?:File){if(!file || busy || uploading)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('Chọn ảnh JPEG / PNG / WebP tối đa 5 MB.');return;}setUploading(true);try{setAttachment(await imagePreview(file));setError('');}catch{setError('Không đọc được ảnh. Chọn ảnh khác hoặc nhập mô tả.');}finally{setUploading(false);}}
 return (
  <aside className={'chat-panel ' + (onboardingMode ? 'onboarding-chat' : '') + (stage === 'confirm' ? ' reviewing' : '')} aria-label="Trò chuyện với trợ lý Vi">
   <div className="chat-heading"><span className="chat-avatar"><Sparkles size={21}/></span><div><h2>Trò chuyện với Vi</h2><p><span/>{stage === 'ready' ? 'Trợ lý dinh dưỡng · AI' : 'Trợ lý dinh dưỡng · thiết lập hồ sơ'}</p></div><ArrowUpRight size={19}/></div>
   <div className="chat-demo-note">{stage === 'ready' ? 'Vi có thể sửa checklist theo lời bạn xác nhận và ước lượng dinh dưỡng từ ảnh. Kết quả từ ảnh chỉ để tham khảo.' : 'Hoàn tất hồ sơ để bắt đầu trò chuyện với trợ lý dinh dưỡng AI.'}</div>
   <div className="chat-messages" ref={scroll} role="log" aria-label="Lịch sử trò chuyện" aria-live="polite">
    {messages.map(message => <div className={'message ' + message.role} key={message.id}>{message.role === 'assistant' && <span className="message-avatar">Vi</span>}<div>{message.image && <img src={message.image} alt="Ảnh món ăn bạn đính kèm trên thiết bị"/>}<p style={{whiteSpace:'pre-wrap'}}>{message.text}</p></div></div>)}
    {busy && <div className="chat-loading" role="status">Vi đang chuẩn bị câu trả lời…</div>}
   </div>
   <div className="chat-actions">
    {stage === 'confirm' && error && <p className="error" role="alert">{error}</p>}
    {stage === 'confirm' && preview && <PlanAgreement plans={preview} draft={draft}/>}
    {stage === 'basics' && <p className="chat-hint">Ví dụ: 25 tuổi, 65 kg, 170 cm</p>}
    {stage === 'ready' && profileRequest.length > 0 && <ProfileRequestForm fields={profileRequest} answers={profileAnswers} onChange={(field, value) => setProfileAnswers(previous => ({...previous, [field]: value}))} onSubmit={() => void sendProfileAnswers()} disabled={busy}/>}
    {quick[stage] && <div className="quick-replies">{quick[stage]!.map(option => <button key={option} disabled={busy || (stage === 'confirm' && !preview)} onClick={() => send(option)}>{option}{stage === 'confirm' && <Check size={15}/>}</button>)}</div>}
    {stage === 'schedule' && <div className="chat-schedule"><div className="chat-days">{weekdays.map((day, i) => <button key={day} aria-label={day} aria-pressed={days.includes(i)} className={days.includes(i) ? 'selected' : ''} onClick={() => setDays(previous => previous.includes(i) ? previous.filter(x => x !== i) : [...previous, i])}>{i === 6 ? 'CN' : 'T' + (i + 2)}</button>)}</div><div className="chat-time"><label>Giờ tập<input type="time" value={time} onChange={e => setTime(e.target.value)}/></label><label>Phút / buổi<input type="number" min="10" max="300" value={duration || ''} onChange={e => setDuration(Number(e.target.value))}/></label></div><button className="primary full" onClick={() => send('Xác nhận lịch tập')}>Xác nhận lịch tập<Check size={16}/></button></div>}
    {stage === 'ready' && <div className="quick-replies"><button onClick={() => send('Ức gà 150 g có bao nhiêu calo?')}>Ức gà 150 g?</button><button onClick={() => send('Nên ăn gì trước khi tập?')}>Ăn trước khi tập</button><button onClick={() => onMeal(input)}><Utensils size={15}/>Ghi bữa ăn</button></div>}
   </div>
   {onboardingMode && stage !== 'basics' && stage !== 'ready' && <button className="text-button quiz-back" disabled={busy} onClick={goBack}>Quay lại câu trước</button>}
   <form className="chat-composer" onSubmit={e => {e.preventDefault();void send();}}>
    {attachment && <div className="chat-attachment"><img src={attachment} alt="Ảnh món ăn chuẩn bị gửi"/><button type="button" disabled={busy || uploading} className="icon-button" aria-label="Bỏ ảnh đính kèm" onClick={() => {URL.revokeObjectURL(attachment);urls.current.delete(attachment);setAttachment(undefined);}}><X size={15}/></button><span>Gửi ảnh để Vi ước lượng dinh dưỡng</span></div>}
    {error && <p className="error" role="alert">{error}</p>}
    <div className="composer-input"><label htmlFor="chat-input" className="sr-only">Tin nhắn cho Vi</label><textarea id="chat-input" rows={2} maxLength={1200} value={input} onChange={e => setInput(e.target.value)} placeholder={stage === 'basics' ? '25 tuổi, 65 kg, 170 cm…' : 'Nhắn cho Vi…'} onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing){e.preventDefault();void send();}}}/><div>{cameraInputRef && <input ref={cameraInputRef} type="file" hidden accept="image/jpeg,image/png,image/webp" capture="environment" aria-label="Chụp ảnh món ăn" onChange={e => {void chooseFile(e.target.files?.[0]);e.target.value='';}}/>}<input ref={upload} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={e => {chooseFile(e.target.files?.[0]);e.target.value='';}}/><button hidden={onboardingMode} type="button" className="icon-button" aria-label="Đính kèm ảnh món ăn" onClick={() => upload.current?.click()}><Paperclip size={19}/></button><span>{onboardingMode ? 'Enter để gửi · Shift+Enter để xuống dòng' : 'Ảnh tối đa 5 MB'}</span><button type="submit" className="send-button" aria-label="Gửi tin nhắn" disabled={busy || uploading || (!input.trim() && !attachment)}><Send size={18}/></button></div></div>
    <p>Lịch sử chat lưu trên thiết bị. Khi gửi, tin nhắn, ảnh đính kèm, hồ sơ và checklist được gửi tới dịch vụ AI.</p>
   </form>
  </aside>
 );
}
export function PlanAgreement({plans,draft}:{plans:DailyPlan[];draft:UserProfile}){
 const samples=[plans.find(p=>!draft.weekSchedule[p.weekday-1].isRestDay),plans.find(p=>draft.weekSchedule[p.weekday-1].isRestDay)].filter((p):p is DailyPlan=>!!p);
 return <div className="plan-agreement"><h3>Kế hoạch để bạn thống nhất</h3><p>{draft.age} tuổi · {draft.weightKg} kg · {draft.heightCm} cm · {draft.goal==='gainMuscle'?'Tăng cơ':draft.goal==='loseFat'?'Giảm mỡ':'Giữ thể trạng'}</p><div className="agreement-week">{draft.weekSchedule.map((day,i)=><span key={i}>{i===6?'CN':`T${i+2}`}<strong>{day.isRestDay?'Nghỉ':'Tập'}</strong></span>)}</div>{samples.map(plan=><section key={plan.weekday}><h4>{draft.weekSchedule[plan.weekday-1].isRestDay?'Ngày nghỉ / phục hồi':'Ngày tập'} · ước lượng tham khảo</h4><MacroSummary values={plan.targetMin} max={plan.targetMax}/></section>)}<p>Chất đạm tham khảo: {format(draft.weightKg*1.4)}–{format(draft.weightKg*2)} g/ngày. Đây là đề xuất sơ bộ, không phải chỉ định cho cá nhân.</p><details><summary>Cách tính, giả định và nguồn</summary><p>Mifflin–St Jeor ước lượng năng lượng nghỉ; nhân hệ số vận động giả định của bản demo (nghỉ 1,4, ngày tập 1,55 hoặc 1,7). Không cung cấp giới tính: giữ khoảng hai biến thể.</p><p>Chọn 1,6 g đạm/kg, béo 25% năng lượng và điều chỉnh ±150 kcal là giả định sơ bộ. Tổng chất theo quy ước 4 × đạm + 4 × bột đường + 9 × béo. Dữ liệu thực phẩm chưa kiểm chứng.</p><SourceList sources={plans[0].sources}/></details><p className="agreement-note">Đồng ý để vào kế hoạch và nhật ký. Bạn vẫn có thể chỉnh lại sau; dữ liệu được lưu trên thiết bị.</p></div>;
}
function ProfileRequestForm({fields,answers,onChange,onSubmit,disabled}:{fields:ChatProfileField[];answers:ChatProfileAnswers;onChange:(field:ChatProfileField,value:string)=>void;onSubmit:()=>void;disabled:boolean}){
 const labels:Record<ChatProfileField,string>={age:'Tuổi',sex:'Giới tính / nhóm công thức',height:'Chiều cao (cm)',weight:'Cân nặng (kg)',goal:'Mục tiêu',training_type:'Loại hình tập',intensity:'Cường độ',sessions:'Số buổi mỗi tuần',schedule:'Lịch tập'};
 const options:Partial<Record<ChatProfileField,string[]>>={sex:['Nam','Nữ','Không cung cấp'],goal:['Giữ thể trạng','Tăng cơ','Giảm mỡ','Chưa rõ'],training_type:['Tập sức mạnh','Chạy bộ','Đạp xe','Bơi lội','Thể thao phối hợp','Khác'],intensity:['Nhẹ','Vừa','Cao','Chưa rõ']};
 return <section className="chat-profile-form" aria-label="Thông tin bổ sung cho trợ lý"><strong>Thông tin Vi đang cần</strong><div>{fields.map(field=><label key={field}>{labels[field]}{field==='schedule'?<textarea rows={2} value={answers[field]??''} placeholder="Ngày tập, giờ và thời lượng (nếu biết)" onChange={event=>onChange(field,event.target.value)}/>:options[field]?<select value={answers[field]??''} onChange={event=>onChange(field,event.target.value)}><option value="">Chọn câu trả lời</option>{options[field]!.map(option=><option key={option}>{option}</option>)}</select>:<input type="text" inputMode={['age','height','weight','sessions'].includes(field)?'decimal':undefined} value={answers[field]??''} placeholder={['age','height','weight','sessions'].includes(field)?'Nhập số hoặc “Chưa cung cấp”':'Nhập câu trả lời hoặc “Chưa cung cấp”'} onChange={event=>onChange(field,event.target.value)}/>}</label>)}</div><button type="button" className="secondary" disabled={disabled} onClick={onSubmit}>Gửi thông tin</button><p>Các trường chưa biết có thể ghi “Chưa cung cấp”; phần trả lời sẽ nêu rõ giới hạn.</p></section>;
}
