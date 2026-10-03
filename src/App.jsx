import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import TodayTasks from './components/TodayTasks.jsx';
import CalendarGantt from './components/CalendarGantt.jsx';
import FocusTimer from './components/FocusTimer.jsx';
import TaskFormModal from './components/TaskFormModal.jsx';
import DailyReviewModal from './components/DailyReviewModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import MiniCapsule from './components/MiniCapsule.jsx';
import { useTimerEngine } from './hooks/useTimerEngine.js';
import { storageManager } from './storage/storageManager.js';
import { getTodayString, isTaskActiveOnDate } from './utils/dateUtils.js';
import { LanguageProvider } from './locales/LanguageContext.jsx';
import { backupSummary, validateBackup } from './storage/backupData.js';
import { isAndroidApp } from './platform/platform.js';
import MobileCalendar from './components/MobileCalendar.jsx';

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('zh');
  const [currentView, setCurrentView] = useState('today');

  const [tasks, setTasks] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [dailyReviews, setDailyReviews] = useState({});

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewDateTarget, setReviewDateTarget] = useState(getTodayString());

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [activeFocusTask, setActiveFocusTask] = useState(null);
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [pendingImport, setPendingImport] = useState(null);
  const [recoveries, setRecoveries] = useState([]);
  const ui = (zh, en) => lang === 'en' ? en : zh;

  useEffect(() => {
    async function init() {
      let data;
      try { data = await storageManager.load(); }
      catch (error) { setLoadError(String(error)); return; }
      if (data) {
        setTasks(data.tasks || []);
        setFocusSessions(data.focusSessions || []);
        setDailyReviews(data.dailyReviews || {});
        if (data.theme) setTheme(data.theme);
        if (data.lang) setLang(data.lang);
      }
      setDataLoaded(true);
    }
    init();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const persistAllData = async (newTasks, newSessions, newReviews, newTheme = theme, newLang = lang) => {
    const payload = {
      version: '1.0.0',
      theme: newTheme,
      lang: newLang,
      tasks: newTasks,
      focusSessions: newSessions,
      dailyReviews: newReviews
    };
    if (!await storageManager.save(payload)) alert(ui('保存失败：请不要退出应用，先检查存储空间并导出当前数据。', 'Save failed. Keep the app open, check storage space, and export current data.'));
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    persistAllData(tasks, focusSessions, dailyReviews, newTheme, lang);
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
    persistAllData(tasks, focusSessions, dailyReviews, theme, newLang);
  };

  const handleToggleComplete = (taskId) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextDone = !t.isCompleted;
        return {
          ...t,
          isCompleted: nextDone,
          completedAt: nextDone ? new Date().toISOString() : null
        };
      }
      return t;
    });
    setTasks(updated);
    persistAllData(updated, focusSessions, dailyReviews);
  };

  const handleSaveTask = (taskData) => {
    let updated;
    const exists = tasks.some(t => t.id === taskData.id);
    if (exists) {
      updated = tasks.map(t => (t.id === taskData.id ? taskData : t));
    } else {
      updated = [taskData, ...tasks];
    }
    setTasks(updated);
    persistAllData(updated, focusSessions, dailyReviews);
  };

  const handleQuickAddTask = (title) => {
    const today = getTodayString();
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      estimatedMinutes: 25,
      startDate: today,
      dueDate: today,
      color: 'indigo',
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    persistAllData(updated, focusSessions, dailyReviews);
  };

  const handleDeleteTask = (taskId) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    persistAllData(updated, focusSessions, dailyReviews);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleScheduleTaskToday = (task) => {
    const today = getTodayString();
    const updated = tasks.map(t => {
      if (t.id === task.id) {
        return { ...t, startDate: today, dueDate: today };
      }
      return t;
    });
    setTasks(updated);
    persistAllData(updated, focusSessions, dailyReviews);
  };

  const handleStripTaskDate = (task) => {
    const updated = tasks.map(t => {
      if (t.id === task.id) {
        return { ...t, startDate: null, dueDate: null };
      }
      return t;
    });
    setTasks(updated);
    persistAllData(updated, focusSessions, dailyReviews);
  };

  const handleQuickAddUnscheduled = (title) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      estimatedMinutes: 25,
      startDate: null,
      dueDate: null,
      color: 'indigo',
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    persistAllData(updated, focusSessions, dailyReviews);
  };

  const handleSaveFocusSession = (newSession) => {
    const updated = [newSession, ...focusSessions];
    setFocusSessions(updated);
    persistAllData(tasks, updated, dailyReviews);
  };

  const globalTimer = useTimerEngine({
    tasks,
    initialTask: activeFocusTask,
    onSaveFocusSession: handleSaveFocusSession
  });

  const handleStartFocusOnTask = (task) => {
    setActiveFocusTask(task);
    globalTimer.setSelectedTaskId(task.id);
    setCurrentView('timer');
  };

  const handleEnterMiniMode = async () => {
    setIsMiniMode(true);
    await storageManager.setMiniMode(true);
  };

  const handleExitMiniMode = async () => {
    setIsMiniMode(false);
    await storageManager.setMiniMode(false);
  };

  const handleSaveReview = (dateStr, reviewData) => {
    const updated = {
      ...dailyReviews,
      [dateStr]: reviewData
    };
    setDailyReviews(updated);
    persistAllData(tasks, focusSessions, updated);
  };

  const handleExportBackup = async () => {
    const currentData = {
      version: '1.0.0',
      theme,
      lang,
      tasks,
      focusSessions,
      dailyReviews,
      exportedAt: new Date().toISOString()
    };
    let res;
    try { res = await storageManager.exportBackup(currentData); }
    catch (error) { res = { success: false, error: String(error) }; }
    if (res.success) {
      alert(res.note || (lang === 'en' ? 'Backup exported.' : '备份已导出，请核对文件确实保存在所选位置。'));
    } else if (!res.canceled) {
      alert(`导出失败：${res.error || '未知错误'}`);
    }
  };

  const handleImportBackup = async () => {
    if (globalTimer.status !== 'idle') { alert(ui('请先结束或放弃当前专注，再导入数据。', 'Finish or discard the current focus session before importing.')); return; }
    const res = await storageManager.importBackup();
    if (res.success && res.data) {
      try { setPendingImport(validateBackup(res.data)); }
      catch (error) { alert(`${ui('备份无效', 'Invalid backup')}: ${error.message}`); }
    } else if (!res.canceled) alert(`${ui('读取备份失败', 'Cannot read backup')}: ${res.error || ui('未知错误', 'Unknown error')}`);
  };

  const currentData = () => ({ version: '1.0.0', theme, lang, tasks, focusSessions, dailyReviews });
  const replaceWith = async (data) => {
    const saved = await storageManager.save({ ...data, theme: data.theme || theme, lang: data.lang || lang });
    if (!saved) throw new Error('新数据写入失败，原数据仍可从恢复文件找回');
    setTasks(data.tasks);
    setFocusSessions(data.focusSessions);
    setDailyReviews(data.dailyReviews);
    setTheme(data.theme || theme);
    setLang(data.lang || lang);
  };

  const confirmImport = async () => {
    try {
      const recovery = await storageManager.saveRecovery(currentData());
      if (!recovery.success) throw new Error(recovery.error || '接收端恢复文件创建失败');
      await replaceWith(pendingImport);
      setPendingImport(null);
      alert(ui(`导入完成。导入前数据已保存为 ${recovery.name}，可在设置中恢复。`, `Import complete. Pre-import data was saved as ${recovery.name} and can be restored from Settings.`));
    } catch (error) { alert(`${ui('导入已停止', 'Import stopped')}: ${error.message}`); }
  };

  const showRecoveries = async () => {
    if (globalTimer.status !== 'idle') { alert(ui('请先结束或放弃当前专注，再恢复数据。', 'Finish or discard the current focus session before restoring.')); return; }
    const names = await storageManager.listRecoveries();
    if (names.length === 0) alert(ui('当前没有导入前恢复文件。', 'No pre-import recovery files found.'));
    else setRecoveries(names);
  };
  const restoreRecovery = async (name) => {
    const result = await storageManager.loadRecovery(name);
    if (!result.success) { alert(`读取恢复文件失败：${result.error}`); return; }
    try { setPendingImport(validateBackup(result.data)); setRecoveries([]); }
    catch (error) { alert(`恢复文件无效：${error.message}`); }
  };

  if (loadError) return <div className="p-6">读取本地数据失败，已停止启动以避免覆盖原数据：{loadError}</div>;
  if (!dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white">
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping"></span>
          <span className="text-xs font-semibold tracking-wider text-slate-400">正在启动 doin...</span>
        </div>
      </div>
    );
  }

  // 桌面迷你置顶悬浮药丸（画中画）模式：仅渲染悬浮胶囊
  if (isMiniMode) {
    return (
      <LanguageProvider initialLang={lang} onLangChange={handleLangChange}>
        <MiniCapsule
          timer={globalTimer}
          onExitMiniMode={handleExitMiniMode}
        />
      </LanguageProvider>
    );
  }

  const today = getTodayString();
  const todaySessions = focusSessions.filter(s => s.date === today);

  return (
    <LanguageProvider initialLang={lang} onLangChange={handleLangChange}>
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        
        {/* 顶部纯色导航栏 */}
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onOpenNewTask={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          onOpenReviewModal={(dateStr) => {
            setReviewDateTarget(dateStr);
            setIsReviewModalOpen(true);
          }}
        />

        {/* 主视图区域 */}
        <main className="flex-1 pb-16">
          {currentView === 'today' && (
            <TodayTasks
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              onQuickAddTask={handleQuickAddTask}
              onStartFocusOnTask={handleStartFocusOnTask}
              todayFocusSessions={todaySessions}
              activeFocusTask={activeFocusTask}
              onSaveFocusSession={handleSaveFocusSession}
              todayReview={dailyReviews[today] || null}
              onSaveReview={handleSaveReview}
              onOpenReviewModal={(dateStr) => {
                setReviewDateTarget(dateStr);
                setIsReviewModalOpen(true);
              }}
              timer={globalTimer}
              onEnterMiniMode={isAndroidApp() ? null : handleEnterMiniMode}
            />
          )}

          {currentView === 'calendar' && (
            (isAndroidApp() ? <MobileCalendar
              tasks={tasks}
              dailyReviews={dailyReviews}
              focusSessions={focusSessions}
              onOpenReviewModal={(date) => { setReviewDateTarget(date); setIsReviewModalOpen(true); }}
              onEditTask={handleEditTask}
              onToggleComplete={handleToggleComplete}
              onAddNewTaskForDate={(date) => { setTaskToEdit({ startDate: date, dueDate: date }); setIsTaskModalOpen(true); }}
              onScheduleTaskToday={handleScheduleTaskToday}
              onStripTaskDate={handleStripTaskDate}
              onQuickAddUnscheduled={handleQuickAddUnscheduled}
              onAddNewUnscheduledTask={() => { setTaskToEdit({ startDate: null, dueDate: null }); setIsTaskModalOpen(true); }}
            /> : <CalendarGantt
              tasks={tasks}
              dailyReviews={dailyReviews}
              focusSessions={focusSessions}
              onOpenReviewModal={(dateStr) => {
                setReviewDateTarget(dateStr);
                setIsReviewModalOpen(true);
              }}
              onEditTask={handleEditTask}
              onToggleComplete={handleToggleComplete}
              onAddNewTaskForDate={(targetDate) => {
                setTaskToEdit({ startDate: targetDate, dueDate: targetDate });
                setIsTaskModalOpen(true);
              }}
              onScheduleTaskToday={handleScheduleTaskToday}
              onStripTaskDate={handleStripTaskDate}
              onQuickAddUnscheduled={handleQuickAddUnscheduled}
              onAddNewUnscheduledTask={() => {
                setTaskToEdit({ startDate: null, dueDate: null });
                setIsTaskModalOpen(true);
              }}
            />)
          )}

          {currentView === 'timer' && (
            <FocusTimer
              tasks={tasks}
              initialTask={activeFocusTask}
              onSaveFocusSession={handleSaveFocusSession}
              todaySessions={todaySessions}
              timer={globalTimer}
              onEnterMiniMode={isAndroidApp() ? null : handleEnterMiniMode}
            />
          )}
        </main>

        {/* 设置中心弹窗 */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          theme={theme}
          onThemeChange={handleThemeChange}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onShowRecoveries={showRecoveries}
        />

        {recoveries.length > 0 && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><div className="bg-white dark:bg-[#10141e] rounded-xl p-5 max-w-md w-full max-h-[80vh] overflow-auto space-y-3"><h2 className="font-bold">{ui('导入前恢复文件', 'Pre-import recovery files')}</h2><p className="text-sm">{ui('选择后还会显示内容摘要，并再次创建当前数据的恢复文件。', 'Select a file to preview its summary. A new recovery file will be created before replacing current data.')}</p>{recoveries.map(name => <button key={name} className="block w-full text-left text-xs break-all p-2 border rounded" onClick={() => restoreRecovery(name)}>{name}</button>)}<button onClick={() => setRecoveries([])}>{ui('关闭', 'Close')}</button></div></div>}

        {pendingImport && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><div className="bg-white dark:bg-[#10141e] rounded-xl p-5 max-w-md w-full space-y-4"><h2 className="font-bold">{ui('确认整体导入', 'Confirm replacement')}</h2><p className="text-sm">{ui('当前', 'Current')}: {ui('任务', 'tasks')} {tasks.length}、{ui('专注', 'sessions')} {focusSessions.length}、{ui('日志', 'reviews')} {Object.keys(dailyReviews).length}。</p><p className="text-sm">{ui('来源', 'Source')}: {ui('任务', 'tasks')} {backupSummary(pendingImport).tasks}、{ui('专注', 'sessions')} {backupSummary(pendingImport).sessions}、{ui('日志', 'reviews')} {backupSummary(pendingImport).reviews}。</p><p className="text-xs text-slate-400">{ui('备份时间', 'Backup time')}: {pendingImport.exportedAt || ui('未记录', 'Unknown')}</p><p className="text-sm text-rose-600">{ui('确认后，当前内容会被来源内容整体替换；两端新增的数据不会自动合并。导入前会自动保存当前端恢复文件，失败则停止。', 'The source will replace all current data. Changes on both devices will not merge. Current data will be saved as a recovery file first; import stops if that fails.')}</p><div className="flex gap-3"><button className="px-4 py-2 border rounded" onClick={() => setPendingImport(null)}>{ui('取消', 'Cancel')}</button><button className="px-4 py-2 bg-rose-600 text-white rounded" onClick={confirmImport}>{ui('确认替换', 'Replace data')}</button></div></div></div>}

        {/* 任务弹窗 */}
        <TaskFormModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskToEdit(null);
          }}
          onSave={handleSaveTask}
          taskToEdit={taskToEdit}
        />

        {/* 每日日志弹窗（单输入框笔记本纯净体验） */}
        <DailyReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          dateStr={reviewDateTarget}
          initialReview={dailyReviews[reviewDateTarget] || null}
          dayTasks={tasks.filter(t => isTaskActiveOnDate(t, reviewDateTarget))}
          dayFocusSessions={focusSessions.filter(s => s.date === reviewDateTarget)}
          onSaveReview={handleSaveReview}
        />

      </div>
    </LanguageProvider>
  );
}
