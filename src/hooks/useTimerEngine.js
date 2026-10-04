import { useState, useEffect, useRef } from 'react';
import { getTodayString } from '../utils/dateUtils.js';
import { calculateElapsedMs, playChimeSound } from '../utils/timerEngine.js';
import { App as CapacitorApp } from '@capacitor/app';
import { isAndroidApp } from '../platform/platform.js';

export function useTimerEngine({
  tasks = [],
  initialTask = null,
  onSaveFocusSession
}) {
  const today = getTodayString();

  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' | 'pomodoro'
  const [countdownMinutes, setCountdownMinutes] = useState(25);
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused'

  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimestampRef = useRef(null);
  const accumulatedMsRef = useRef(0);
  const intervalIdRef = useRef(null);
  const completionPendingRef = useRef(false);

  const [selectedTaskId, setSelectedTaskId] = useState(initialTask ? initialTask.id : '');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (initialTask) setSelectedTaskId(initialTask.id);
  }, [initialTask]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 前台计时按时间戳计算，减少定时器节流造成的误差。
  useEffect(() => {
    if (status === 'running') {
      intervalIdRef.current = setInterval(() => {
        const total = calculateElapsedMs(accumulatedMsRef.current, startTimestampRef.current);
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

  // 手机返回前台时立即按时间戳补算；锁屏期间定时器可能被系统节流。
  useEffect(() => {
    if (!isAndroidApp() || status !== 'running') return;
    let listener;
    let disposed = false;
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive && startTimestampRef.current !== null) {
        setElapsedMs(calculateElapsedMs(accumulatedMsRef.current, startTimestampRef.current));
      }
    }).then(handle => {
      if (disposed) handle.remove();
      else listener = handle;
    });
    return () => { disposed = true; listener?.remove(); };
  }, [status]);

  const handleStart = () => {
    completionPendingRef.current = false;
    startTimestampRef.current = Date.now();
    setStatus('running');
  };

  const handlePause = () => {
    if (startTimestampRef.current) {
      accumulatedMsRef.current = calculateElapsedMs(accumulatedMsRef.current, startTimestampRef.current);
      startTimestampRef.current = null;
    }
    setElapsedMs(accumulatedMsRef.current);
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
    if (completionPendingRef.current) return;
    completionPendingRef.current = true;
    const totalMsToSave = finalMs !== null ? finalMs : calculateElapsedMs(accumulatedMsRef.current, status === 'running' ? startTimestampRef.current : null);
    const durationSeconds = Math.max(1, Math.round(totalMsToSave / 1000));
    playChimeSound();

    const matchedTask = tasks.find(t => t.id === selectedTaskId);

    if (onSaveFocusSession) {
      onSaveFocusSession({
        id: `session-${Date.now()}`,
        date: getTodayString(),
        durationSeconds,
        mode,
        taskId: selectedTaskId || null,
        taskTitle: matchedTask ? matchedTask.title : '',
        completedAt: new Date().toISOString()
      });
    }

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

  const selectedTaskObj = tasks.find(t => t.id === selectedTaskId);
  const selectedTaskTitle = selectedTaskObj ? selectedTaskObj.title : '';

  return {
    mode,
    setMode,
    countdownMinutes,
    setCountdownMinutes,
    status,
    elapsedMs,
    displaySeconds,
    selectedTaskId,
    setSelectedTaskId,
    selectedTaskObj,
    selectedTaskTitle,
    isPickerOpen,
    setIsPickerOpen,
    pickerRef,
    handleStart,
    handlePause,
    handleResume,
    resetState,
    handleCompleteSession
  };
}
