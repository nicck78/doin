import React, { useState, useRef } from 'react';
import { 
  getTodayString, 
  isTaskActiveOnDate, 
  isMultiDayTask, 
  getColorById,
  diffInDays,
  formatTimeDisplay
} from '../utils/dateUtils.js';

export default function TodayTasks({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  onQuickAddTask,
  onStartFocusOnTask,
  todayFocusSessions = []
}) {
  const today = getTodayString();
  const [quickInput, setQuickInput] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const inputRef = useRef(null);

  const todayTasks = tasks.filter(task => {
    const isActiveToday = isTaskActiveOnDate(task, today);
    const wasCompletedToday = task.isCompleted && task.completedAt && task.completedAt.startsWith(today);
    return isActiveToday || wasCompletedToday;
  });

  const completedCount = todayTasks.filter(t => t.isCompleted).length;
  const totalCount = todayTasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const totalFocusSeconds = todayFocusSessions.reduce((acc, cur) => acc + (cur.durationSeconds || 0), 0);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickAddTask(quickInput.trim());
    setQuickInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleConfirmDelete = (taskId) => {
    onDeleteTask(taskId);
    setDeletingTaskId(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const activeMultiDayTasks = todayTasks.filter(t => !t.isCompleted && isMultiDayTask(t));
  const activeSingleDayTasks = todayTasks.filter(t => !t.isCompleted && !isMultiDayTask(t));
  const finishedTasks = todayTasks.filter(t => t.isCompleted);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6 animate-soft">
      
      {/* 极简标题与微进度条 */}
      <div className="space-y-2.5 pb-2 border-b border-[#f1f3f5] dark:border-[#1a2233]">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            今日
          </h1>

          <div className="flex items-center space-x-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {completedCount}/{totalCount}
            </span>
            {totalFocusSeconds > 0 && (
              <>
                <span>·</span>
                <span className="font-timer font-semibold text-[#0f2847] dark:text-blue-400">
                  {formatTimeDisplay(totalFocusSeconds)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 极细微进度线 */}
        <div className="w-full bg-[#f1f3f5] dark:bg-[#161c2b] h-0.5 rounded-full overflow-hidden">
          <div 
            className="bg-[#0f2847] dark:bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 极简书写输入框 */}
      <form onSubmit={handleQuickSubmit} className="relative">
        <div 
          onClick={() => inputRef.current?.focus()}
          className="relative flex items-center bg-white dark:bg-[#10141e] rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] hover:border-[#e2e8f0] dark:hover:border-[#28354d] focus-within:border-[#0f2847] dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-[#0f2847]/10 transition-all shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]"
        >
          <div className="pl-3.5 pr-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="新待办..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            className="w-full py-2.5 pr-4 bg-transparent text-slate-900 dark:text-slate-100 text-xs sm:text-sm outline-none placeholder:text-slate-400 cursor-text"
          />
        </div>
      </form>

      {/* 待办列表主体 */}
      <div className="space-y-5">

        {/* 长期 */}
        {activeMultiDayTasks.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              长期
            </div>
            <div className="space-y-1.5">
              {activeMultiDayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  today={today}
                  isDeleting={deletingTaskId === task.id}
                  onStartDelete={() => setDeletingTaskId(task.id)}
                  onCancelDelete={() => setDeletingTaskId(null)}
                  onConfirmDelete={() => handleConfirmDelete(task.id)}
                  onToggleComplete={onToggleComplete}
                  onEditTask={onEditTask}
                  onStartFocusOnTask={onStartFocusOnTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* 待办 */}
        <div className="space-y-1.5">
          {activeSingleDayTasks.length > 0 && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              待办
            </div>
          )}

          {activeSingleDayTasks.length === 0 && activeMultiDayTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-300 dark:text-slate-600">
              暂无待办
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeSingleDayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  today={today}
                  isDeleting={deletingTaskId === task.id}
                  onStartDelete={() => setDeletingTaskId(task.id)}
                  onCancelDelete={() => setDeletingTaskId(null)}
                  onConfirmDelete={() => handleConfirmDelete(task.id)}
                  onToggleComplete={onToggleComplete}
                  onEditTask={onEditTask}
                  onStartFocusOnTask={onStartFocusOnTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* 完成 */}
        {finishedTasks.length > 0 && (
          <div className="space-y-1.5 pt-3 border-t border-[#f1f3f5] dark:border-[#1a2233]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              完成
            </div>
            <div className="space-y-1.5 opacity-60">
              {finishedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  today={today}
                  isDeleting={deletingTaskId === task.id}
                  onStartDelete={() => setDeletingTaskId(task.id)}
                  onCancelDelete={() => setDeletingTaskId(null)}
                  onConfirmDelete={() => handleConfirmDelete(task.id)}
                  onToggleComplete={onToggleComplete}
                  onEditTask={onEditTask}
                  onStartFocusOnTask={onStartFocusOnTask}
                />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

function TaskCard({ 
  task, 
  today, 
  isDeleting, 
  onStartDelete, 
  onCancelDelete, 
  onConfirmDelete, 
  onToggleComplete, 
  onEditTask, 
  onStartFocusOnTask 
}) {
  const colorObj = getColorById(task.color);
  const isMulti = isMultiDayTask(task);
  const remainingDays = isMulti ? diffInDays(today, task.dueDate) : 0;

  return (
    <div className={`group relative flex items-center justify-between px-3.5 py-2.5 paper-card rounded-xl ${
      task.isCompleted ? 'opacity-65 line-through' : ''
    }`}>
      
      {/* 左侧颜色标线 */}
      <div 
        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
        style={{ backgroundColor: colorObj.hex }}
      />

      {/* 勾选框与内容 */}
      <div className="flex items-center space-x-3 min-w-0 flex-1 pl-1">
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors flex-shrink-0 border ${
            task.isCompleted
              ? 'bg-[#0f2847] dark:bg-blue-600 border-[#0f2847] dark:border-blue-600 text-white'
              : 'border-slate-300 dark:border-slate-700 hover:border-[#0f2847]'
          }`}
        >
          {task.isCompleted && (
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <span className={`text-xs sm:text-sm font-medium block truncate ${
            task.isCompleted ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'
          }`}>
            {task.title}
          </span>

          <div className="flex items-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {isMulti && (
              <span className="font-semibold text-[#0f2847] dark:text-blue-400">
                {task.startDate.slice(5)}~{task.dueDate.slice(5)}
                {remainingDays > 0 ? ` (剩${remainingDays}天)` : (remainingDays === 0 ? ' (今日截止)' : '')}
              </span>
            )}
            {!isMulti && task.dueDate === today && (
              <span className="text-[#b47812] dark:text-amber-400 font-medium">今日截止</span>
            )}
            {task.estimatedMinutes && (
              <span>{task.estimatedMinutes}m</span>
            )}
          </div>
        </div>
      </div>

      {/* 右侧动作按钮 */}
      <div className="flex items-center space-x-1 pl-2">
        {isDeleting ? (
          <div className="flex items-center space-x-1 animate-soft">
            <button
              type="button"
              onClick={onConfirmDelete}
              className="px-2 py-0.5 text-xs font-bold bg-rose-600 text-white rounded"
            >
              删除
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              取消
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {!task.isCompleted && (
              <button
                type="button"
                onClick={() => onStartFocusOnTask(task)}
                title="专注"
                className="px-2 py-0.5 text-xs font-semibold text-[#0f2847] dark:text-blue-400 hover:bg-[#f8f9fa] dark:hover:bg-[#182235] rounded transition-colors"
              >
                专注
              </button>
            )}
            <button
              type="button"
              onClick={() => onEditTask(task)}
              title="编辑"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onStartDelete}
              title="删除"
              className="p-1 text-slate-400 hover:text-rose-500 rounded"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
