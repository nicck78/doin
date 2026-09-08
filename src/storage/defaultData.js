import { getTodayString, addDays } from '../utils/dateUtils.js';

export function getDefaultInitialData() {
  const today = getTodayString();
  const yesterday = addDays(today, -1);
  const twoDaysLater = addDays(today, 2);
  const threeDaysLater = addDays(today, 3);

  return {
    version: '1.0.0',
    theme: 'dark', // 默认暗色模式，极具现代感
    tasks: [
      {
        id: 'task-initial-1',
        title: '整理公众号第二篇：开发实验记录素材',
        estimatedMinutes: 60,
        startDate: yesterday,
        dueDate: twoDaysLater,
        color: 'indigo',
        isCompleted: false,
        completedAt: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-initial-2',
        title: '测试 doin 桌面应用的专注计时功能',
        estimatedMinutes: 25,
        startDate: today,
        dueDate: today,
        color: 'emerald',
        isCompleted: false,
        completedAt: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-initial-3',
        title: '制定大学本学期自学 AI 的每周小目标',
        estimatedMinutes: 45,
        startDate: today,
        dueDate: threeDaysLater,
        color: 'amber',
        isCompleted: false,
        completedAt: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-initial-4',
        title: '完成 doin 第一阶段实施计划评审',
        estimatedMinutes: 15,
        startDate: today,
        dueDate: today,
        color: 'cyan',
        isCompleted: true,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ],
    focusSessions: [
      {
        id: 'session-demo-1',
        date: today,
        durationSeconds: 1500, // 25 分钟
        mode: 'stopwatch',
        taskTitle: '完成 doin 第一阶段实施计划评审',
        completedAt: new Date().toISOString()
      }
    ],
    dailyReviews: {
      [today]: {
        summary: '今天与 AI 紧密配合，完成了 doin 软件的架构设计与环境准备。',
        reflection: '和 AI 沟通时提出具体边界比笼统描述更有效。多天任务甘特视图很期待！',
        updatedAt: new Date().toISOString()
      }
    }
  };
}
