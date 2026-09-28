import React, { useState } from 'react';
import { 
  getTodayString, 
  generateSevenDaysWindow, 
  addDays, 
  getWeekdayName, 
  getColorById,
  isMultiDayTask,
  diffInDays,
  formatTimeDisplay
} from '../utils/dateUtils.js';

export default function CalendarGantt({
  tasks,
  dailyReviews = {},
  focusSessions = [],
  onOpenReviewModal,
  onEditTask,
  onToggleComplete,
  onAddNewTaskForDate
}) {
  const today = getTodayString();
  const [centerDate, setCenterDate] = useState(today);

  const daysWindow = generateSevenDaysWindow(centerDate);
  const minDate = daysWindow[0];
  const maxDate = daysWindow[daysWindow.length - 1];

  const handlePrev = () => setCenterDate(addDays(centerDate, -3));
  const handleNext = () => setCenterDate(addDays(centerDate, 3));
  const handleResetToday = () => setCenterDate(today);

  // Filter multi-day tasks that overlap with the 7-day window
  const visibleMultiDayTasks = tasks.filter(task => {
    if (!isMultiDayTask(task)) return false;
    const start = task.startDate;
    const end = task.dueDate;
    return start <= maxDate && end >= minDate;
  });

  // Group single day tasks by date
  const singleDayTasksByDate = {};
  daysWindow.forEach(d => {
    singleDayTasksByDate[d] = tasks.filter(task => {
      if (isMultiDayTask(task)) return false;
      return task.dueDate === d;
    });
  });

  // Calculate focus seconds per day
  const focusSecondsByDate = {};
  daysWindow.forEach(d => {
    const sessions = focusSessions.filter(s => s.date === d);
    focusSecondsByDate[d] = sessions.reduce((acc, cur) => acc + (cur.durationSeconds || 0), 0);
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5 animate-soft">
      
      {/* 顶部标题栏与时间轴导航 */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f5] dark:border-[#1a2233]">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            全景时间轴
          </h1>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            7 天连续全景 · 跨天推进与每日事实
          </span>
        </div>

        {/* 翻页切换控制器 */}
        <div className="flex items-center space-x-1 p-0.5 bg-[#f8f9fa] dark:bg-[#121724] rounded-xl border border-[#f1f3f5] dark:border-[#1a2233]">
          <button
            onClick={handlePrev}
            title="前移 3 天"
            className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
          >
            ◀ 3天
          </button>
          <button
            onClick={handleResetToday}
            className="px-3 py-1 text-xs font-bold bg-white dark:bg-[#1e2638] text-[#0f2847] dark:text-blue-400 rounded-lg shadow-sm transition-all"
          >
            回到今天
          </button>
          <button
            onClick={handleNext}
            title="后移 3 天"
            className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
          >
            3天 ▶
          </button>
        </div>
      </div>

      {/* 核心 7 天时间轴主网格 */}
      <div className="bg-white dark:bg-[#10141e] rounded-2xl border border-[#f1f3f5] dark:border-[#1a2233] shadow-sm overflow-hidden">
        
        {/* 1. 7 天列头（带今天高光标尺与悬浮快速加任务） */}
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
                className={`group relative p-3 text-center border-r last:border-r-0 border-[#f1f3f5] dark:border-[#1a2233] transition-colors ${
                  isToday 
                    ? 'bg-[#fef8ed]/50 dark:bg-[#e5a024]/10 ring-1 ring-inset ring-[#fbe8c7] dark:ring-[#e5a024]/30' 
                    : 'hover:bg-[#f8f9fa] dark:hover:bg-[#131825]'
                }`}
              >
                {/* 星期与今天高光标签 */}
                <div className="flex items-center justify-center space-x-1">
                  <span className={`text-xs font-bold ${isToday ? 'text-[#b47812] dark:text-[#f59e0b]' : 'text-slate-700 dark:text-slate-300'}`}>
                    {weekday}
                  </span>
                  {isToday && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#b47812] text-white dark:bg-[#f59e0b] dark:text-slate-900 rounded-full">
                      今
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {displayDate}
                </div>

                {/* 悬停快捷动作组（加待办 + 查日志） */}
                <div className="mt-2 flex items-center justify-center space-x-1">
                  {/* 快速在此日加待办 */}
                  <button
                    onClick={() => onAddNewTaskForDate && onAddNewTaskForDate(d)}
                    title={`在 ${d} 安排新待办`}
                    className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-[#1a2233] border border-[#e2e8f0] dark:border-[#2a3852] text-slate-600 dark:text-slate-300 hover:text-[#0f2847] hover:border-[#0f2847] transition-all shadow-xs"
                  >
                    ＋
                  </button>

                  {/* 当日日志入口 */}
                  <button
                    onClick={() => onOpenReviewModal(d)}
                    title={hasReview ? `查看 ${d} 日志` : `记录 ${d} 日志`}
                    className={`py-0.5 px-2 rounded-md text-[10px] font-medium transition-all ${
                      hasReview
                        ? 'bg-[#fef8ed] dark:bg-[#e5a024]/20 text-[#b47812] dark:text-[#f59e0b] border border-[#fbe8c7] dark:border-[#e5a024]/40 font-bold'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-transparent hover:border-[#f1f3f5]'
                    }`}
                  >
                    {hasReview ? '★ 日志' : '日志'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* 2. 跨天任务横向贯通条带（Gantt Strip） */}
        {visibleMultiDayTasks.length > 0 && (
          <div className="p-4 space-y-2 bg-[#fcfcfd]/60 dark:bg-[#0b0f19]/40 border-b border-[#f1f3f5] dark:border-[#1a2233]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              跨天长期任务全景
            </div>

            {visibleMultiDayTasks.map(task => {
              const colorObj = getColorById(task.color);
              const startIndex = daysWindow.findIndex(d => d >= task.startDate);
              const actualStart = startIndex === -1 ? 0 : startIndex;

              let endIndex = daysWindow.findIndex(d => d > task.dueDate);
              if (endIndex === -1) endIndex = 7;

              const colStart = actualStart + 1;
              const colSpan = Math.max(1, endIndex - actualStart);
              const remainingDays = diffInDays(today, task.dueDate);

              return (
                <div key={task.id} className="grid grid-cols-7 gap-1.5 items-center">
                  <div
                    style={{
                      gridColumn: `${colStart} / span ${colSpan}`,
                      backgroundColor: colorObj.hex
                    }}
                    onClick={() => onEditTask(task)}
                    className={`py-1.5 px-3 rounded-lg text-white text-xs font-medium cursor-pointer shadow-sm hover:brightness-105 hover:shadow-md transition-all flex items-center justify-between overflow-hidden ${
                      task.isCompleted ? 'opacity-40 grayscale' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(task.id);
                        }}
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center bg-white/20 border border-white/40 hover:bg-white/40 transition-colors ${
                          task.isCompleted ? 'bg-white text-slate-900 font-bold' : ''
                        }`}
                      >
                        {task.isCompleted && '✓'}
                      </button>
                      <span className={`truncate font-semibold ${task.isCompleted ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] opacity-90 flex-shrink-0 pl-2">
                      <span>{task.startDate.slice(5)}➔{task.dueDate.slice(5)}</span>
                      {remainingDays > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-black/20 text-white font-mono">
                          剩{remainingDays}天
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. 7 天单日任务卡片矩阵 */}
        <div className="p-3.5">
          <div className="grid grid-cols-7 gap-2">
            {daysWindow.map(d => {
              const dayTasks = singleDayTasksByDate[d] || [];
              const isToday = d === today;

              return (
                <div 
                  key={d} 
                  className={`group relative min-h-[140px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    isToday 
                      ? 'border-[#fbe8c7] dark:border-[#e5a024]/30 bg-[#fef8ed]/20 dark:bg-[#e5a024]/5 shadow-xs' 
                      : 'border-[#f1f3f5] dark:border-[#1a2233] bg-white dark:bg-[#10141e] hover:border-[#e2e8f0] dark:hover:border-[#28354d]'
                  }`}
                >
                  {/* 任务列表 */}
                  <div className="space-y-1.5 flex-1">
                    {dayTasks.map(task => {
                      const colorObj = getColorById(task.color);
                      return (
                        <div
                          key={task.id}
                          onClick={() => onEditTask(task)}
                          className={`p-1.5 rounded-lg border cursor-pointer text-xs flex items-center space-x-1.5 transition-all hover:scale-[1.02] ${
                            task.isCompleted
                              ? 'line-through text-slate-400 border-transparent bg-slate-50/50 dark:bg-[#141a29]/50'
                              : 'text-slate-800 dark:text-slate-200 border-[#f1f3f5] dark:border-[#1a2233] bg-[#fcfcfd] dark:bg-[#0d121c] shadow-2xs'
                          }`}
                        >
                          <span 
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: colorObj.hex }}
                          />
                          <span className="truncate flex-1 font-medium">{task.title}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(task.id);
                            }}
                            className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 text-[8px] ${
                              task.isCompleted ? 'bg-[#0f2847] dark:bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {task.isCompleted && '✓'}
                          </button>
                        </div>
                      );
                    })}

                    {/* 空态下的快速添加快捷指引 */}
                    {dayTasks.length === 0 && (
                      <div 
                        onClick={() => onAddNewTaskForDate && onAddNewTaskForDate(d)}
                        className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 py-4 cursor-pointer text-[11px] text-slate-400 hover:text-[#0f2847] dark:hover:text-blue-400 transition-all border border-dashed border-transparent hover:border-[#e2e8f0] dark:hover:border-[#28354d] rounded-lg"
                      >
                        ＋ 添待办
                      </div>
                    )}
                  </div>

                  {/* 底部专注时长 */}
                  <div className="pt-2 mt-2 border-t border-[#f1f3f5] dark:border-[#1a2233] text-[10px] text-slate-400 flex items-center justify-between">
                    <span>专注</span>
                    <span className="font-timer font-semibold text-slate-700 dark:text-slate-300">
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
