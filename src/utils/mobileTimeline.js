import { getPendingMultiDayTasks, isMultiDayTask, isTaskActiveOnDate } from './dateUtils.js';

// 复用共享日期规则，只计算手机七列总览的位置。
export function getMobileTimeline(tasks, days) {
  const first = days[0];
  const last = days[days.length - 1];
  const singleDayByDate = Object.fromEntries(days.map(date => [
    date,
    tasks.filter(task => !isMultiDayTask(task) && isTaskActiveOnDate(task, date))
  ]));
  const spanning = tasks.filter(task => isMultiDayTask(task) && task.startDate <= last && task.dueDate >= first);
  const bars = spanning.map(task => {
    const start = days.findIndex(date => date >= task.startDate);
    const afterEnd = days.findIndex(date => date > task.dueDate);
    return {
      task,
      startColumn: (start === -1 ? 0 : start) + 1,
      span: (afterEnd === -1 ? days.length : afterEnd) - (start === -1 ? 0 : start),
      startsBefore: task.startDate < first,
      endsAfter: task.dueDate > last
    };
  });
  const outside = getPendingMultiDayTasks(tasks).filter(task => task.dueDate < first || task.startDate > last);
  return { singleDayByDate, bars, outside };
}
