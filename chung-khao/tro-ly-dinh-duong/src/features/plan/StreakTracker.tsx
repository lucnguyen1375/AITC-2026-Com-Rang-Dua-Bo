import { Check, Dumbbell, Flame, Moon, Trophy, Utensils, X } from 'lucide-react';
import { dateKey, weekdays } from '../../data/fixtures';
import type { CheckIns, DailyCheckIn, UserProfile } from '../../types';
import { isDayComplete, streakMilestones, streakSummary } from '../../services/streak';
import './streak.css';

type Props = {
  profile: UserProfile;
  dates: Date[];
  checkIns: CheckIns;
  celebration: string;
  onDismiss: () => void;
  onCheckIn: (date: string, category: keyof DailyCheckIn, checked: boolean) => void;
};

export function StreakTracker({ profile, dates, checkIns, celebration, onDismiss, onCheckIn }: Props) {
  const today = dateKey(new Date());
  const { current, longest, completed } = streakSummary(checkIns);
  const nextMilestone = streakMilestones.find(milestone => milestone > current) ?? (Math.floor(current / 7) + 1) * 7;
  const todayComplete = isDayComplete(checkIns, today);
  return <section className="streak-tracker" aria-labelledby="streak-title">
    <div className="streak-heading">
      <div className={`streak-flame ${current ? 'is-lit' : ''}`} aria-hidden="true"><Flame size={36} strokeWidth={1.8}/></div>
      <div>
        <h2 id="streak-title">{current ? `${current} ngày giữ lửa` : 'Nhóm lửa từ hôm nay'}</h2>
        <p>{todayComplete ? 'Hôm nay đã trọn nhịp. Bạn có thể tự hào về mình!' : current ? 'Thêm một ngày ăn đủ, vận động vừa sức để nối dài streak.' : longest ? 'Một nhịp mới vẫn là một bước tiến. Bắt đầu lại khi bạn sẵn sàng.' : 'Mỗi ngày chăm sóc bản thân đều đáng được ghi nhận.'}</p>
      </div>
    </div>
    <div className="streak-stats"><span><Trophy size={16}/>Dài nhất: <strong>{longest} ngày</strong></span><span>Đã hoàn thành: <strong>{completed} ngày</strong></span></div>
    <ol className="streak-milestones" aria-label="Các mốc streak">{streakMilestones.map(milestone => <li key={milestone} className={longest >= milestone ? 'unlocked' : ''}><span>{longest >= milestone ? <Check size={14}/> : <Flame size={14}/>}</span>{milestone} ngày<span className="sr-only">{longest >= milestone ? ', đã đạt' : ', chưa đạt'}</span></li>)}</ol>
    <p className="streak-next">{nextMilestone - current} ngày nữa đến mốc {nextMilestone} ngày liên tiếp. Giữ nhịp theo khả năng của bạn nhé.</p>
    <div className="streak-celebration" role="status" aria-live="polite" aria-atomic="true">{celebration && <><Flame size={22} aria-hidden="true"/><p>{celebration}</p><button className="icon-button" aria-label="Đóng lời động viên" onClick={onDismiss}><X size={17}/></button></>}</div>
    <div className="checkin-heading"><h3>Nhịp của tuần này</h3><p>Tick cả hai mục để tính một ngày streak. Có thể bổ sung hôm nay và các ngày đã qua trong tuần.</p></div>
    <table className="checkin-table"><caption className="sr-only">Ghi nhận dinh dưỡng và tập luyện hoặc phục hồi theo ngày</caption><thead><tr><th scope="col">Ngày</th><th scope="col"><Utensils size={16} aria-hidden="true"/>Dinh dưỡng</th><th scope="col"><Dumbbell size={16} aria-hidden="true"/>Tập / nghỉ</th></tr></thead>
      <tbody>{dates.map((date, index) => {
        const key = dateKey(date);
        const future = key > today;
        const rest = profile.weekSchedule[index].isRestDay;
        const complete = isDayComplete(checkIns, key);
        return <tr key={key} className={`${key === today ? 'is-today' : ''} ${complete ? 'is-complete' : ''} ${future ? 'is-future' : ''}`}>
          <th scope="row"><div><span>{weekdays[index]} <small>{date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</small></span>{complete && <Flame size={15} aria-label="Đã hoàn thành ngày"/>}</div><small>{future ? 'Chưa đến ngày' : key === today ? 'Hôm nay' : 'Đã qua'}</small></th>
          <td><label><input type="checkbox" checked={Boolean(checkIns[key]?.nutrition)} disabled={future} aria-label={`Dinh dưỡng ${weekdays[index]}`} aria-describedby={checkIns[key]?.nutritionNote ? `nutrition-note-${key}` : undefined} onChange={event => onCheckIn(key, 'nutrition', event.target.checked)}/><span className="sr-only">Đã chăm sóc dinh dưỡng</span></label>{checkIns[key]?.nutritionNote && <small className="checkin-item-note" id={`nutrition-note-${key}`}>{checkIns[key].nutritionNote}</small>}</td>
          <td><label><input type="checkbox" checked={Boolean(checkIns[key]?.training)} disabled={future} aria-label={`${rest ? 'Phục hồi' : 'Tập luyện'} ${weekdays[index]}`} aria-describedby={checkIns[key]?.trainingNote ? `training-note-${key}` : undefined} onChange={event => onCheckIn(key, 'training', event.target.checked)}/><span>{rest ? <><Moon size={13} aria-hidden="true"/>Nghỉ</> : 'Tập'}</span></label>{checkIns[key]?.trainingNote && <small className="checkin-item-note" id={`training-note-${key}`}>{checkIns[key].trainingNote}</small>}</td>
        </tr>;
      })}</tbody></table>
    <p className="checkin-note">Khởi tạo sẵn 3 ngày mẫu trước hôm nay để trải nghiệm streak. Dinh dưỡng: đã ăn uống theo kế hoạch phù hợp với bạn. Tập / nghỉ: đã vận động hoặc phục hồi theo lịch. Ngày nghỉ cũng giúp giữ lửa. Bạn có thể sửa tick để khớp với thực tế.</p>
  </section>;
}
