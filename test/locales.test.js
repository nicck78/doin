import test from 'node:test';
import assert from 'node:assert/strict';
import { zh } from '../src/locales/zh.js';
import { en } from '../src/locales/en.js';

test('Chinese and English labels have matching keys and placeholders', () => {
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort());
  for (const key of Object.keys(zh)) {
    const placeholders = value => [...value.matchAll(/\{([a-zA-Z]+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(placeholders(zh[key]), placeholders(en[key]), key);
  }
});
