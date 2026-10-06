import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Send, Sparkles, RotateCcw } from 'lucide-react';
import type { DailyPlan, UserProfile } from '../types';
import { useJsonState } from '../services/storage';
import { createPlan } from '../services/nutrition';
import { safetyResponse } from '../services/chat';
import { completeProfile, profileLabels, requestOnboarding, validOnboardingTurn, type OnboardingTurn, type OnboardingMessage, type ProfileField } from '../services/onboarding';
import { PlanAgreement, type OnboardingStage } from './AssistantChat';
type Session={messages:OnboardingMessage[];turn?:OnboardingTurn;started:boolean};
const firstIntake:OnboardingTurn={reply:'Điền những thông tin bạn biết rồi gửi cùng lúc; trường nào chưa muốn chia sẻ có thể để trống.',profile:{},questions:[
 {field:'age',label:'Tuổi',placeholder:'Ví dụ: 25',input_type:'number',options:[]},
 {field:'weightKg',label:'Cân nặng (kg)',placeholder:'Ví dụ: 65',input_type:'number',options:[]},
 {field:'heightCm',label:'Chiều cao (cm)',placeholder:'Ví dụ: 170',input_type:'number',options:[]},
],ready:false,blocked:false};
export default function OnboardingAssistant({onDraft,onStage,onSubmit,onTalking,onProgress}:{onDraft:(profile:UserProfile)=>void;onStage:(stage:OnboardingStage)=>void;onSubmit:(profile:UserProfile)=>Promise<void>;onTalking:(talking:boolean)=>void;onProgress:(count:number)=>void}) {
 const [session,setSession]=useJsonState<Session>('ai-onboarding',{messages:[{role:'assistant',text:'Chào bạn, mình là Vi. Hãy chia sẻ những thông tin bạn biết; mình sẽ hỏi gọn phần còn thiếu.'}],turn:firstIntake,started:true},value=>!!value&&typeof value==='object'&&'messages' in value&&Array.isArray(value.messages)&&value.messages.every(m=>m&&['user','assistant'].includes(m.role)&&typeof m.text==='string')&&'started' in value&&typeof value.started==='boolean'&&(!('turn' in value)||value.turn===undefined||validOnboardingTurn(value.turn)));
 const [answers,setAnswers]=useJsonState<Partial<Record<ProfileField,string>>>('ai-onboarding-answers',{},value=>!!value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([field,answer])=>field in profileLabels&&typeof answer==='string'));
 const [input,setInput]=useJsonState('ai-onboarding-input','');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [preview,setPreview]=useState<DailyPlan[]>([]);
 const pending=useRef<{messages:OnboardingMessage[];answers:Partial<Record<ProfileField,string>>} | undefined>(undefined);const log=useRef<HTMLDivElement>(null);const inFlight=useRef(false);const timer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);const mounted=useRef(true);
 const turn=session.turn;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;clearTimeout(timer.current);};},[]);
 useEffect(()=>{if(!session.started&&!session.turn)setSession({...session,started:true,messages:[...session.messages,{role:'assistant',text:firstIntake.reply}],turn:firstIntake});},[session]);
 useEffect(()=>{onProgress(Object.keys(turn?.profile??{}).length);if(turn?.ready&&completeProfile(turn.profile)){onDraft(turn.profile);onStage('confirm');void createPlan(turn.profile).then(result=>{if(mounted.current)setPreview(result);}).catch(error=>setError(error instanceof Error?error.message:'Chưa tạo được đề xuất.'));}else{setPreview([]);onStage('basics');}},[turn]);
 useEffect(()=>{log.current?.scrollTo({top:log.current.scrollHeight,behavior:'smooth'});},[session.messages,busy]);
 function animateReply(){onTalking(true);clearTimeout(timer.current);timer.current=setTimeout(()=>onTalking(false),2200);}
 async function ask(messages:OnboardingMessage[],submitted:Partial<Record<ProfileField,string>>){
  if(inFlight.current)return;inFlight.current=true;setBusy(true);setError('');pending.current={messages,answers:submitted};
  try{const result=await requestOnboarding(messages,turn?.profile??{},submitted);if(!mounted.current)return;setSession({started:true,messages:[...messages,{role:'assistant',text:result.reply}],turn:result});setAnswers({});setInput('');pending.current=undefined;animateReply();}
  catch(error){if(mounted.current)setError(error instanceof Error?error.message:'Vi chưa nhận được câu trả lời. Hãy thử lại.');}
  finally{inFlight.current=false;if(mounted.current)setBusy(false);}
 }
 function send(text=input,fields:Partial<Record<ProfileField,string>>={}){
  if(inFlight.current||!text.trim())return;
  const messages=[...session.messages,{role:'user' as const,text:text.trim()}];
  const safe=safetyResponse(text);
  if(safe){setSession({...session,messages:[...messages,{role:'assistant',text:safe}]});setInput('');animateReply();return;}
  setSession({...session,started:true,messages});void ask(messages,fields);
 }
 function submitAnswers(){const submitted=Object.fromEntries(Object.entries(answers).filter(([,value])=>value?.trim())) as Partial<Record<ProfileField,string>>;if(!Object.keys(submitted).length){setError('Chọn một phương án hoặc nhập câu trả lời để Vi tiếp tục.');return;}send(Object.entries(submitted).map(([field,value])=>`${profileLabels[field as ProfileField]}: ${value}`).join('\n'),submitted);}
 function selectOption(field:ProfileField,value:string){setAnswers(previous=>({...previous,[field]:value}));send(`${profileLabels[field]}: ${value}`,{[field]:value});}
 async function agree(){if(!turn?.ready||!completeProfile(turn.profile)||inFlight.current)return;inFlight.current=true;setBusy(true);setError('');try{await onSubmit(turn.profile);}catch(error){setError(error instanceof Error?error.message:'Chưa lưu được kế hoạch. Hãy thử lại.');}finally{inFlight.current=false;if(mounted.current)setBusy(false);}}
 return <aside className={`chat-panel onboarding-chat onboarding-ai-chat${turn?.ready?' is-proposal':''}${session.messages.length===1?' is-first-intake':''}`} aria-label="Trò chuyện với trợ lý Vi">
  <div className="chat-heading"><span className="chat-avatar"><Sparkles size={21}/></span><div><h2>Lên kế hoạch cùng Vi</h2><p><span/>Trợ lý AI · hỏi theo câu trả lời của bạn</p></div></div>
  <div className="chat-demo-note">Câu trả lời được gửi tới dịch vụ AI để dựng hồ sơ. Ảnh không được gửi trong bước này.</div>
  <div className="chat-messages" ref={log} role="log" aria-label="Lịch sử trò chuyện" aria-live="polite">{session.messages.map((message,i)=><div className={`message ${message.role}`} key={i}>{message.role==='assistant'&&<span className="message-avatar">Vi</span>}<div><p>{message.text}</p></div></div>)}{busy&&<div className="chat-loading" role="status">Vi đang đọc câu trả lời và chuẩn bị bước tiếp theo…</div>}</div>
  {error&&<div className="ai-error" role="alert"><p>{error}</p>{pending.current&&<button className="secondary" disabled={busy} onClick={()=>void ask(pending.current!.messages,pending.current!.answers)}><RotateCcw size={16}/>Thử lại</button>}</div>}
  <div className="chat-actions">{!busy&&turn?.questions.map(question=><fieldset className="ai-question" key={question.field}><legend>{question.label}</legend>{question.options.length>0&&<div className="quick-replies">{question.options.map(option=><button type="button" key={option.value} onClick={()=>selectOption(question.field,option.value)}>{option.label}</button>)}</div>}<label htmlFor={`answer-${question.field}`} className="sr-only">{question.label}</label>{question.input_type==='textarea'?<textarea id={`answer-${question.field}`} rows={2} maxLength={600} placeholder={question.placeholder} value={answers[question.field]??''} onChange={event=>setAnswers(previous=>({...previous,[question.field]:event.target.value}))}/>:<input id={`answer-${question.field}`} type={question.input_type} inputMode={question.input_type==='number'?'decimal':undefined} step="any" maxLength={600} placeholder={question.placeholder||'Hoặc nhập câu trả lời của bạn'} value={answers[question.field]??''} onChange={event=>setAnswers(previous=>({...previous,[question.field]:event.target.value}))}/>}</fieldset>)}{!busy&&!!turn?.questions.length&&<button className="primary" onClick={submitAnswers}>Gửi câu trả lời<ArrowRight size={17}/></button>}{turn?.ready&&preview.length>0&&completeProfile(turn.profile)&&<PlanAgreement draft={turn.profile} plans={preview}/>}</div>
  {turn?.ready&&preview.length>0&&<div className="ai-agreement-actions"><button className="primary" disabled={busy||!!pending.current} onClick={()=>void agree()}><Check size={17}/>Đồng ý kế hoạch</button><p>Muốn thay đổi? Nhắn Vi bên dưới để điều chỉnh trước khi đồng ý.</p></div>}
  <form className="chat-composer" onSubmit={event=>{event.preventDefault();send();}}><label htmlFor="onboarding-free-reply">{turn?.questions.length?'Hoặc nhập nhiều thông tin trong một tin nhắn':'Nhắn cho Vi'}</label><div className="composer-input"><textarea id="onboarding-free-reply" rows={2} maxLength={1200} value={input} disabled={busy} onChange={event=>setInput(event.target.value)} placeholder="Ví dụ: 25 tuổi, 65 kg, 170 cm; muốn tăng cơ, tập tạ tối thứ Hai, Tư, Sáu…" onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();send();}}}/><button type="submit" className="send-button" aria-label="Gửi tin nhắn" disabled={busy||!input.trim()}><Send size={18}/></button></div><p>Enter để gửi · Shift+Enter để xuống dòng. Hồ sơ và hội thoại lưu trên thiết bị.</p></form>
 </aside>;
}
