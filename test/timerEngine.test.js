import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateElapsedMs, formatTimeDisplay } from '../src/utils/timerEngine.js';

test('timerEngine: 秒数格式化测试 (MM:SS 与 HH:MM:SS)', () => {
  assert.equal(formatTimeDisplay(0), '00:00');
  assert.equal(formatTimeDisplay(45), '00:45');
  assert.equal(formatTimeDisplay(60), '01:00');
  assert.equal(formatTimeDisplay(1500), '25:00', '25分钟番茄钟标准显示');
  assert.equal(formatTimeDisplay(3600), '01:00:00', '整1小时');
  assert.equal(formatTimeDisplay(3665), '01:01:05', '1小时1分5秒');
});

test('timerEngine: 时间戳补算锁屏期间时长，并排除暂停时段', () => {
  // 模拟场景：用户在 14:00:00 点击开始专注
  const mockStartTime = 1725796800000;
  
  // 模拟正常前进了 10 秒
  let mockCurrentTime = mockStartTime + 10000;
  let elapsed = calculateElapsedMs(0, mockStartTime, mockCurrentTime);
  assert.equal(Math.floor(elapsed / 1000), 10, '正常计时 10 秒');

  // 模拟电脑进入息屏或休眠模式，主线程被挂起 30 分钟 (1800 秒)
  // 如果使用 setInterval++，恢复后由于缺少执行次数会发生严重时间漂移
  // 采用 Date.now() 时间戳差值算法：
  mockCurrentTime = mockStartTime + 10000 + (1800 * 1000);
  elapsed = calculateElapsedMs(0, mockStartTime, mockCurrentTime);
  assert.equal(Math.floor(elapsed / 1000), 1810, '恢复执行后补算经过时间');

  // 模拟暂停与继续：暂停 5 分钟不计入
  const accumulatedMs = elapsed; // 累计 1810 秒
  const resumeStartTime = mockCurrentTime + (300 * 1000); // 5分钟后继续
  const afterResumeTime = resumeStartTime + 20000; // 继续学了 20 秒
  assert.equal(calculateElapsedMs(accumulatedMs, null, resumeStartTime), 1810000, '暂停期间不累计');
  const finalTotal = calculateElapsedMs(accumulatedMs, resumeStartTime, afterResumeTime);
  assert.equal(Math.floor(finalTotal / 1000), 1830, '暂停后继续累计精确无误');
  assert.equal(calculateElapsedMs(5000, resumeStartTime, resumeStartTime - 1000), 5000, '系统时间回拨不产生负时长');
});
