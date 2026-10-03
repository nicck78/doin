import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  formatDate, 
  getTodayString, 
  addDays, 
  diffInDays, 
  generateSevenDaysWindow, 
  isTaskActiveOnDate, 
  isMultiDayTask,
  isUnscheduledTask,
  isOverdueSingleDayTask,
  getWeekdayName,
  getFriendlyDateLabel,
  getPendingMultiDayTasks
} from '../src/utils/dateUtils.js';

test('dateUtils: 基础日期计算与格式化', () => {
  const today = getTodayString();
  assert.match(today, /^\d{4}-\d{2}-\d{2}$/, '今天的日期应符合 YYYY-MM-DD');

  const tomorrow = addDays(today, 1);
  assert.equal(diffInDays(today, tomorrow), 1, '明天与今天相差 1 天');

  const threeDaysAgo = addDays(today, -3);
  assert.equal(diffInDays(threeDaysAgo, today), 3, '3天前与今天相差 3 天');
});

test('dateUtils: 手机规划清单保留所有未完成跨天任务并按截止日排序', () => {
  const tasks = [
    { id: 'far', startDate: '2026-10-03', dueDate: '2026-12-01', isCompleted: false },
    { id: 'single', startDate: '2026-10-03', dueDate: '2026-10-03', isCompleted: false },
    { id: 'past', startDate: '2026-09-01', dueDate: '2026-09-30', isCompleted: false },
    { id: 'done', startDate: '2026-10-01', dueDate: '2026-10-10', isCompleted: true },
    { id: 'near', startDate: '2026-10-01', dueDate: '2026-10-08', isCompleted: false }
  ];
  assert.deepEqual(getPendingMultiDayTasks(tasks).map(task => task.id), ['past', 'near', 'far']);
  assert.deepEqual(tasks.map(task => task.id), ['far', 'single', 'past', 'done', 'near'], '不得改变原任务顺序');
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

test('dateUtils: 待安排任务 (无日期) 与空安全判定', () => {
  const unscheduledTask = {
    id: 'task-unscheduled',
    title: '换季洗羽绒服',
    startDate: null,
    dueDate: null
  };

  assert.equal(isUnscheduledTask(unscheduledTask), true, '无日期任务判定为待安排');
  assert.equal(isMultiDayTask(unscheduledTask), false, '无日期任务不是多天任务');
  assert.equal(isTaskActiveOnDate(unscheduledTask, '2026-10-01'), false, '无日期任务在任何单日均不激活');
  assert.equal(diffInDays(unscheduledTask.startDate, unscheduledTask.dueDate), 0, 'null日期计算相差天数为0');
});

test('dateUtils: 过期未完成单日任务判定 (排除跨多天与已完成)', () => {
  const today = '2026-10-01';

  // 1. 昨天的未完成单日任务 -> 应为 overdue
  const yesterdayPending = {
    id: 'task-yesterday',
    title: '补写物理实验报告',
    startDate: '2026-09-30',
    dueDate: '2026-09-30',
    isCompleted: false
  };
  assert.equal(isOverdueSingleDayTask(yesterdayPending, today), true, '昨天未完成单日任务应为 overdue');

  // 2. 昨天的已完成单日任务 -> 不属于 overdue
  const yesterdayDone = {
    ...yesterdayPending,
    isCompleted: true
  };
  assert.equal(isOverdueSingleDayTask(yesterdayDone, today), false, '已完成任务不应为 overdue');

  // 3. 今天的单日任务 -> 不属于 overdue
  const todayTask = {
    id: 'task-today',
    title: '今天专注',
    startDate: today,
    dueDate: today,
    isCompleted: false
  };
  assert.equal(isOverdueSingleDayTask(todayTask, today), false, '今天的任务不属于 overdue');

  // 4. 跨多天的任务 (即使跨越昨天) -> 坚决排除，不属于待安排回收范畴
  const multiDayTask = {
    id: 'task-multi',
    title: '跨国文献研读',
    startDate: '2026-09-28',
    dueDate: '2026-10-03',
    isCompleted: false
  };
  assert.equal(isOverdueSingleDayTask(multiDayTask, today), false, '跨多天长期任务不应被回收');

  // 5. 无日期待安排任务 -> 不属于 overdue
  const unscheduled = {
    id: 'task-none',
    title: '纯灵感',
    startDate: null,
    dueDate: null,
    isCompleted: false
  };
  assert.equal(isOverdueSingleDayTask(unscheduled, today), false, '无日期任务不应被误判为 overdue');
});

test('dateUtils: 双语星期与友好日期格式化', () => {
  // 2026-10-01 是周四 (Thursday)
  const testDate = '2026-10-01';
  assert.equal(getWeekdayName(testDate, 'zh'), '周四', '中文模式应返回周四');
  assert.equal(getWeekdayName(testDate, 'en'), 'Thu', '英文模式应返回 Thu');

  // 未指定语言时默认兼容中文
  assert.equal(getWeekdayName(testDate), '周四', '默认无参应兼容中文周四');

  // 友好日期测试
  const today = getTodayString();
  assert.match(getFriendlyDateLabel(today, 'zh'), /^今天 · \d{2}\/\d{2}$/, '中文今天标签');
  assert.match(getFriendlyDateLabel(today, 'en'), /^Today · \d{2}\/\d{2}$/, '英文 Today 标签');

  const tomorrow = addDays(today, 1);
  assert.match(getFriendlyDateLabel(tomorrow, 'zh'), /^明天 · \d{2}\/\d{2}$/, '中文明天标签');
  assert.match(getFriendlyDateLabel(tomorrow, 'en'), /^Tomorrow · \d{2}\/\d{2}$/, '英文 Tomorrow 标签');

  assert.equal(getFriendlyDateLabel(null, 'zh'), '未定日期', '中文空日期');
  assert.equal(getFriendlyDateLabel(null, 'en'), 'Unscheduled', '英文空日期');
});

