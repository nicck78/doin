import test from 'node:test';
import assert from 'node:assert/strict';
import { getMobileTimeline } from '../src/utils/mobileTimeline.js';

test('mobile week clips spanning tasks and keeps tasks outside the window reachable', () => {
  const days = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'];
  const tasks = [
    { id: 'long', title: '跨天', startDate: '2026-09-30', dueDate: '2026-10-04' },
    { id: 'right', title: '延续到窗口外', startDate: '2026-10-06', dueDate: '2026-10-10' },
    { id: 'later', title: '窗口外', startDate: '2026-10-10', dueDate: '2026-10-12' },
    { id: 'one', title: '单日', startDate: '2026-10-03', dueDate: '2026-10-03' },
    { id: 'none', title: '待安排', startDate: null, dueDate: null }
  ];
  const view = getMobileTimeline(tasks, days);
  assert.deepEqual(view.bars.map(({ task, startColumn, span, startsBefore, endsAfter }) => ({ id: task.id, startColumn, span, startsBefore, endsAfter })), [
    { id: 'long', startColumn: 1, span: 4, startsBefore: true, endsAfter: false },
    { id: 'right', startColumn: 6, span: 2, startsBefore: false, endsAfter: true }
  ]);
  assert.deepEqual(view.singleDayByDate['2026-10-03'].map(task => task.id), ['one']);
  assert.deepEqual(view.outside.map(task => task.id), ['later']);
});

test('mobile week keeps every scheduled task and its full title for a crowded day', () => {
  const days = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'];
  const tasks = Array.from({ length: 7 }, (_, index) => ({
    id: `task-${index}`,
    title: `第 ${index + 1} 项需要完整显示的较长任务名称`,
    startDate: '2026-10-03',
    dueDate: '2026-10-03'
  }));
  const view = getMobileTimeline(tasks, days);
  assert.equal(view.singleDayByDate['2026-10-03'].length, 7);
  assert.deepEqual(view.singleDayByDate['2026-10-03'].map(task => task.title), tasks.map(task => task.title));
});
