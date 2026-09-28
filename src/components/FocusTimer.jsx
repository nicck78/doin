import React, { useState } from 'react';
import { formatTimeDisplay } from '../utils/dateUtils.js';
import { useTimerEngine } from '../hooks/useTimerEngine.js';

export default function FocusTimer({
  tasks = [],
  initialTask = null,
  onSaveFocusSession,
  todaySessions = [],
  timer: externalTimer,
  onEnterMiniMode
}) {
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

  const [isZenMode, setIsZenMode] = useState(false);

  const totalTodaySeconds = todaySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const dailyGoalMinutes = 120; // 默认每日专注目标 2 小时
  const currentTotalMinutes = Math.round(totalTodaySeconds / 60);
  const goalPercent = Math.min(100, Math.round((currentTotalMinutes / dailyGoalMinutes) * 100));

  // 纯净禅模式全屏展示
  if (isZenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-[#070a11] flex flex-col items-center justify-center p-8 animate-soft">
        <div className="absolute top-6 right-6 flex items-center space-x-2">
          {onEnterMiniMode && (
            <button
              onClick={() => {
                setIsZenMode(false);
                onEnterMiniMode();
              }}
              title="转为桌面置顶悬浮药丸"
              className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 border border-[#f1f3f5] dark:border-[#1a2233] rounded-xl hover:bg-[#f8f9fa] dark:hover:bg-[#121724] transition-all cursor-pointer flex items-center space-x-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
                <rect x="11" y="11" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.4" strokeWidth="1.5" />
              </svg>
              <span>悬浮药丸</span>
            </button>
          )}

          <button
            onClick={() => setIsZenMode(false)}
            className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-[#f1f3f5] dark:border-[#1a2233] rounded-xl hover:bg-[#f8f9fa] dark:hover:bg-[#121724] transition-all cursor-pointer"
          >
            ✕ 退出禅模式
          </button>
        </div>

        <div className="text-center space-y-8 max-w-xl">
          <div className="text-xs font-bold tracking-widest uppercase text-slate-400 dark:text-slate-600">
            {selectedTaskTitle} · {mode === 'stopwatch' ? '秒表专注' : '番茄倒计时'}
          </div>

          <div className="py-4">
            <span className="font-timer text-8xl sm:text-9xl font-bold tracking-tight text-slate-900 dark:text-slate-100 select-none">
              {formatTimeDisplay(displaySeconds)}
            </span>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-4">
            {status === 'idle' && (
              <button
                onClick={handleStart}
                className="px-10 py-3 rounded-2xl bg-[#0f2847] hover:bg-[#183a63] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
              >
                开始专注
              </button>
            )}

            {status === 'running' && (
              <>
                <button
                  onClick={handlePause}
                  className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer"
                >
                  暂停
                </button>
                <button
                  onClick={() => handleCompleteSession()}
                  className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer"
                >
                  完成
                </button>
              </>
            )}

            {status === 'paused' && (
              <>
                <button
                  onClick={handleResume}
                  className="px-8 py-3 rounded-2xl bg-[#0f2847] dark:bg-blue-600 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer"
                >
                  继续
                </button>
                <button
                  onClick={() => handleCompleteSession()}
                  className="px-8 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer"
                >
                  保存
                </button>
                <button
                  onClick={resetState}
                  className="px-4 py-3 text-slate-400 hover:text-rose-500 text-sm font-semibold cursor-pointer"
                >
                  放弃
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6 animate-soft">
      
      {/* 顶部标头与禅模式 / 悬浮胶囊开关 */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f5] dark:border-[#1a2233]">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            专注工作台
          </h1>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            屏蔽杂念 · 进入深度心流状态
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* 悬浮药丸按钮 */}
          {onEnterMiniMode && (
            <button
              onClick={onEnterMiniMode}
              title="缩小为桌面置顶悬浮药丸 (画中画)"
              className="flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#121724] border border-[#f1f3f5] dark:border-[#1a2233] hover:border-[#0f2847] dark:hover:border-blue-500 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
                <rect x="11" y="11" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.4" strokeWidth="1.5" />
              </svg>
              <span>悬浮药丸</span>
            </button>
          )}

          {/* 全屏禅模式按钮 */}
          <button
            onClick={() => setIsZenMode(true)}
            title="开启纯净全屏禅模式"
            className="flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold text-[#0f2847] dark:text-blue-400 bg-white dark:bg-[#121724] border border-[#f1f3f5] dark:border-[#1a2233] hover:border-[#0f2847] dark:hover:border-blue-500 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>全屏禅模式</span>
          </button>
        </div>
      </div>

      {/* 核心双栏架构：左侧 7 栏沉浸时钟，右侧 5 栏成就统计与时间轴 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* ===================== 左主栏：心流专注大核 (7列) ===================== */}
        <div className="lg:col-span-7 paper-card rounded-2xl p-8 sm:p-10 border border-[#f1f3f5] dark:border-[#1a2233] text-center space-y-6">
          
          {/* 模式选择 */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-[#f8f9fa] dark:bg-[#0a0d14] border border-[#f1f3f5] dark:border-[#1a2233]">
            <button
              disabled={status !== 'idle'}
              onClick={() => setMode('stopwatch')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'stopwatch'
                  ? 'bg-white dark:bg-[#1e2638] text-[#0f2847] dark:text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:text-slate-500'
              }`}
            >
              秒表专注
            </button>
            <button
              disabled={status !== 'idle'}
              onClick={() => setMode('pomodoro')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'pomodoro'
                  ? 'bg-white dark:bg-[#1e2638] text-[#0f2847] dark:text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:text-slate-500'
              }`}
            >
              番茄倒计时
            </button>
          </div>

          {/* 倒计时分钟预设 */}
          {mode === 'pomodoro' && status === 'idle' && (
            <div className="flex items-center justify-center space-x-2 animate-soft">
              {[15, 25, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => setCountdownMinutes(mins)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    countdownMinutes === mins
                      ? 'bg-[#0f2847] text-white dark:bg-blue-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 bg-[#f8f9fa] dark:bg-[#121724]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          )}

          {/* 关联任务定制下拉 */}
          <div className="max-w-xs mx-auto relative" ref={pickerRef}>
            <button
              type="button"
              disabled={status !== 'idle'}
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] bg-[#fcfcfd] dark:bg-[#0c101a] text-xs text-slate-700 dark:text-slate-300 hover:border-[#e2e8f0] dark:hover:border-[#28354d] transition-all disabled:opacity-60 cursor-pointer"
            >
              <span className="truncate pr-2 font-medium">
                🎯 {selectedTaskTitle}
              </span>
              <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isPickerOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-[#10141e] border border-[#f1f3f5] dark:border-[#1a2233] rounded-xl shadow-xl p-1 max-h-56 overflow-y-auto animate-soft text-left">
                <div
                  onClick={() => {
                    setSelectedTaskId('');
                    setIsPickerOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    selectedTaskId === ''
                      ? 'bg-[#f8f9fa] dark:bg-[#1e2638] font-bold text-[#0f2847] dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-[#f8f9fa] dark:hover:bg-[#161c2b]'
                  }`}
                >
                  自由专注
                </div>
                {tasks.filter(t => !t.isCompleted).map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTaskId(t.id);
                      setIsPickerOpen(false);
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs cursor-pointer truncate transition-colors ${
                      selectedTaskId === t.id
                        ? 'bg-[#f8f9fa] dark:bg-[#1e2638] font-bold text-[#0f2847] dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-[#f8f9fa] dark:hover:bg-[#161c2b]'
                    }`}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 巨幅等宽数字时钟 */}
          <div className="py-6">
            <span className="font-timer text-7xl sm:text-8xl font-bold tracking-tight text-slate-900 dark:text-slate-100 select-none">
              {formatTimeDisplay(displaySeconds)}
            </span>
          </div>

          {/* 控制按钮组 */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            {status === 'idle' && (
              <button
                onClick={handleStart}
                className="px-10 py-2.5 rounded-xl bg-[#0f2847] hover:bg-[#183a63] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                开始专注
              </button>
            )}

            {status === 'running' && (
              <>
                <button
                  onClick={handlePause}
                  className="px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  暂停
                </button>
                <button
                  onClick={() => handleCompleteSession()}
                  className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  完成
                </button>
              </>
            )}

            {status === 'paused' && (
              <>
                <button
                  onClick={handleResume}
                  className="px-7 py-2.5 rounded-xl bg-[#0f2847] dark:bg-blue-600 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  继续
                </button>
                <button
                  onClick={() => handleCompleteSession()}
                  className="px-7 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  保存
                </button>
                <button
                  onClick={resetState}
                  className="px-4 py-2.5 text-slate-400 hover:text-rose-500 text-xs font-semibold cursor-pointer"
                >
                  放弃
                </button>
              </>
            )}
          </div>

        </div>

        {/* ===================== 右副栏：今日专注成就与轨迹 (5列) ===================== */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* 卡片 1：今日目标与成就看板 */}
          <div className="paper-card rounded-2xl p-5 border border-[#f1f3f5] dark:border-[#1a2233] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#f1f3f5] dark:border-[#1a2233]">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                今日专注成就
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                目标 2小时
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="font-timer text-3xl font-extrabold text-[#0f2847] dark:text-blue-400">
                  {formatTimeDisplay(totalTodaySeconds)}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  累计专注 · 共完成 {todaySessions.length} 次
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {goalPercent}%
                </span>
              </div>
            </div>

            {/* 目标达成进度条 */}
            <div className="w-full bg-[#f1f3f5] dark:bg-[#161c2b] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          {/* 卡片 2：今日心流时间线 Feed */}
          <div className="paper-card rounded-2xl p-5 border border-[#f1f3f5] dark:border-[#1a2233] space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 pb-2 border-b border-[#f1f3f5] dark:border-[#1a2233]">
              心流轨迹
            </div>

            {todaySessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-600">
                今天还没有专注记录，点击左侧开始进入心流吧！
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {todaySessions.map((session, idx) => {
                  const completedTime = session.completedAt ? session.completedAt.slice(11, 16) : '--:--';
                  return (
                    <div 
                      key={session.id || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#fcfcfd] dark:bg-[#0d121c] border border-[#f1f3f5] dark:border-[#1a2233] text-xs"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="font-mono text-[10px] text-slate-400">
                          {completedTime}
                        </span>
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {session.taskTitle || '自由专注'}
                        </span>
                      </div>

                      <span className="font-timer font-bold text-emerald-600 dark:text-emerald-400 pl-2 flex-shrink-0">
                        +{formatTimeDisplay(session.durationSeconds)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
