import React from 'react';
import { formatTimeDisplay } from '../utils/dateUtils.js';

export default function MiniCapsule({
  timer,
  onExitMiniMode
}) {
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
      title="按住任意空白处可拖动悬浮窗，双击还原大窗口"
      style={{ WebkitAppRegion: 'drag' }}
      className="w-full h-screen p-2 select-none flex items-center justify-center bg-transparent overflow-hidden"
    >
      <div className="w-full h-full rounded-2xl px-3 py-2 flex flex-col justify-between bg-white/95 dark:bg-[#0c101a]/95 border border-[#e2e8f0] dark:border-[#1e2638] shadow-2xl backdrop-blur-md">
        
        {/* 顶部微条：任务标识与还原按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 min-w-0 pr-1">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-[#0f2847] dark:bg-blue-400'}`} />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
              {selectedTaskTitle || '自由专注'}
            </span>
          </div>

          {/* 还原大窗口图标 */}
          <button
            type="button"
            style={{ WebkitAppRegion: 'no-drag' }}
            onClick={onExitMiniMode}
            title="还原为大窗口"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a2233] transition-colors cursor-pointer"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* 底部核心行：时间数字与微型控制键 */}
        <div className="flex items-center justify-between pt-0.5">
          {/* 巨幅等宽时间数字 */}
          <div className="font-timer text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none">
            {formatTimeDisplay(displaySeconds)}
          </div>

          {/* 动作按键组 */}
          <div 
            style={{ WebkitAppRegion: 'no-drag' }} 
            className="flex items-center space-x-1"
          >
            {status === 'idle' && (
              <button
                type="button"
                onClick={handleStart}
                className="px-2.5 py-1 rounded-lg bg-[#0f2847] hover:bg-[#183a63] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                开始
              </button>
            )}

            {status === 'running' && (
              <>
                <button
                  type="button"
                  onClick={handlePause}
                  title="暂停"
                  className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  暂停
                </button>
                <button
                  type="button"
                  onClick={() => handleCompleteSession()}
                  title="完成本次专注"
                  className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="px-2 py-1 rounded-lg bg-[#0f2847] dark:bg-blue-600 text-white font-bold text-[11px] shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  继续
                </button>
                <button
                  type="button"
                  onClick={() => handleCompleteSession()}
                  title="保存记录"
                  className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
