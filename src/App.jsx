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

  useEffect(() => {
    async function init() {
      const data = await storageManager.load();
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
    await storageManager.save(payload);
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
    const res = await storageManager.exportBackup(currentData);
    if (res.success) {
      alert(lang === 'en' ? 'Backup exported successfully!' : '备份成功导出！文件已安全保存在你的电脑中。');
    }
  };

  const handleImportBackup = async () => {
    const res = await storageManager.importBackup();
    if (res.success && res.data) {
      const d = res.data;
      setTasks(d.tasks || []);
      setFocusSessions(d.focusSessions || []);
      setDailyReviews(d.dailyReviews || {});
      if (d.theme) setTheme(d.theme);
      if (d.lang) setLang(d.lang);
      await persistAllData(d.tasks || [], d.focusSessions || [], d.dailyReviews || {}, d.theme || theme, d.lang || lang);
      alert(lang === 'en' ? 'Data restored successfully!' : '数据恢复成功！');
    }
  };

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
              onEnterMiniMode={handleEnterMiniMode}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarGantt
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
            />
          )}

          {currentView === 'timer' && (
            <FocusTimer
              tasks={tasks}
              initialTask={activeFocusTask}
              onSaveFocusSession={handleSaveFocusSession}
              todaySessions={todaySessions}
              timer={globalTimer}
              onEnterMiniMode={handleEnterMiniMode}
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
        />

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
