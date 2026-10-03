import React, { useState } from 'react';
import {
  addDays,
  diffInDays,
  generateSevenDaysWindow,
  getColorById,
  getFriendlyDateLabel,
  getPendingMultiDayTasks,
  getTodayString,
  isMultiDayTask,
  isOverdueSingleDayTask,
  isTaskActiveOnDate,
  isUnscheduledTask
} from '../utils/dateUtils.js';
import { useLanguage } from '../locales/LanguageContext.jsx';

export default function MobileCalendar({ tasks, dailyReviews, focusSessions, onOpenReviewModal, onEditTask, onToggleComplete, onAddNewTaskForDate, onScheduleTaskToday, onStripTaskDate, onQuickAddUnscheduled, onAddNewUnscheduledTask }) {
  const { t, lang } = useLanguage();
  const today = getTodayString();
  const [centerDate, setCenterDate] = useState(today);
  const [quickTitle, setQuickTitle] = useState('');
  const days = generateSevenDaysWindow(centerDate);
  const multiDayTasks = getPendingMultiDayTasks(tasks);
  const unscheduled = tasks.filter(task => isUnscheduledTask(task) && !task.isCompleted);
  const overdue = tasks.filter(task => isOverdueSingleDayTask(task, today));
  const card = 'rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] bg-white dark:bg-[#10141e] p-4';

  return <div className="mx-auto max-w-xl px-4 py-5 space-y-4">
    <div className="flex items-center justify-between gap-2">
      <div><h1 className="text-xl font-bold">{t('timeline.title')}</h1><p className="text-xs text-slate-400 mt-1">{t('timeline.mobileSubtitle')}</p></div>
      <button className="text-sm px-3 py-2 rounded-lg border flex-shrink-0" onClick={() => setCenterDate(today)}>{t('timeline.today')}</button>
    </div>
    <div className={`${card} flex items-center justify-between gap-2`}>
      <button aria-label={t('timeline.prev3')} className="px-3 py-2 text-lg" onClick={() => setCenterDate(addDays(centerDate, -3))}>‹</button>
      <div className="text-center text-sm font-semibold">{days[0]} — {days[6]}</div>
      <button aria-label={t('timeline.next3')} className="px-3 py-2 text-lg" onClick={() => setCenterDate(addDays(centerDate, 3))}>›</button>
    </div>

    <section className={card}>
      <h2 className="font-bold mb-3">{t('timeline.multiDay')} · {multiDayTasks.length}</h2>
      {multiDayTasks.length === 0 && <p className="text-sm text-slate-400">{t('timeline.multiDayEmpty')}</p>}
      <div className="space-y-2">{multiDayTasks.map(task => {
        const daysLeft = diffInDays(today, task.dueDate);
        return <div key={task.id} className="flex items-start gap-3 border-t border-[#f1f3f5] dark:border-[#1a2233] pt-3">
          <button aria-label={lang === 'en' ? 'Complete task' : '标记完成'} className="w-7 h-7 rounded border flex-shrink-0" onClick={() => onToggleComplete(task.id)} />
          <button className="flex-1 text-left min-w-0" onClick={() => onEditTask(task)}>
            <span className="block text-sm font-medium break-words"><span style={{ color: getColorById(task.color).hex }}>● </span>{task.title}</span>
            <span className="block text-xs text-slate-500 mt-1">{task.startDate} → {task.dueDate}</span>
            <span className={`block text-xs mt-1 ${daysLeft < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
              {daysLeft < 0 ? t('timeline.multiDayOverdue', { days: -daysLeft }) : daysLeft === 0 ? t('timeline.dueToday') : t('timeline.multiDayRemaining', { days: daysLeft })}
            </span>
          </button>
        </div>;
      })}</div>
    </section>

    <section className="space-y-3" aria-label={t('timeline.dailyPlans')}>
      <h2 className="font-bold px-1">{t('timeline.dailyPlans')}</h2>
      {days.map(date => {
        const dayTasks = tasks.filter(task => !isMultiDayTask(task) && isTaskActiveOnDate(task, date));
        const focusSeconds = focusSessions.filter(session => session.date === date).reduce((sum, session) => sum + (session.durationSeconds || 0), 0);
        return <div key={date} className={card}>
          <div className="flex justify-between items-center gap-2 mb-3">
            <div><h3 className="font-bold">{getFriendlyDateLabel(date, lang)}</h3><div className="text-xs text-slate-400">{date}</div></div>
            <button className="text-sm text-blue-600 flex-shrink-0" onClick={() => onAddNewTaskForDate(date)}>{t('timeline.addTask')}</button>
          </div>
          {dayTasks.length === 0 && <p className="text-sm text-slate-400 py-3">{t('timeline.noDayTasks')}</p>}
          <div className="space-y-2">{dayTasks.map(task => <div key={task.id} className="flex items-center gap-3 py-2 border-t border-[#f1f3f5] dark:border-[#1a2233]">
            <button aria-label={task.isCompleted ? (lang === 'en' ? 'Mark incomplete' : '取消完成') : (lang === 'en' ? 'Complete task' : '标记完成')} className="w-7 h-7 rounded border flex-shrink-0" onClick={() => onToggleComplete(task.id)}>{task.isCompleted ? '✓' : ''}</button>
            <button className={`flex-1 text-left text-sm min-w-0 break-words ${task.isCompleted ? 'line-through text-slate-400' : ''}`} onClick={() => onEditTask(task)}><span style={{ color: getColorById(task.color).hex }}>● </span>{task.title}</button>
          </div>)}</div>
          <div className="flex justify-between mt-3 pt-3 border-t text-xs"><span>{t('timeline.focusLabel')} {Math.round(focusSeconds / 60)}m</span><button onClick={() => onOpenReviewModal(date)}>{dailyReviews[date] ? '★ ' : ''}{t('modal.journalTitle')}</button></div>
        </div>;
      })}
    </section>

    <section className={card}>
      <div className="flex justify-between"><h2 className="font-bold">{t('timeline.unscheduled')} · {unscheduled.length}</h2><button className="text-sm text-blue-600" onClick={onAddNewUnscheduledTask}>＋</button></div>
      <form className="mt-3" onSubmit={event => { event.preventDefault(); if (quickTitle.trim()) onQuickAddUnscheduled(quickTitle.trim()); setQuickTitle(''); }}><input className="w-full p-2 rounded-lg border bg-transparent text-sm" placeholder={t('timeline.unscheduled.placeholder')} value={quickTitle} onChange={event => setQuickTitle(event.target.value)} /></form>
      <div className="space-y-2 mt-3">{unscheduled.map(task => <div key={task.id} className="flex gap-2 items-center border-t pt-2"><button className="flex-1 text-left text-sm" onClick={() => onEditTask(task)}>{task.title}</button><button className="text-xs px-2 py-1 border rounded" onClick={() => onScheduleTaskToday(task)}>{t('timeline.doToday')}</button><button className="text-xs px-2 py-1 border rounded" onClick={() => onToggleComplete(task.id)}>✓</button></div>)}</div>
    </section>
    <section className={card}><h2 className="font-bold mb-2">{t('timeline.overdue')} · {overdue.length}</h2><div className="space-y-2">{overdue.map(task => <div key={task.id} className="border-t pt-2 space-y-2"><button className="text-left text-sm block" onClick={() => onEditTask(task)}>{task.title} <span className="text-slate-400">{task.dueDate || task.startDate}</span></button><div className="flex gap-2"><button className="text-xs px-2 py-1 border rounded" onClick={() => onScheduleTaskToday(task)}>{t('timeline.doToday')}</button><button className="text-xs px-2 py-1 border rounded" onClick={() => onEditTask(task)}>{t('timeline.schedule')}</button><button className="text-xs px-2 py-1 border rounded" onClick={() => onStripTaskDate(task)}>{t('timeline.unscheduled')}</button></div></div>)}</div></section>
  </div>;
}
