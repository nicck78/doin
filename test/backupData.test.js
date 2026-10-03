import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBackup, backupSummary } from '../src/storage/backupData.js';

const sample = () => ({
  version: '1.0.0',
  tasks: [{ id: 'task-sample', title: '虚构任务', startDate: null, dueDate: null }],
  focusSessions: [{ id: 'session-sample', date: '2026-10-02', durationSeconds: 120 }],
  dailyReviews: { '2026-10-02': { content: '虚构日志' } }
});

test('备份摘要只计算三类记录，不修改来源', () => {
  const data = sample();
  assert.deepEqual(backupSummary(data), { tasks: 1, sessions: 1, reviews: 1 });
  assert.equal(data.tasks[0].title, '虚构任务');
});

test('拒绝缺少数据类别和重复任务 ID，避免误导入后清空数据', () => {
  assert.throws(() => validateBackup({ tasks: [] }), /缺少/);
  const data = sample();
  data.tasks.push({ ...data.tasks[0] });
  assert.throws(() => validateBackup(data), /重复 ID/);
});
