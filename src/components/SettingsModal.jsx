import React from 'react';
import { useLanguage } from '../locales/LanguageContext.jsx';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  onExportBackup,
  onImportBackup,
  onShowRecoveries
}) {
  const { lang, setLang, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-soft">
      <div 
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#10141e] rounded-2xl shadow-2xl border border-[#f1f3f5] dark:border-[#1a2233] p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部标题与关闭 */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f5] dark:border-[#1a2233]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#f8f9fa] dark:bg-[#161c2b] text-slate-700 dark:text-slate-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('settings.title')}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 1. 外观主题 */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('settings.theme')}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onThemeChange('light')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'border-[#0f2847] bg-[#f8f9fa] text-[#0f2847] shadow-xs'
                  : 'border-[#f1f3f5] dark:border-[#1a2233] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{t('settings.theme.light')}</span>
            </button>

            <button
              type="button"
              onClick={() => onThemeChange('dark')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-[#161c2b] text-blue-400 shadow-xs'
                  : 'border-[#f1f3f5] dark:border-[#1a2233] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>{t('settings.theme.dark')}</span>
            </button>
          </div>
        </div>

        {/* 2. 界面语言 */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('settings.language')}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setLang('zh')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                lang === 'zh'
                  ? 'border-[#0f2847] dark:border-blue-500 bg-[#f8f9fa] dark:bg-[#161c2b] text-[#0f2847] dark:text-blue-400 shadow-xs font-bold'
                  : 'border-[#f1f3f5] dark:border-[#1a2233] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>🇨🇳 {t('settings.language.zh')}</span>
            </button>

            <button
              type="button"
              onClick={() => setLang('en')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                lang === 'en'
                  ? 'border-[#0f2847] dark:border-blue-500 bg-[#f8f9fa] dark:bg-[#161c2b] text-[#0f2847] dark:text-blue-400 shadow-xs font-bold'
                  : 'border-[#f1f3f5] dark:border-[#1a2233] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>🌐 {t('settings.language.en')}</span>
            </button>
          </div>
        </div>

        {/* 3. 数据备份与恢复 */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('settings.data')}
          </label>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            {t('settings.data.desc')}
          </p>
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={onExportBackup}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] bg-[#fcfcfd] dark:bg-[#0c101a] text-slate-700 dark:text-slate-300 hover:bg-[#f8f9fa] dark:hover:bg-[#161c2b] text-xs font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{t('nav.export')}</span>
            </button>

            <button
              type="button"
              onClick={onImportBackup}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] bg-[#fcfcfd] dark:bg-[#0c101a] text-slate-700 dark:text-slate-300 hover:bg-[#f8f9fa] dark:hover:bg-[#161c2b] text-xs font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span>{t('nav.import')}</span>
            </button>
          </div>
          <button type="button" onClick={onShowRecoveries} className="w-full py-2 text-xs rounded-xl border border-[#f1f3f5] dark:border-[#1a2233] text-slate-600 dark:text-slate-300">{lang === 'en' ? 'Restore pre-import data' : '恢复导入前数据'}</button>
        </div>

        {/* 4. 关于 doin */}
        <div className="pt-2 border-t border-[#f1f3f5] dark:border-[#1a2233] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <img src="./logo.png" alt="logo" className="w-5 h-5 rounded object-cover" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">doin</span>
            <span>·</span>
            <span>{t('settings.about.version')}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0f2847] hover:bg-[#173a63] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs"
          >
            {t('common.confirm')}
          </button>
        </div>

      </div>
    </div>
  );
}
