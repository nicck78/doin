import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  formatDate, 
  getTodayString, 
  addDays, 
  diffInDays, 
  generateSevenDaysWindow, 
  isTaskActiveOnDate, 
  isMultiDayTask 
} from '../src/utils/dateUtils.js';

test('dateUtils: 基础日期计算与格式化', () => {
  const today = getTodayString();
  assert.match(today, /^\d{4}-\d{2}-\d{2}$/, '今天的日期应符合 YYYY-MM-DD');

  const tomorrow = addDays(today, 1);
  assert.equal(diffInDays(today, tomorrow), 1, '明天与今天相差 1 天');

  const threeDaysAgo = addDays(today, -3);
  assert.equal(diffInDays(threeDaysAgo, today), 3, '3天前与今天相差 3 天');
});

test('dateUtils: 滚动 7 天窗口生成 (前2天到后4天)', () => {
  const center = '2026-09-08';
  const windowDays = generateSevenDaysWindow(center);
  
  assert.equal(windowDays.length, 7, '窗口必须严格包含 7 天');
  assert.equal(windowDays[0], '2026-09-06', '第一天应为基准日的前2天');
  assert.equal(windowDays[2], '2026-09-08', '第三天应为基准日本身');
  assert.equal(windowDays[6], '2026-09-12', '第七天应为基准日的后4天');
});

test('dateUtils: 跨天长期待办判定与起止交集测试', () => {
  const multiDayTask = {
    id: 'task-1',
    title: '撰写公众号第二篇',
    startDate: '2026-09-07',
    dueDate: '2026-09-10'
  };

  const singleDayTask = {
    id: 'task-2',
    title: '今日专注',
    startDate: '2026-09-08',
    dueDate: '2026-09-08'
  };

  assert.equal(isMultiDayTask(multiDayTask), true, '多天任务判定为 true');
  assert.equal(isMultiDayTask(singleDayTask), false, '单天任务判定为 false');

  // 跨天任务在区间内每一天均有效
  assert.equal(isTaskActiveOnDate(multiDayTask, '2026-09-06'), false);
  assert.equal(isTaskActiveOnDate(multiDayTask, '2026-09-07'), true);
  assert.equal(isTaskActiveOnDate(multiDayTask, '2026-09-08'), true);
  assert.equal(isTaskActiveOnDate(multiDayTask, '2026-09-09'), true);
  assert.equal(isTaskActiveOnDate(multiDayTask, '2026-09-10'), true);
  assert.equal(isTaskActiveOnDate(multiDayTask, '2026-09-11'), false);
});
