import test from 'node:test';
import assert from 'node:assert/strict';
import { storageManager } from '../src/storage/storageManager.js';

const sample = () => ({ version: '1.0.0', theme: 'dark', lang: 'zh', tasks: [{ id: 'fake-1', title: '虚构待办' }], focusSessions: [], dailyReviews: {} });

test('导入前恢复文件保留接收端数据，可再次读取', async () => {
  const values = new Map();
  globalThis.localStorage = {
    setItem: (key, value) => values.set(key, value),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index],
    get length() { return values.size; }
  };
  const original = sample();
  const recovery = await storageManager.saveRecovery(original);
  assert.equal(recovery.success, true);
  const replacement = { ...sample(), tasks: [{ id: 'fake-2', title: '另一端虚构待办' }] };
  assert.equal(await storageManager.save(replacement), true);
  const readBack = await storageManager.loadRecovery(recovery.name);
  assert.equal(readBack.data.tasks[0].title, '虚构待办');
  assert.deepEqual(await storageManager.listRecoveries(), [recovery.name]);
  delete globalThis.localStorage;
});

test('桌面写盘失败时不得报告保存成功', async () => {
  globalThis.window = { electronAPI: { isElectron: true, saveData: async () => ({ success: false, error: 'disk full' }) } };
  assert.equal(await storageManager.save(sample()), false);
  delete globalThis.window;
});

test('较早的慢写入不能在较新数据之后完成并覆盖它', async () => {
  const calls = [];
  let finishFirst;
  globalThis.window = { electronAPI: {
    isElectron: true,
    saveData: data => {
      calls.push(data.tasks[0].id);
      if (data.tasks[0].id === 'first') return new Promise(resolve => { finishFirst = resolve; });
      return Promise.resolve({ success: true });
    }
  } };
  const first = storageManager.save({ ...sample(), tasks: [{ id: 'first', title: '先保存' }] });
  const second = storageManager.save({ ...sample(), tasks: [{ id: 'second', title: '后保存' }] });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(calls, ['first'], '第一笔还没完成时不得启动第二笔写入');
  finishFirst({ success: true });
  assert.equal(await first, true);
  assert.equal(await second, true);
  assert.deepEqual(calls, ['first', 'second']);
  delete globalThis.window;
});
