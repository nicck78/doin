import React from 'react';
import { formatTimeDisplay } from '../utils/dateUtils.js';
import { useTimerEngine } from '../hooks/useTimerEngine.js';
import { useLanguage } from '../locales/LanguageContext.jsx';

export default function QuickFocusWidget({
  tasks = [],
  initialTask = null,
  onSaveFocusSession,
  todaySessions = [],
  timer: externalTimer,
  onEnterMiniMode
}) {
  const { t } = useLanguage();
  const fallbackTimer = useTimerEngine({ tasks, initialTask, onSaveFocusSession });
  const timer = externalTimer || fallbackTimer;

  const {
    mode,
    setMode,
    countdownMinutes,
    setCountdownMinutes,
    status,
    displaySeconds,
    selectedTaskId,
    setSelectedTaskId,
    selectedTaskTitle,
    isPickerOpen,
    setIsPickerOpen,
    pickerRef,
    handleStart,
    handlePause,
    handleResume,
    resetState,
    handleCompleteSession
  } = timer;

  const totalTodaySeconds = todaySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

  return (
    <div className="paper-card rounded-2xl p-5 border border-[#f1f3f5] dark:border-[#1a2233] relative">
      {/* 头部微标识与悬浮胶囊入口 */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f5] dark:border-[#1a2233]">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-[#0f2847] dark:bg-blue-400'}`} />
          <h2 className="text-xs font-bold tracking-tight text-slate-800 dark:text-slate-200">
            {t('focus.title')}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* 模式切换胶囊 */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#f8f9fa] dark:bg-[#121724] border border-[#f1f3f5] dark:border-[#1a2233]">
            <button
              disabled={status !== 'idle'}
              onClick={() => setMode('stopwatch')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                mode === 'stopwatch'
                  ? 'bg-white dark:bg-[#1e2638] text-[#0f2847] dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:text-slate-500'
              }`}
            >
              {t('focus.stopwatch')}
            </button>
            <button
              disabled={status !== 'idle'}
              onClick={() => setMode('pomodoro')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                mode === 'pomodoro'
                  ? 'bg-white dark:bg-[#1e2638] text-[#0f2847] dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:text-slate-500'
              }`}
            >
              {t('focus.pomodoro')}
            </button>
          </div>

          {/* 缩小为桌面迷你置顶悬浮药丸按钮 */}
          {onEnterMiniMode && (
            <button
              type="button"
              onClick={onEnterMiniMode}
              title={t('focus.miniCapsule')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0f2847] dark:hover:text-blue-400 hover:bg-[#f8f9fa] dark:hover:bg-[#161c2b] transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
                <rect x="11" y="11" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.4" strokeWidth="1.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 番茄钟分钟选择 */}
      {mode === 'pomodoro' && status === 'idle' && (
        <div className="flex items-center justify-center space-x-1.5 pt-3">
          {[15, 25, 30, 45].map(mins => (
            <button
              key={mins}
              onClick={() => setCountdownMinutes(mins)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                countdownMinutes === mins
                  ? 'bg-[#0f2847] text-white dark:bg-blue-600'
                  : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 bg-[#f8f9fa] dark:bg-[#121724]'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      )}

      {/* 巨型时间显示 */}
      <div className="py-4 text-center">
        <span className="font-timer text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 select-none">
          {formatTimeDisplay(displaySeconds)}
        </span>
      </div>

      {/* 关联任务选择 */}
      <div className="relative mb-4" ref={pickerRef}>
        <button
          type="button"
          disabled={status !== 'idle'}
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] bg-[#fcfcfd] dark:bg-[#0c101a] text-xs text-slate-700 dark:text-slate-300 hover:border-[#e2e8f0] dark:hover:border-[#28354d] transition-all disabled:opacity-60 cursor-pointer"
        >
          <span className="truncate pr-2 font-medium">
            🎯 {selectedTaskTitle || t('focus.freeFocus')}
          </span>
          <svg className={`w-3 h-3 text-slate-400 transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isPickerOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-[#10141e] border border-[#f1f3f5] dark:border-[#1a2233] rounded-xl shadow-lg p-1 max-h-48 overflow-y-auto animate-soft">
            <div
              onClick={() => {
                setSelectedTaskId('');
                setIsPickerOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                selectedTaskId === ''
                  ? 'bg-[#f8f9fa] dark:bg-[#1e2638] font-bold text-[#0f2847] dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-[#f8f9fa] dark:hover:bg-[#161c2b]'
              }`}
            >
              {t('focus.freeFocus')}
            </div>
            {tasks.filter(t => !t.isCompleted).map(tItem => (
              <div
                key={tItem.id}
                onClick={() => {
                  setSelectedTaskId(tItem.id);
                  setIsPickerOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer truncate transition-colors ${
                  selectedTaskId === tItem.id
                    ? 'bg-[#f8f9fa] dark:bg-[#1e2638] font-bold text-[#0f2847] dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-[#f8f9fa] dark:hover:bg-[#161c2b]'
                }`}
              >
                {tItem.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 控制动作栏 */}
      <div className="flex items-center justify-center space-x-2">
        {status === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full py-2 rounded-xl bg-[#0f2847] hover:bg-[#183a63] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs tracking-wider shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            {t('focus.start')}
          </button>
        )}

        {status === 'running' && (
          <>
            <button
              onClick={handlePause}
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              {t('focus.pause')}
            </button>
            <button
              onClick={() => handleCompleteSession()}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              {t('focus.complete')}
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              onClick={handleResume}
              className="flex-1 py-2 rounded-xl bg-[#0f2847] dark:bg-blue-600 text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              {t('focus.resume')}
            </button>
            <button
              onClick={() => handleCompleteSession()}
              className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              {t('common.save')}
            </button>
            <button
              onClick={resetState}
              className="px-2.5 py-2 text-slate-400 hover:text-rose-500 text-xs font-semibold cursor-pointer"
            >
              {t('focus.discard')}
            </button>
          </>
        )}
      </div>

      {/* 底部今日专注小结 */}
      {totalTodaySeconds > 0 && (
        <div className="mt-3.5 pt-2.5 border-t border-[#f1f3f5] dark:border-[#1a2233] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>{t('focus.sessionsCount', { count: todaySessions.length })}</span>
          <span className="font-timer font-semibold text-[#0f2847] dark:text-blue-400">
            {formatTimeDisplay(totalTodaySeconds)}
          </span>
        </div>
      )}
    </div>
  );
}
