import React, { useState, useEffect, useRef } from 'react';
import { getTodayString, formatTimeDisplay } from '../utils/dateUtils.js';
import { playChimeSound } from '../utils/timerEngine.js';

export default function FocusTimer({
  tasks = [],
  initialTask = null,
  onSaveFocusSession,
  todaySessions = []
}) {
  const today = getTodayString();

  const [mode, setMode] = useState('stopwatch');
  const [countdownMinutes, setCountdownMinutes] = useState(25);
  const [status, setStatus] = useState('idle');

  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimestampRef = useRef(null);
  const accumulatedMsRef = useRef(0);
  const intervalIdRef = useRef(null);

  const [selectedTaskId, setSelectedTaskId] = useState(initialTask ? initialTask.id : '');

  useEffect(() => {
    if (initialTask) setSelectedTaskId(initialTask.id);
  }, [initialTask]);

  useEffect(() => {
    if (status === 'running') {
      intervalIdRef.current = setInterval(() => {
        const now = Date.now();
        const currentSegment = now - startTimestampRef.current;
        const total = accumulatedMsRef.current + currentSegment;
        setElapsedMs(total);

        if (mode === 'pomodoro') {
          const targetTotalMs = countdownMinutes * 60 * 1000;
          if (total >= targetTotalMs) {
            handleCompleteSession(targetTotalMs);
          }
        }
      }, 200);
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [status, mode, countdownMinutes]);

  const handleStart = () => {
    startTimestampRef.current = Date.now();
    setStatus('running');
  };

  const handlePause = () => {
    if (startTimestampRef.current) {
      accumulatedMsRef.current += Date.now() - startTimestampRef.current;
      startTimestampRef.current = null;
    }
    setStatus('paused');
  };

  const handleResume = () => {
    startTimestampRef.current = Date.now();
    setStatus('running');
  };

  const resetState = () => {
    setStatus('idle');
    setElapsedMs(0);
    accumulatedMsRef.current = 0;
    startTimestampRef.current = null;
    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
  };

  const handleCompleteSession = (finalMs = null) => {
    const totalMsToSave = finalMs !== null ? finalMs : elapsedMs;
    const durationSeconds = Math.max(1, Math.round(totalMsToSave / 1000));
    playChimeSound();

    const matchedTask = tasks.find(t => t.id === selectedTaskId);

    onSaveFocusSession({
      id: `session-${Date.now()}`,
      date: today,
      durationSeconds,
      mode,
      taskId: selectedTaskId || null,
      taskTitle: matchedTask ? matchedTask.title : '自由专注',
      completedAt: new Date().toISOString()
    });

    resetState();
  };

  let displaySeconds = 0;
  if (mode === 'stopwatch') {
    displaySeconds = Math.floor(elapsedMs / 1000);
  } else {
    const targetSeconds = countdownMinutes * 60;
    const currentSeconds = Math.floor(elapsedMs / 1000);
    displaySeconds = Math.max(0, targetSeconds - currentSeconds);
  }

  const totalTodaySeconds = todaySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6 animate-soft">
      
      {/* 纯粹极简计时容器 */}
      <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#10141e] border border-[#f1f3f5] dark:border-[#1a2233] shadow-sm text-center">
        
        {/* 模式选择 */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-[#f8f9fa] dark:bg-[#0a0d14] border border-[#f1f3f5] dark:border-[#1a2233] mb-6">
          <button
            disabled={status !== 'idle'}
            onClick={() => setMode('stopwatch')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              mode === 'stopwatch'
                ? 'bg-white dark:bg-[#1e2638] text-[#0f2847] dark:text-blue-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500'
            }`}
          >
            秒表
          </button>
          <button
            disabled={status !== 'idle'}
            onClick={() => setMode('pomodoro')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              mode === 'pomodoro'
                ? 'bg-white dark:bg-[#1e2638] text-[#0f2847] dark:text-blue-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500'
            }`}
          >
            番茄
          </button>
        </div>

        {/* 倒计时分钟选项 */}
        {mode === 'pomodoro' && status === 'idle' && (
          <div className="flex items-center justify-center space-x-1.5 mb-5">
            {[15, 25, 30, 45, 60].map(mins => (
              <button
                key={mins}
                onClick={() => setCountdownMinutes(mins)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all ${
                  countdownMinutes === mins
                    ? 'bg-[#0f2847] text-white dark:bg-blue-600'
                    : 'text-slate-400 hover:text-slate-700 dark:text-slate-500'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}

        {/* 关联任务 */}
        <div className="max-w-xs mx-auto mb-4">
          <select
            disabled={status !== 'idle'}
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-2.5 py-1 text-xs font-medium rounded-lg border border-[#f1f3f5] dark:border-[#1a2233] bg-transparent text-slate-600 dark:text-slate-300 outline-none"
          >
            <option value="">自由专注</option>
            {tasks.filter(t => !t.isCompleted).map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* 等宽巨型数字（彻底移除下方说教解释语） */}
        <div className="py-2">
          <span className="font-timer text-6xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-100 select-none">
            {formatTimeDisplay(displaySeconds)}
          </span>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center space-x-2.5 pt-6">
          {status === 'idle' && (
            <button
              onClick={handleStart}
              className="px-7 py-2 rounded-xl bg-[#0f2847] hover:bg-[#183a63] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-sm transition-all active:scale-95"
            >
              开始
            </button>
          )}

          {status === 'running' && (
            <>
              <button
                onClick={handlePause}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all active:scale-95"
              >
                暂停
              </button>
              <button
                onClick={() => handleCompleteSession()}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all active:scale-95"
              >
                完成
              </button>
            </>
          )}

          {status === 'paused' && (
            <>
              <button
                onClick={handleResume}
                className="px-6 py-2 rounded-xl bg-[#0f2847] dark:bg-blue-600 text-white font-bold text-xs transition-all active:scale-95"
              >
                继续
              </button>
              <button
                onClick={() => handleCompleteSession()}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs transition-all active:scale-95"
              >
                保存
              </button>
              <button
                onClick={resetState}
                className="px-3 py-2 text-slate-400 hover:text-rose-500 text-xs font-semibold"
              >
                放弃
              </button>
            </>
          )}
        </div>

      </div>

      {/* 今日专注记录 */}
      {todaySessions.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#10141e] border border-[#f1f3f5] dark:border-[#1a2233]">
          <div className="flex items-center justify-between pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            <span>今日专注</span>
            <span className="font-timer text-[#0f2847] dark:text-blue-400">
              {formatTimeDisplay(totalTodaySeconds)}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {todaySessions.map((s, i) => (
              <div 
                key={s.id || i}
                className="flex items-center justify-between py-1 text-xs"
              >
                <span className="text-slate-700 dark:text-slate-300">
                  {s.taskTitle || '自由专注'}
                </span>
                <span className="font-timer font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatTimeDisplay(s.durationSeconds)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
