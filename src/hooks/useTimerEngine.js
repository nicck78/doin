import { useState, useEffect, useRef } from 'react';
import { getTodayString } from '../utils/dateUtils.js';
import { playChimeSound } from '../utils/timerEngine.js';

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

  // 防休眠时间戳差值算法引擎
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

    if (onSaveFocusSession) {
      onSaveFocusSession({
        id: `session-${Date.now()}`,
        date: today,
        durationSeconds,
        mode,
        taskId: selectedTaskId || null,
        taskTitle: matchedTask ? matchedTask.title : '自由专注',
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
  const selectedTaskTitle = selectedTaskObj ? selectedTaskObj.title : '自由专注';

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
