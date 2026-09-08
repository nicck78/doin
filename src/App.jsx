import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import TodayTasks from './components/TodayTasks.jsx';
import CalendarGantt from './components/CalendarGantt.jsx';
import FocusTimer from './components/FocusTimer.jsx';
import TaskFormModal from './components/TaskFormModal.jsx';
import DailyReviewModal from './components/DailyReviewModal.jsx';
import { storageManager } from './storage/storageManager.js';
import { getTodayString } from './utils/dateUtils.js';

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('today');

  const [tasks, setTasks] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [dailyReviews, setDailyReviews] = useState({});

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewDateTarget, setReviewDateTarget] = useState(getTodayString());

  const [activeFocusTask, setActiveFocusTask] = useState(null);

  useEffect(() => {
    async function init() {
      const data = await storageManager.load();
      if (data) {
        setTasks(data.tasks || []);
        setFocusSessions(data.focusSessions || []);
        setDailyReviews(data.dailyReviews || {});
        if (data.theme) setTheme(data.theme);
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

  const persistAllData = async (newTasks, newSessions, newReviews, newTheme = theme) => {
    const payload = {
      version: '1.0.0',
      theme: newTheme,
      tasks: newTasks,
      focusSessions: newSessions,
      dailyReviews: newReviews
    };
    await storageManager.save(payload);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    persistAllData(tasks, focusSessions, dailyReviews, nextTheme);
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

  // 移除了原生 window.confirm，完全由 UI 内联卡片做防误触确认，杜绝焦点锁定 Bug
  const handleDeleteTask = (taskId) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    persistAllData(updated, focusSessions, dailyReviews);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleStartFocusOnTask = (task) => {
    setActiveFocusTask(task);
    setCurrentView('timer');
  };

  const handleSaveFocusSession = (newSession) => {
    const updated = [newSession, ...focusSessions];
    setFocusSessions(updated);
    persistAllData(tasks, updated, dailyReviews);
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
      tasks,
      focusSessions,
      dailyReviews,
      exportedAt: new Date().toISOString()
    };
    const res = await storageManager.exportBackup(currentData);
    if (res.success) {
      alert('备份成功导出！文件已安全保存在你的电脑中。');
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
      await persistAllData(d.tasks || [], d.focusSessions || [], d.dailyReviews || {}, d.theme || theme);
      alert('数据恢复成功！');
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

  const today = getTodayString();
  const todaySessions = focusSessions.filter(s => s.date === today);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* 顶部纯色导航栏 */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        toggleTheme={toggleTheme}
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
          />
        )}

        {currentView === 'timer' && (
          <FocusTimer
            tasks={tasks}
            initialTask={activeFocusTask}
            onSaveFocusSession={handleSaveFocusSession}
            todaySessions={todaySessions}
          />
        )}
      </main>

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
        dayTasks={tasks.filter(t => t.startDate <= reviewDateTarget && reviewDateTarget <= t.dueDate)}
        dayFocusSessions={focusSessions.filter(s => s.date === reviewDateTarget)}
        onSaveReview={handleSaveReview}
      />

    </div>
  );
}
