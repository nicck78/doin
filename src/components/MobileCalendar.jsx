import React, { useState } from 'react';
import { addDays, diffInDays, generateSevenDaysWindow, getColorById, getFriendlyDateLabel, getTodayString, getWeekdayName, isOverdueSingleDayTask, isTaskActiveOnDate, isUnscheduledTask } from '../utils/dateUtils.js';
import { getMobileTimeline } from '../utils/mobileTimeline.js';
import { useLanguage } from '../locales/LanguageContext.jsx';

export default function MobileCalendar({ tasks, dailyReviews, focusSessions, onOpenReviewModal, onEditTask, onToggleComplete, onAddNewTaskForDate, onScheduleTaskToday, onStripTaskDate, onQuickAddUnscheduled, onAddNewUnscheduledTask }) {
  const { t, lang } = useLanguage();
  const today = getTodayString();
  const [centerDate, setCenterDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [quickTitle, setQuickTitle] = useState('');
  const days = generateSevenDaysWindow(centerDate);
  const { singleDayByDate, bars, outside } = getMobileTimeline(tasks, days);
  const selectedTasks = tasks.filter(task => isTaskActiveOnDate(task, selectedDate));
  const focusSeconds = focusSessions.filter(session => session.date === selectedDate).reduce((sum, session) => sum + (session.durationSeconds || 0), 0);
  const unscheduled = tasks.filter(task => isUnscheduledTask(task) && !task.isCompleted);
  const overdue = tasks.filter(task => isOverdueSingleDayTask(task, today));
  const card = 'rounded-xl border border-[#e8edf2] dark:border-[#263044] bg-white dark:bg-[#10141e] p-4';

  function moveWindow(offset) {
    const next = addDays(centerDate, offset);
    setCenterDate(next);
    setSelectedDate(next);
  }
  function resetWindow() {
    setCenterDate(today);
    setSelectedDate(today);
  }

  return <div className="mx-auto max-w-xl px-3 py-5 space-y-4">
    <div className="flex items-center justify-between gap-2 px-1">
      <h1 className="text-xl font-bold">{t('timeline.title')}</h1>
      <button className="text-sm px-3 py-2 rounded-lg border flex-shrink-0" onClick={resetWindow}>{t('timeline.today')}</button>
    </div>

    <section className={card} aria-label={t('timeline.weekOverview')}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <button aria-label={t('timeline.prev3')} className="min-w-10 min-h-10 text-xl" onClick={() => moveWindow(-3)}>‹</button>
        <div className="text-center text-xs font-semibold">{days[0].slice(5)} — {days[6].slice(5)}</div>
        <button aria-label={t('timeline.next3')} className="min-w-10 min-h-10 text-xl" onClick={() => moveWindow(3)}>›</button>
      </div>

      <div className="grid grid-cols-7 gap-0.5" role="group" aria-label={t('timeline.weekOverview')}>
        {days.map(date => <button key={date} type="button" onClick={() => setSelectedDate(date)} aria-label={getFriendlyDateLabel(date, lang)} aria-pressed={selectedDate === date}
          className={`min-w-0 min-h-11 rounded-md py-1 text-center ${selectedDate === date ? 'bg-[#0f2847] text-white dark:bg-blue-600' : date === today ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-slate-50 text-slate-600 dark:bg-[#171f2d] dark:text-slate-300'}`}>
          <span className="block text-[10px] font-medium leading-tight">{lang === 'zh' ? getWeekdayName(date, lang).slice(1) : getWeekdayName(date, lang)}</span>
          <span className="block text-xs font-bold leading-tight">{date.slice(8)}</span>
        </button>)}
      </div>

      <div className="mt-4 space-y-1.5" aria-label={t('timeline.multiDay')}>
        {bars.length === 0 && <p className="text-xs text-slate-400">{t('timeline.noMultiDayInWeek')}</p>}
        {bars.map(({ task, startColumn, span, startsBefore, endsAfter }) => <div key={task.id} className="grid grid-cols-7 gap-0.5">
          <button type="button" onClick={() => onEditTask(task)} title={`${task.title} · ${task.startDate} → ${task.dueDate}`} aria-label={`${task.title} · ${task.startDate} → ${task.dueDate}`}
            style={{ gridColumn: `${startColumn} / span ${span}`, backgroundColor: getColorById(task.color).darkBg }}
            className={`min-w-0 min-h-11 rounded-md px-2 py-1.5 text-left text-[11px] leading-tight font-medium text-white flex items-start gap-1 ${task.isCompleted ? 'opacity-60 line-through' : ''}`}>
            {startsBefore && <span className="flex-shrink-0">←</span>}
            <span className="min-w-0 flex-1 whitespace-normal break-all">{task.title}</span>
            {endsAfter && <span className="flex-shrink-0">→</span>}
          </button>
        </div>)}
      </div>

      <div className="grid grid-cols-7 gap-0.5 mt-4" aria-label={t('timeline.dailyPlans')}>
        {days.map(date => {
          const dayTasks = singleDayByDate[date];
          return <div key={date} className={`min-w-0 rounded-md p-0.5 space-y-1 ${selectedDate === date ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-slate-50 dark:bg-[#171f2d]'}`}>
            {dayTasks.map(task => <button key={task.id} type="button" onClick={() => { setSelectedDate(date); onEditTask(task); }} aria-label={`${getFriendlyDateLabel(date, lang)} · ${task.title}`}
              className={`w-full min-w-0 min-h-11 rounded-md px-1.5 py-2 text-[11px] leading-tight text-left text-slate-900 whitespace-normal break-all border-t-[3px] ${task.isCompleted ? 'line-through opacity-60' : ''}`}
              style={{ backgroundColor: getColorById(task.color).lightBg, borderTopColor: getColorById(task.color).hex }}>{task.title}</button>)}
          </div>;
        })}
      </div>
      <p className="text-[11px] text-slate-400 mt-3">{t('timeline.tapDayHint')}</p>
    </section>

    <section className={card} aria-label={t('timeline.dayDetails')}>
      <div className="flex items-center justify-between gap-2">
        <div><h2 className="font-bold">{getFriendlyDateLabel(selectedDate, lang)}</h2><p className="text-xs text-slate-400">{selectedDate}</p></div>
        <button className="text-sm text-blue-600 dark:text-blue-400 min-h-10" onClick={() => onAddNewTaskForDate(selectedDate)}>{t('timeline.addTask')}</button>
      </div>
      <div className="mt-2">
        {selectedTasks.length === 0 && <p className="text-sm text-slate-400 py-3">{t('timeline.noDayTasks')}</p>}
        {selectedTasks.map(task => <div key={task.id} className="flex items-center gap-3 py-2 border-t border-[#f1f3f5] dark:border-[#1a2233]">
          <button type="button" aria-label={t(task.isCompleted ? 'common.markIncomplete' : 'common.markComplete')} className="w-9 h-9 rounded border flex-shrink-0" onClick={() => onToggleComplete(task.id)}>{task.isCompleted ? '✓' : ''}</button>
          <button type="button" className={`flex-1 text-left text-sm min-w-0 break-words ${task.isCompleted ? 'line-through text-slate-400' : ''}`} onClick={() => onEditTask(task)}>
            <span style={{ color: getColorById(task.color).hex }}>● </span>{task.title}
            {task.startDate !== task.dueDate && <span className="block text-xs text-slate-400 ml-4">{task.startDate} → {task.dueDate}</span>}
          </button>
        </div>)}
      </div>
      <div className="flex justify-between mt-3 pt-3 border-t text-xs"><span>{t('timeline.focusLabel')} {Math.round(focusSeconds / 60)}m</span><button onClick={() => onOpenReviewModal(selectedDate)}>{dailyReviews[selectedDate] ? '★ ' : ''}{t('modal.journalTitle')}</button></div>
    </section>

    {outside.length > 0 && <section className={card}>
      <h2 className="font-bold mb-2">{t('timeline.outsideWeek')} · {outside.length}</h2>
      <div className="space-y-2">{outside.map(task => {
        const daysLeft = diffInDays(today, task.dueDate);
        return <button key={task.id} className="block w-full text-left border-t pt-2 text-sm" onClick={() => onEditTask(task)}>
          <span style={{ color: getColorById(task.color).hex }}>● </span>{task.title}
          <span className="block text-xs text-slate-400 mt-1">{task.startDate} → {task.dueDate} · {daysLeft < 0 ? t('timeline.multiDayOverdue', { days: -daysLeft }) : daysLeft === 0 ? t('timeline.dueToday') : t('timeline.multiDayRemaining', { days: daysLeft })}</span>
        </button>;
      })}</div>
    </section>}

    <section className={card}>
      <div className="flex justify-between"><h2 className="font-bold">{t('timeline.unscheduled')} · {unscheduled.length}</h2><button aria-label={t('modal.newTask')} className="text-sm text-blue-600" onClick={onAddNewUnscheduledTask}>＋</button></div>
      <form className="mt-3" onSubmit={event => { event.preventDefault(); if (quickTitle.trim()) onQuickAddUnscheduled(quickTitle.trim()); setQuickTitle(''); }}><input className="w-full p-2 rounded-lg border bg-transparent text-sm" placeholder={t('timeline.unscheduled.placeholder')} value={quickTitle} onChange={event => setQuickTitle(event.target.value)} /></form>
      <div className="space-y-2 mt-3">{unscheduled.map(task => <div key={task.id} className="flex gap-2 items-center border-t pt-2"><button className="flex-1 text-left text-sm" onClick={() => onEditTask(task)}>{task.title}</button><button className="text-xs px-2 py-1 border rounded" onClick={() => onScheduleTaskToday(task)}>{t('timeline.doToday')}</button><button aria-label={t('common.markComplete')} className="text-xs px-2 py-1 border rounded" onClick={() => onToggleComplete(task.id)}>✓</button></div>)}</div>
    </section>
    <section className={card}><h2 className="font-bold mb-2">{t('timeline.overdue')} · {overdue.length}</h2><div className="space-y-2">{overdue.map(task => <div key={task.id} className="border-t pt-2 space-y-2"><button className="text-left text-sm block" onClick={() => onEditTask(task)}>{task.title} <span className="text-slate-400">{task.dueDate || task.startDate}</span></button><div className="flex gap-2"><button className="text-xs px-2 py-1 border rounded" onClick={() => onScheduleTaskToday(task)}>{t('timeline.doToday')}</button><button className="text-xs px-2 py-1 border rounded" onClick={() => onEditTask(task)}>{t('timeline.reschedule')}</button><button className="text-xs px-2 py-1 border rounded" onClick={() => onStripTaskDate(task)}>{t('timeline.sendToUnscheduled')}</button></div></div>)}</div></section>
  </div>;
}
