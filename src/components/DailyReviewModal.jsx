import React, { useState, useEffect } from 'react';
import { getFriendlyDateLabel, getTodayString, formatTimeDisplay } from '../utils/dateUtils.js';
import { useLanguage } from '../locales/LanguageContext.jsx';

export default function DailyReviewModal({
  isOpen,
  onClose,
  dateStr = getTodayString(),
  initialReview = null,
  dayTasks = [],
  dayFocusSessions = [],
  onSaveReview
}) {
  const { t, lang } = useLanguage();
  const [logContent, setLogContent] = useState('');

  useEffect(() => {
    if (initialReview) {
      if (initialReview.content) {
        setLogContent(initialReview.content);
      } else {
        const parts = [];
        if (initialReview.summary) parts.push(initialReview.summary);
        if (initialReview.reflection) parts.push(initialReview.reflection);
        setLogContent(parts.join('\n\n'));
      }
    } else {
      setLogContent('');
    }
  }, [initialReview, isOpen, dateStr]);

  if (!isOpen) return null;

  const completedTasks = dayTasks.filter(t => t.isCompleted);
  const totalFocusSeconds = dayFocusSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveReview(dateStr, {
      content: logContent.trim(),
      summary: logContent.trim(),
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const friendlyDate = getFriendlyDateLabel(dateStr, lang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-soft">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#10141e] rounded-2xl shadow-xl border border-[#f1f3f5] dark:border-[#1a2233] p-6 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题 */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f5] dark:border-[#1a2233]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t('modal.journalTitle')} · {friendlyDate}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 当日事实 */}
        <div className="my-3 px-3 py-1.5 rounded-lg bg-[#fcfcfd] dark:bg-[#0a0d14] border border-[#f1f3f5] dark:border-[#1a2233] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>{t('journal.doneRatio', { done: completedTasks.length, total: dayTasks.length })}</span>
          {totalFocusSeconds > 0 && (
            <span>{t('journal.focusTime', { time: formatTimeDisplay(totalFocusSeconds) })}</span>
          )}
        </div>

        {/* 单大输入框 */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-[220px]">
          <textarea
            autoFocus
            rows={8}
            placeholder={t('modal.journalPlaceholder')}
            value={logContent}
            onChange={(e) => setLogContent(e.target.value)}
            className="w-full flex-1 p-3.5 rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] bg-transparent text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed outline-none focus:border-[#0f2847] dark:focus:border-blue-500 resize-none"
          />

          {/* 底部按钮 */}
          <div className="flex items-center justify-end space-x-2 pt-3 mt-2 border-t border-[#f1f3f5] dark:border-[#1a2233]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0f2847] hover:bg-[#183a63] dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-all cursor-pointer"
            >
              {t('common.save')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
