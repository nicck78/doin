import React from 'react';
import { useLanguage } from '../locales/LanguageContext.jsx';

export default function Navbar({
  currentView,
  setCurrentView,
  onOpenSettings,
  onExportBackup,
  onImportBackup,
  onOpenNewTask,
  onOpenReviewModal
}) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'today', label: t('nav.today') },
    { id: 'calendar', label: t('nav.timeline') },
    { id: 'timer', label: t('nav.focus') }
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#f1f3f5] dark:border-[#1a2233] bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-md py-2.5 transition-colors">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        
        {/* 左侧：IP 标识与极简导航 */}
        <div className="flex items-center space-x-6">
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group" 
            onClick={() => setCurrentView('today')}
          >
            <img 
              src="./logo.png" 
              alt="doin logo" 
              className="w-7 h-7 rounded-lg object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-105 transition-transform" 
            />
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              doin
            </span>
          </div>

          {/* 极简发丝 Tabs */}
          <nav className="flex items-center space-x-0.5 p-0.5 rounded-lg bg-[#f8f9fa] dark:bg-[#121724] border border-[#f1f3f5] dark:border-[#1a2233]">
            {navItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-[#1e2638] text-[#0f2847] dark:text-blue-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 右侧：动作组 */}
        <div className="flex items-center space-x-2">
          {/* 日志 */}
          <button
            onClick={() => onOpenReviewModal(new Date().toISOString().slice(0, 10))}
            title={t('modal.journalTitle')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#fef8ed] dark:bg-[#e5a024]/10 text-[#b47812] dark:text-[#f59e0b] hover:bg-[#fdf2dc] dark:hover:bg-[#e5a024]/20 transition-all border border-[#fbe8c7] dark:border-[#e5a024]/20 cursor-pointer"
          >
            {t('modal.journalTitle')}
          </button>

          {/* ＋ 待办 */}
          <button
            onClick={onOpenNewTask}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0f2847] hover:bg-[#173a63] dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {t('nav.addTask')}
          </button>

          {/* 备份与恢复 */}
          <div className="flex items-center rounded-lg border border-[#f1f3f5] dark:border-[#1a2233] p-0.5 bg-white dark:bg-[#10141e]">
            <button
              onClick={onExportBackup}
              title={t('nav.export')}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={onImportBackup}
              title={t('nav.import')}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
          </div>

          {/* 设置中心按键（替换原有的单纯黑白按键） */}
          <button
            onClick={onOpenSettings}
            title={t('nav.settings')}
            className="p-1.5 rounded-lg border border-[#f1f3f5] dark:border-[#1a2233] text-slate-500 hover:text-[#0f2847] dark:text-slate-400 dark:hover:text-blue-400 hover:bg-[#f8f9fa] dark:hover:bg-[#161c2b] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}
