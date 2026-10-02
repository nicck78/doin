import React from 'react';
import { formatTimeDisplay } from '../utils/dateUtils.js';
import { useLanguage } from '../locales/LanguageContext.jsx';

export default function MiniCapsule({
  timer,
  onExitMiniMode
}) {
  const { t } = useLanguage();
  const {
    displaySeconds,
    status,
    selectedTaskTitle,
    handleStart,
    handlePause,
    handleResume,
    handleCompleteSession
  } = timer;

  return (
    <div 
      onDoubleClick={onExitMiniMode}
      title={t('focus.restore')}
      style={{ WebkitAppRegion: 'drag' }}
      className="w-full h-screen p-2 select-none box-border flex flex-col justify-between bg-white dark:bg-[#0c101a] text-slate-900 dark:text-slate-100 overflow-hidden"
    >
      {/* 顶部微条：任务标识与还原按钮 */}
      <div className="flex items-center justify-between h-5">
        <div className="flex items-center space-x-1.5 min-w-0 pr-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
          <span 
            className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[220px]"
            title={selectedTaskTitle || t('focus.freeFocus')}
          >
            {selectedTaskTitle || t('focus.freeFocus')}
          </span>
        </div>

        {/* 还原大窗口图标 */}
        <button
          type="button"
          style={{ WebkitAppRegion: 'no-drag' }}
          onClick={onExitMiniMode}
          title={t('focus.restore')}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a2233] transition-colors cursor-pointer flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* 底部核心行：时间数字与微型控制键 */}
      <div className="flex items-center justify-between pt-1">
        {/* 巨幅等宽时间数字 */}
        <div className="font-timer text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none select-none">
          {formatTimeDisplay(displaySeconds)}
        </div>

        {/* 动作按键组 */}
        <div 
          style={{ WebkitAppRegion: 'no-drag' }} 
          className="flex items-center space-x-1.5 flex-shrink-0"
        >
          {status === 'idle' && (
            <button
              type="button"
              onClick={handleStart}
              className="px-3 py-1 rounded-lg bg-[#0f2847] hover:bg-[#183a63] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {t('focus.start')}
            </button>
          )}

          {status === 'running' && (
            <>
              <button
                type="button"
                onClick={handlePause}
                title={t('focus.pause')}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {t('focus.pause')}
              </button>
              <button
                type="button"
                onClick={() => handleCompleteSession()}
                title={t('focus.complete')}
                className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </>
          )}

          {status === 'paused' && (
            <>
              <button
                type="button"
                onClick={handleResume}
                className="px-2.5 py-1 rounded-lg bg-[#0f2847] dark:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {t('focus.resume')}
              </button>
              <button
                type="button"
                onClick={() => handleCompleteSession()}
                title={t('common.save')}
                className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
