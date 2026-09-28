import React from 'react';

export default function Navbar({
  currentView,
  setCurrentView,
  theme,
  toggleTheme,
  onExportBackup,
  onImportBackup,
  onOpenNewTask,
  onOpenReviewModal
}) {
  const navItems = [
    { id: 'today', label: '今日' },
    { id: 'calendar', label: '全景' },
    { id: 'timer', label: '专注' }
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
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
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
            title="日志"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#fef8ed] dark:bg-[#e5a024]/10 text-[#b47812] dark:text-[#f59e0b] hover:bg-[#fdf2dc] dark:hover:bg-[#e5a024]/20 transition-all border border-[#fbe8c7] dark:border-[#e5a024]/20"
          >
            日志
          </button>

          {/* ＋ 待办 */}
          <button
            onClick={onOpenNewTask}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0f2847] hover:bg-[#173a63] dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all shadow-sm active:scale-95"
          >
            ＋ 待办
          </button>

          {/* 备份与恢复 */}
          <div className="flex items-center rounded-lg border border-[#f1f3f5] dark:border-[#1a2233] p-0.5 bg-white dark:bg-[#10141e]">
            <button
              onClick={onExportBackup}
              title="导出备份"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={onImportBackup}
              title="导入恢复"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
          </div>

          {/* 纯黑 / 纯白切换 */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? '纯白模式' : '暗夜模式'}
            className="p-1.5 rounded-lg border border-[#f1f3f5] dark:border-[#1a2233] text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-[#f8f9fa] dark:hover:bg-[#161c2b] transition-colors"
          >
            {theme === 'dark' ? (
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
