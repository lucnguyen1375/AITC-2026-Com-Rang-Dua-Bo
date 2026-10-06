import type { UserProfile } from '../types';
export type ProfileField = keyof UserProfile;
export type OnboardingQuestion = {field:ProfileField;label:string;placeholder:string;input_type:'text'|'number'|'textarea';options:{label:string;value:string}[]};
export type OnboardingMessage = {role:'user'|'assistant';text:string};
export type OnboardingTurn = {reply:string;profile:Partial<UserProfile>;questions:OnboardingQuestion[];ready:boolean;blocked:boolean};
export const profileFields:ProfileField[]=['age','weightKg','heightCm','sex','goal','trainingType','trainingIntensity','weekSchedule'];
export const profileLabels:Record<ProfileField,string>={age:'Tuổi',weightKg:'Cân nặng',heightCm:'Chiều cao',sex:'Biến thể công thức',goal:'Mục tiêu',trainingType:'Loại hình tập',trainingIntensity:'Cường độ',weekSchedule:'Lịch tập'};
export function completeProfile(profile:Partial<UserProfile>):profile is UserProfile {
 return Number.isInteger(profile.age)&&profile.age!>=18&&profile.age!<=100&&Number.isFinite(profile.weightKg)&&profile.weightKg!>=30&&profile.weightKg!<=300&&Number.isFinite(profile.heightCm)&&profile.heightCm!>=100&&profile.heightCm!<=250&&['male','female','unspecified'].includes(profile.sex??'')&&['maintain','gainMuscle','loseFat'].includes(profile.goal??'')&&typeof profile.trainingType==='string'&&!!profile.trainingType.trim()&&['Nhẹ','Vừa','Cao'].includes(profile.trainingIntensity??'')&&Array.isArray(profile.weekSchedule)&&profile.weekSchedule.length===7&&profile.weekSchedule.every((day,i)=>day&&day.weekday===i+1&&typeof day.isRestDay==='boolean'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(day.startTime)&&Number.isInteger(day.durationMinutes)&&day.durationMinutes>=10&&day.durationMinutes<=300);
}
export function validOnboardingTurn(value:unknown):value is OnboardingTurn {
 if(!value||typeof value!=='object')return false;
 const turn=value as OnboardingTurn;
 return typeof turn.reply==='string'&&!!turn.profile&&typeof turn.profile==='object'&&!Array.isArray(turn.profile)&&Object.keys(turn.profile).every(field=>profileFields.includes(field as ProfileField))&&typeof turn.ready==='boolean'&&typeof turn.blocked==='boolean'&&Array.isArray(turn.questions)&&turn.questions.length<=3&&turn.questions.every(q=>q&&profileFields.includes(q.field)&&typeof q.label==='string'&&typeof q.placeholder==='string'&&['text','number','textarea'].includes(q.input_type)&&Array.isArray(q.options)&&q.options.length<=6&&q.options.every(o=>o&&typeof o.label==='string'&&typeof o.value==='string'))&&(!turn.ready||completeProfile(turn.profile));
}
export async function requestOnboarding(messages:OnboardingMessage[],profile:Partial<UserProfile>,answers:Partial<Record<ProfileField,string>>):Promise<OnboardingTurn> {
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),55000);
 try {
  const response=await fetch('/api/onboarding',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({messages:messages.slice(-40).map(m=>({role:m.role,content:m.text.slice(0,4000)})),profile,answers})});
  const result:unknown=await response.json().catch(()=>null);
  if(!response.ok){throw new Error(result&&typeof result==='object'&&'error' in result&&typeof result.error==='string'?result.error:'Chưa kết nối được Vi. Hãy kiểm tra máy chủ AI rồi thử lại.');}
  if(!validOnboardingTurn(result))throw new Error('Vi trả về dữ liệu chưa hợp lệ. Hãy thử lại; câu trả lời vẫn được giữ.');
  return result;
 }catch(error){if(error instanceof Error&&error.name==='AbortError')throw new Error('Vi phản hồi lâu hơn dự kiến. Hãy thử lại; câu trả lời vẫn được giữ.');if(error instanceof TypeError)throw new Error('Chưa kết nối được máy chủ AI. Hãy kiểm tra kết nối và thử lại.');throw error;}
 finally{clearTimeout(timer);}
}
