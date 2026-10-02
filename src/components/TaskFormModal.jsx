import React, { useState, useEffect } from 'react';
import { getTodayString, diffInDays, TASK_COLOR_PALETTE } from '../utils/dateUtils.js';
import { useLanguage } from '../locales/LanguageContext.jsx';

export default function TaskFormModal({ isOpen, onClose, onSave, taskToEdit }) {
  const { t } = useLanguage();
  const today = getTodayString();
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [startDate, setStartDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [color, setColor] = useState('indigo');
  const [isUnscheduled, setIsUnscheduled] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 25);
      const hasDates = Boolean(taskToEdit.startDate || taskToEdit.dueDate);
      setIsUnscheduled(!hasDates);
      setStartDate(taskToEdit.startDate || today);
      setDueDate(taskToEdit.dueDate || today);
      setColor(taskToEdit.color || 'indigo');
    } else {
      setTitle('');
      setEstimatedMinutes(25);
      setIsUnscheduled(false);
      setStartDate(today);
      setDueDate(today);
      setColor('indigo');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let validStart = isUnscheduled ? null : startDate;
    let validDue = isUnscheduled ? null : dueDate;
    if (!isUnscheduled && startDate > dueDate) {
      validStart = dueDate;
      validDue = startDate;
    }

    onSave({
      id: (taskToEdit && taskToEdit.id) ? taskToEdit.id : `task-${Date.now()}`,
      title: title.trim(),
      estimatedMinutes: Number(estimatedMinutes) || 25,
      startDate: validStart,
      dueDate: validDue,
      color,
      isCompleted: taskToEdit ? taskToEdit.isCompleted : false,
      completedAt: taskToEdit ? taskToEdit.completedAt : null,
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-soft">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#10141e] rounded-2xl shadow-xl border border-[#f1f3f5] dark:border-[#1a2233] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f5] dark:border-[#1a2233]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {taskToEdit ? t('modal.editTask') : t('modal.newTask')}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <input
              type="text"
              required
              autoFocus
              placeholder={t('modal.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] bg-transparent text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-[#0f2847] dark:focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t('today.estimatedMin')}</label>
              <input
                type="number"
                min="5"
                max="720"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#f1f3f5] dark:border-[#1a2233] bg-transparent text-slate-900 dark:text-slate-100 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t('modal.color')}</label>
              <div className="flex items-center space-x-1.5 pt-1">
                {TASK_COLOR_PALETTE.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-5 h-5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                      color === c.id ? 'ring-2 ring-offset-1 ring-[#0f2847] scale-110' : 'opacity-65 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {color === c.id && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t('modal.scheduleHeader')}</span>
              <button
                type="button"
                onClick={() => {
                  const next = !isUnscheduled;
                  setIsUnscheduled(next);
                  if (!next && (!startDate || !dueDate)) {
                    setStartDate(today);
                    setDueDate(today);
                  }
                }}
                className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isUnscheduled
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 font-medium shadow-2xs'
                    : 'border-[#f1f3f5] dark:border-[#1a2233] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <span>{isUnscheduled ? `✓ ${t('modal.unscheduledToggle')}` : t('modal.unscheduledToggle')}</span>
              </button>
            </div>

            <div className={`grid grid-cols-2 gap-3 transition-opacity duration-150 ${isUnscheduled ? 'opacity-30 pointer-events-none' : ''}`}>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t('modal.startDate')}</label>
                <input
                  type="date"
                  disabled={isUnscheduled}
                  value={startDate || today}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#f1f3f5] dark:border-[#1a2233] bg-transparent text-slate-900 dark:text-slate-100 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t('modal.dueDate')}</label>
                <input
                  type="date"
                  disabled={isUnscheduled}
                  value={dueDate || today}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#f1f3f5] dark:border-[#1a2233] bg-transparent text-slate-900 dark:text-slate-100 text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#f1f3f5] dark:border-[#1a2233]">
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
              {taskToEdit ? t('common.save') : t('common.confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
