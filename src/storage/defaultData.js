import { getTodayString, addDays } from '../utils/dateUtils.js';

export function getDefaultInitialData() {
  const today = getTodayString();
  const yesterday = addDays(today, -1);
  const twoDaysLater = addDays(today, 2);
  const threeDaysLater = addDays(today, 3);

  return {
    version: '1.0.0',
    theme: 'dark', // 首次运行默认深色主题
    tasks: [
      {
        id: 'task-initial-1',
        title: '示例：准备课程报告',
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
        title: '示例：阅读资料',
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
        title: '示例：整理学习计划',
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
        title: '示例：记录今日安排',
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
        taskTitle: '示例：记录今日安排',
        completedAt: new Date().toISOString()
      }
    ],
    dailyReviews: {
      [today]: {
        summary: '示例日志：这里可以记录今天做过的事。',
        reflection: '这是一条演示内容，不代表用户的真实经历。',
        updatedAt: new Date().toISOString()
      }
    }
  };
}
