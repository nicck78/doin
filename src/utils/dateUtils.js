/**
 * 日期与时间轴工具库 (dateUtils.js)
 * 纯原生 JS 实现，零多余依赖
 */
export { formatTimeDisplay } from './timerEngine.js';

// 格式化为 YYYY-MM-DD
export function formatDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取今天日期字符串 (YYYY-MM-DD)
export function getTodayString() {
  return formatDate(new Date());
}

// 日期加减天数
export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

// 计算两日期间隔天数 (正整数)
export function diffInDays(startStr, endStr) {
  const s = new Date(startStr + 'T00:00:00');
  const e = new Date(endStr + 'T00:00:00');
  const diffTime = e - s;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// 星期几中文映射
export function getWeekdayName(dateStr) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const d = new Date(dateStr + 'T00:00:00');
  return weekdays[d.getDay()];
}

// 友好日期显示（例如："今天·09-08" 或 "周三·09-09"）
export function getFriendlyDateLabel(dateStr) {
  const today = getTodayString();
  const d = new Date(dateStr + 'T00:00:00');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const monthDay = `${mm}/${dd}`;

  if (dateStr === today) return `今天 · ${monthDay}`;
  if (dateStr === addDays(today, 1)) return `明天 · ${monthDay}`;
  if (dateStr === addDays(today, -1)) return `昨天 · ${monthDay}`;
  return `${getWeekdayName(dateStr)} · ${monthDay}`;
}

// 生成以某天为基准的滚动 7 天窗口：[中心天-2, 中心天-1, 中心天, 中心天+1, 中心天+2, 中心天+3, 中心天+4]
export function generateSevenDaysWindow(centerDateStr = getTodayString()) {
  const days = [];
  for (let i = -2; i <= 4; i++) {
    days.push(addDays(centerDateStr, i));
  }
  return days;
}

// 检查任务是否在某一天有效/进行中
export function isTaskActiveOnDate(task, dateStr) {
  const start = task.startDate || task.dueDate;
  const end = task.dueDate || task.startDate;
  return dateStr >= start && dateStr <= end;
}

// 检查是否为跨多天的长期待办
export function isMultiDayTask(task) {
  if (!task.startDate || !task.dueDate) return false;
  return task.startDate < task.dueDate;
}

// 预设高颜值、现代、区分度高的色彩池（兼顾 Light 和 Dark 模式）
export const TASK_COLOR_PALETTE = [
  { id: 'indigo', name: '极光蓝', bg: 'bg-indigo-500', text: 'text-white', hex: '#6366f1', lightBg: '#e0e7ff', darkBg: '#312e81', border: '#818cf8' },
  { id: 'emerald', name: '薄荷绿', bg: 'bg-emerald-500', text: 'text-white', hex: '#10b981', lightBg: '#d1fae5', darkBg: '#064e3b', border: '#34d399' },
  { id: 'amber', name: '晨曦橙', bg: 'bg-amber-500', text: 'text-white', hex: '#f59e0b', lightBg: '#fef3c7', darkBg: '#78350f', border: '#fbbf24' },
  { id: 'rose', name: '珊瑚粉', bg: 'bg-rose-500', text: 'text-white', hex: '#f43f5e', lightBg: '#ffe4e6', darkBg: '#881337', border: '#fb7185' },
  { id: 'violet', name: '星空紫', bg: 'bg-violet-500', text: 'text-white', hex: '#8b5cf6', lightBg: '#ede9fe', darkBg: '#4c1d95', border: '#a78bfa' },
  { id: 'cyan', name: '青空蓝', bg: 'bg-cyan-500', text: 'text-white', hex: '#06b6d4', lightBg: '#cffafe', darkBg: '#164e63', border: '#22d3ee' }
];

export function getColorById(colorId) {
  return TASK_COLOR_PALETTE.find(c => c.id === colorId || c.hex === colorId) || TASK_COLOR_PALETTE[0];
}
