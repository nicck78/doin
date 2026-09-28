import React, { useState, useRef } from 'react';
import { 
  getTodayString, 
  isTaskActiveOnDate, 
  isMultiDayTask, 
  getColorById,
  diffInDays,
  formatTimeDisplay
} from '../utils/dateUtils.js';
import QuickFocusWidget from './QuickFocusWidget.jsx';
import QuickJournalWidget from './QuickJournalWidget.jsx';

export default function TodayTasks({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  onQuickAddTask,
  onStartFocusOnTask,
  todayFocusSessions = [],
  activeFocusTask = null,
  onSaveFocusSession,
  todayReview = null,
  onSaveReview,
  onOpenReviewModal,
  timer = null,
  onEnterMiniMode = null
}) {
  const today = getTodayString();
  const [quickInput, setQuickInput] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [showFinished, setShowFinished] = useState(false);
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
    <div className="max-w-6xl mx-auto px-6 py-6 animate-soft">
      {/* 现代双栏工作台网格：左 7 列聚焦待办，右 5 列常驻效率伴侣 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* ===================== 左主栏：今日待办流 (约 60%) ===================== */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 标头与微进度条 */}
          <div className="space-y-2 pb-2 border-b border-[#f1f3f5] dark:border-[#1a2233]">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  今日待办
                </h1>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {today}
                </span>
              </div>

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

          {/* 极简快速录入输入框 */}
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
                placeholder="快速记录想做的事... (按回车添加)"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                className="w-full py-2.5 pr-4 bg-transparent text-slate-900 dark:text-slate-100 text-xs sm:text-sm outline-none placeholder:text-slate-400 cursor-text"
              />
            </div>
          </form>

          {/* 待办分类列表 */}
          <div className="space-y-4">
            
            {/* 1. 长期跨天任务 */}
            {activeMultiDayTasks.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  长期推进
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

            {/* 2. 今日待办 */}
            <div className="space-y-1.5">
              {activeSingleDayTasks.length > 0 && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  单日任务
                </div>
              )}

              {activeSingleDayTasks.length === 0 && activeMultiDayTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-300 dark:text-slate-600 paper-card rounded-2xl border border-dashed border-[#f1f3f5] dark:border-[#1a2233]">
                  今日任务已全部搞定，享受此刻沉静
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

            {/* 3. 已完成任务（支持折叠收起，避免刷屏嘈杂） */}
            {finishedTasks.length > 0 && (
              <div className="pt-3 border-t border-[#f1f3f5] dark:border-[#1a2233] space-y-2">
                <button
                  type="button"
                  onClick={() => setShowFinished(!showFinished)}
                  className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  <svg className={`w-3 h-3 transition-transform ${showFinished ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>已完成 ({finishedTasks.length})</span>
                </button>

                {showFinished && (
                  <div className="space-y-1.5 opacity-65 pt-1 animate-soft">
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
                )}
              </div>
            )}

          </div>

        </div>

        {/* ===================== 右副栏：常驻效率伴侣 (约 40%) ===================== */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
          
          {/* 上半部：极简专注时钟 */}
          <QuickFocusWidget
            tasks={tasks}
            initialTask={activeFocusTask}
            onSaveFocusSession={onSaveFocusSession}
            todaySessions={todayFocusSessions}
            timer={timer}
            onEnterMiniMode={onEnterMiniMode}
          />

          {/* 下半部：免弹窗随手今日日记本 */}
          <QuickJournalWidget
            todayReview={todayReview}
            dayTasks={todayTasks}
            dayFocusSessions={todayFocusSessions}
            onSaveReview={onSaveReview}
            onOpenExpandModal={() => onOpenReviewModal(today)}
          />

        </div>

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
    <div className={`group relative flex items-center justify-between px-3.5 py-2.5 paper-card rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] transition-all ${
      task.isCompleted ? 'opacity-65 line-through' : ''
    }`}>
      
      {/* 左侧专属色彩微光标线 */}
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

      {/* 右侧悬浮动作按钮 */}
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
                title="专注此任务"
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
