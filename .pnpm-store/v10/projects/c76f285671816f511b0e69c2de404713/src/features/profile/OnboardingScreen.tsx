import { lazy, Suspense, useState, type ReactNode } from 'react';
import { Sprout, ArrowRight, Check, ShieldCheck, RotateCcw } from 'lucide-react';
import type { UserProfile } from '../../types';
import type { OnboardingStage } from '../../components/AssistantChat';
import OnboardingAssistant from '../../components/OnboardingAssistant';
import { SafetyNotice } from '../../components/SafetyNotice';
const CoachAvatar=lazy(()=>import('../../components/CoachAvatar'));
type Props={draft:UserProfile;stage:OnboardingStage;talking:boolean;onDraft:(draft:UserProfile)=>void;onStage:(stage:OnboardingStage)=>void;onSubmit:(profile:UserProfile)=>Promise<void>;onTalking:(talking:boolean)=>void;onReset:()=>void;onManual:()=>void;manualContent?:ReactNode};
export function OnboardingScreen({stage,talking,onDraft,onStage,onSubmit,onTalking,onReset}:Props){
 const [collected,setCollected]=useState(0);
 return <main className="onboarding-screen">
  <div className="onboarding-toolbar"><a className="brand" href="#" onClick={event=>event.preventDefault()} aria-label="Bữa Việt"><span className="brand-symbol"><Sprout size={24}/></span><span>Bữa<span className="brand-viet">Việt</span><small>Ăn theo nhịp tập</small></span></a><span className="onboarding-privacy"><ShieldCheck size={16}/>Hồ sơ lưu trên thiết bị</span><button className="text-button" onClick={onReset}><RotateCcw size={16}/>Bắt đầu lại</button></div>
  <div className="onboarding-welcome"><h1>Làm quen một chút.<br/><span>Lên kế hoạch cùng Vi.</span></h1><p>Vi hỏi theo câu trả lời của bạn. Chọn nhanh hoặc tự nhập, rồi cùng thống nhất kế hoạch.</p></div>
  <div className="onboarding-experience">
   <div className="onboarding-coach"><Suspense fallback={<div className="coach-stage">Đang chuẩn bị Vi…</div>}><CoachAvatar talking={talking}/></Suspense><div className="onboarding-coach-note"><Check size={17}/><p>Bạn chia sẻ theo cách của mình.<br/>Vi hỏi thêm những gì còn thiếu.</p></div></div>
   <div className="onboarding-quiz"><div className="quiz-progress"><div><strong>{collected} / 8 thông tin đã rõ</strong><span>{stage==='confirm'?'Thống nhất kế hoạch':'Làm quen cùng Vi'}</span></div><ol aria-label="Tiến trình thu thập hồ sơ">{Array.from({length:8},(_,index)=><li key={index} className={index<collected?'filled':''}><span className="sr-only">Thông tin {index+1}{index<collected?' đã có':''}</span></li>)}</ol></div><OnboardingAssistant onDraft={onDraft} onStage={onStage} onSubmit={onSubmit} onTalking={onTalking} onProgress={setCollected}/></div>
  </div>
  <div className="onboarding-close"><span><ArrowRight size={16}/>Kế hoạch chỉ xuất hiện trong ứng dụng sau khi bạn chọn Đồng ý kế hoạch.</span><SafetyNotice/></div>
 </main>;
}
