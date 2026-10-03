import React, { useState, useEffect, useRef } from 'react';
import { getTodayString, formatTimeDisplay } from '../utils/dateUtils.js';
import { useLanguage } from '../locales/LanguageContext.jsx';

export default function QuickJournalWidget({
  todayReview = null,
  dayTasks = [],
  dayFocusSessions = [],
  onSaveReview,
  onOpenExpandModal
}) {
  const { t } = useLanguage();
  const today = getTodayString();
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (todayReview) {
      if (todayReview.content) {
        setContent(todayReview.content);
      } else {
        const parts = [];
        if (todayReview.summary) parts.push(todayReview.summary);
        if (todayReview.reflection) parts.push(todayReview.reflection);
        setContent(parts.join('\n\n'));
      }
    } else {
      setContent('');
    }
  }, [todayReview]);

  const triggerSave = (text) => {
    setSaveStatus('saving');
    onSaveReview(today, {
      content: text.trim(),
      summary: text.trim(),
      updatedAt: new Date().toISOString()
    });
    setTimeout(() => {
      setSaveStatus('saved');
    }, 300);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    setSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      triggerSave(val);
    }, 600);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    triggerSave(content);
  };

  const completedTasks = dayTasks.filter(t => t.isCompleted);
  const totalFocusSeconds = dayFocusSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

  return (
    <div className="paper-card rounded-2xl p-5 border border-[#f1f3f5] dark:border-[#1a2233] flex flex-col flex-1 min-h-[260px]">
      {/* 头部标题与保存指示灯 */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f5] dark:border-[#1a2233]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#e5a024]" />
          <h2 className="text-xs font-bold tracking-tight text-slate-800 dark:text-slate-200">
            {t('today.dailyNote')}
          </h2>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pl-1">
            {saveStatus === 'saving' ? t('journal.saving') : t('journal.saved')}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenExpandModal}
          title={t('journal.expand')}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[#f8f9fa] dark:hover:bg-[#161c2b] transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* 当天任务与专注摘要 */}
      <div className="my-2.5 px-3 py-1 rounded-lg bg-[#fcfcfd] dark:bg-[#0c101a] border border-[#f1f3f5] dark:border-[#1a2233] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>{t('journal.doneRatio', { done: completedTasks.length, total: dayTasks.length })}</span>
        <span className="font-timer">
          {t('journal.focusTime', { time: totalFocusSeconds > 0 ? formatTimeDisplay(totalFocusSeconds) : '0m' })}
        </span>
      </div>

      {/* 随手书写笔记本输入框 */}
      <div className="flex-1 flex flex-col pt-1">
        <textarea
          rows={6}
          placeholder={t('today.notePlaceholder')}
          value={content}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full flex-1 p-3 rounded-xl border border-transparent hover:border-[#f1f3f5] dark:hover:border-[#1a2233] focus:border-[#fbe8c7] dark:focus:border-[#e5a024]/30 bg-transparent text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors"
        />
      </div>
    </div>
  );
}
