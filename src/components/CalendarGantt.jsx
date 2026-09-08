import React, { useState } from 'react';
import { 
  getTodayString, 
  generateSevenDaysWindow, 
  addDays, 
  getWeekdayName, 
  getColorById,
  isMultiDayTask,
  formatTimeDisplay
} from '../utils/dateUtils.js';

export default function CalendarGantt({
  tasks,
  dailyReviews = {},
  focusSessions = [],
  onOpenReviewModal,
  onEditTask,
  onToggleComplete
}) {
  const today = getTodayString();
  const [centerDate, setCenterDate] = useState(today);

  const daysWindow = generateSevenDaysWindow(centerDate);
  const minDate = daysWindow[0];
  const maxDate = daysWindow[daysWindow.length - 1];

  const handlePrev = () => setCenterDate(addDays(centerDate, -3));
  const handleNext = () => setCenterDate(addDays(centerDate, 3));
  const handleResetToday = () => setCenterDate(today);

  const visibleMultiDayTasks = tasks.filter(task => {
    if (!isMultiDayTask(task)) return false;
    const start = task.startDate;
    const end = task.dueDate;
    return start <= maxDate && end >= minDate;
  });

  const singleDayTasksByDate = {};
  daysWindow.forEach(d => {
    singleDayTasksByDate[d] = tasks.filter(task => {
      if (isMultiDayTask(task)) return false;
      return task.dueDate === d;
    });
  });

  const focusSecondsByDate = {};
  daysWindow.forEach(d => {
    const sessions = focusSessions.filter(s => s.date === d);
    focusSecondsByDate[d] = sessions.reduce((acc, cur) => acc + (cur.durationSeconds || 0), 0);
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-5 animate-soft">
      
      {/* 顶部标题与翻页 */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f5] dark:border-[#1a2233]">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          全景
        </h1>

        <div className="flex items-center space-x-1 p-0.5 bg-[#f8f9fa] dark:bg-[#121724] rounded-lg border border-[#f1f3f5] dark:border-[#1a2233]">
          <button
            onClick={handlePrev}
            className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded"
          >
            ◀
          </button>
          <button
            onClick={handleResetToday}
            className="px-2.5 py-0.5 text-xs font-bold bg-white dark:bg-[#1e2638] text-[#0f2847] dark:text-blue-400 rounded shadow-sm"
          >
            今天
          </button>
          <button
            onClick={handleNext}
            className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded"
          >
            ▶
          </button>
        </div>
      </div>

      {/* 核心时间网格 */}
      <div className="bg-white dark:bg-[#10141e] rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] shadow-sm overflow-hidden">
        
        {/* 7天列头 */}
        <div className="grid grid-cols-7 border-b border-[#f1f3f5] dark:border-[#1a2233] bg-[#fcfcfd] dark:bg-[#0c101a]">
          {daysWindow.map((d) => {
            const isToday = d === today;
            const reviewObj = dailyReviews[d];
            const hasReview = Boolean(reviewObj && (reviewObj.content || reviewObj.summary || reviewObj.reflection));
            const weekday = getWeekdayName(d);
            const displayDate = d.slice(5);

            return (
              <div 
                key={d} 
                className={`p-2.5 text-center border-r last:border-r-0 border-[#f1f3f5] dark:border-[#1a2233] ${
                  isToday ? 'bg-[#fef8ed]/40 dark:bg-[#e5a024]/5' : ''
                }`}
              >
                <div className={`text-xs font-bold ${isToday ? 'text-[#b47812] dark:text-[#f59e0b]' : 'text-slate-700 dark:text-slate-300'}`}>
                  {isToday ? '今天' : weekday}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {displayDate}
                </div>

                <button
                  onClick={() => onOpenReviewModal(d)}
                  title="日志"
                  className={`mt-1.5 w-full py-0.5 px-1 rounded text-[10px] font-medium transition-all ${
                    hasReview
                      ? 'bg-[#fef8ed] dark:bg-[#e5a024]/10 text-[#b47812] dark:text-[#f59e0b] border border-[#fbe8c7] dark:border-[#e5a024]/20'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent hover:border-[#f1f3f5]'
                  }`}
                >
                  {hasReview ? '★ 日志' : '＋'}
                </button>
              </div>
            );
          })}
        </div>

        {/* 跨天任务横向贯通条带 */}
        {visibleMultiDayTasks.length > 0 && (
          <div className="p-3.5 space-y-2 bg-[#fcfcfd]/50 dark:bg-[#0b0f19]/30 border-b border-[#f1f3f5] dark:border-[#1a2233]">
            {visibleMultiDayTasks.map(task => {
              const colorObj = getColorById(task.color);
              const startIndex = daysWindow.findIndex(d => d >= task.startDate);
              const actualStart = startIndex === -1 ? 0 : startIndex;

              let endIndex = daysWindow.findIndex(d => d > task.dueDate);
              if (endIndex === -1) endIndex = 7;

              const colStart = actualStart + 1;
              const colSpan = Math.max(1, endIndex - actualStart);

              return (
                <div key={task.id} className="grid grid-cols-7 gap-1 items-center">
                  <div
                    style={{
                      gridColumn: `${colStart} / span ${colSpan}`,
                      backgroundColor: colorObj.hex
                    }}
                    onClick={() => onEditTask(task)}
                    className={`py-1 px-2.5 rounded-md text-white text-[11px] font-medium cursor-pointer shadow-sm hover:brightness-105 transition-all flex items-center justify-between overflow-hidden ${
                      task.isCompleted ? 'opacity-40 grayscale' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(task.id);
                        }}
                        className={`w-3 h-3 rounded flex items-center justify-center bg-white/20 border border-white/40 ${
                          task.isCompleted ? 'bg-white text-slate-900 font-bold' : ''
                        }`}
                      >
                        {task.isCompleted && '✓'}
                      </button>
                      <span className={`truncate ${task.isCompleted ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                    </div>

                    <span className="text-[9px] opacity-75 flex-shrink-0 pl-1">
                      {task.startDate.slice(5)}➔{task.dueDate.slice(5)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 单日待办点阵 */}
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1.5">
            {daysWindow.map(d => {
              const dayTasks = singleDayTasksByDate[d] || [];
              const isToday = d === today;

              return (
                <div 
                  key={d} 
                  className={`min-h-[80px] p-1.5 rounded-lg border flex flex-col justify-between ${
                    isToday 
                      ? 'border-[#fbe8c7] dark:border-[#e5a024]/20 bg-[#fef8ed]/20 dark:bg-[#e5a024]/5' 
                      : 'border-[#f1f3f5] dark:border-[#1a2233] bg-white dark:bg-[#10141e]'
                  }`}
                >
                  <div className="space-y-1">
                    {dayTasks.map(task => {
                      const colorObj = getColorById(task.color);
                      return (
                        <div
                          key={task.id}
                          onClick={() => onEditTask(task)}
                          className={`p-1 rounded text-[10px] border cursor-pointer truncate flex items-center space-x-1 ${
                            task.isCompleted
                              ? 'line-through text-slate-400 border-transparent'
                              : 'text-slate-700 dark:text-slate-300 border-[#f1f3f5] dark:border-[#1a2233]'
                          }`}
                        >
                          <span 
                            className="w-1 h-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: colorObj.hex }}
                          />
                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-1 border-t border-[#f1f3f5] dark:border-[#1a2233] text-[9px] text-slate-400 flex items-center justify-between">
                    <span>专注</span>
                    <span className="font-timer">
                      {focusSecondsByDate[d] > 0 ? formatTimeDisplay(focusSecondsByDate[d]) : '0m'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
