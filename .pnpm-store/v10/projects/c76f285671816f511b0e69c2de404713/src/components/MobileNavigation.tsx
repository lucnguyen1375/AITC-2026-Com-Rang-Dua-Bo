import { CalendarDays, Camera, MessageCircle, UserRound, Utensils } from 'lucide-react';
export type MobileDestination = 'plan' | 'meal' | 'chat' | 'profile';
export function MobileNavigation({ active, onNavigate, onCapture }: { active: MobileDestination; onNavigate: (destination: MobileDestination) => void; onCapture: () => void }) {
 const links = [{ id: 'plan', label: 'Kế hoạch', Icon: CalendarDays }, { id: 'meal', label: 'Bữa ăn', Icon: Utensils }, { id: 'chat', label: 'Trò chuyện', Icon: MessageCircle }, { id: 'profile', label: 'Hồ sơ', Icon: UserRound }] as const;
 return <nav className="mobile-navigation" aria-label="Điều hướng điện thoại">
  {links.slice(0, 2).map(({ id, label, Icon }) => <button key={id} aria-current={active === id ? 'page' : undefined} onClick={() => onNavigate(id)}><Icon size={22}/><span>{label}</span></button>)}
  <button className="mobile-capture" aria-label="Chụp ảnh bữa ăn" onClick={onCapture}><Camera size={25}/></button>
  {links.slice(2).map(({ id, label, Icon }) => <button key={id} aria-current={active === id ? 'page' : undefined} onClick={() => onNavigate(id)}><Icon size={22}/><span>{label}</span></button>)}
 </nav>;
}
