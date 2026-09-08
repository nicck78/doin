import React, { useState, useEffect } from 'react';
import { getTodayString, diffInDays, TASK_COLOR_PALETTE } from '../utils/dateUtils.js';

export default function TaskFormModal({ isOpen, onClose, onSave, taskToEdit }) {
  const today = getTodayString();
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [startDate, setStartDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [color, setColor] = useState('indigo');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 25);
      setStartDate(taskToEdit.startDate || today);
      setDueDate(taskToEdit.dueDate || today);
      setColor(taskToEdit.color || 'indigo');
    } else {
      setTitle('');
      setEstimatedMinutes(25);
      setStartDate(today);
      setDueDate(today);
      setColor('indigo');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let validStart = startDate;
    let validDue = dueDate;
    if (startDate > dueDate) {
      validStart = dueDate;
      validDue = startDate;
    }

    onSave({
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
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
            {taskToEdit ? '编辑待办' : '新待办'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
              placeholder="待办名称..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] bg-transparent text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-[#0f2847] dark:focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">预计分钟</label>
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
              <label className="block text-[11px] text-slate-400 mb-1">颜色</label>
              <div className="flex items-center space-x-1.5 pt-1">
                {TASK_COLOR_PALETTE.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#f1f3f5] dark:border-[#1a2233] bg-transparent text-slate-900 dark:text-slate-100 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">截止日期</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#f1f3f5] dark:border-[#1a2233] bg-transparent text-slate-900 dark:text-slate-100 text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#f1f3f5] dark:border-[#1a2233]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0f2847] hover:bg-[#183a63] dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-all"
            >
              {taskToEdit ? '保存' : '确定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
