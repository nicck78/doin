export function validateBackup(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('备份内容不是数据对象');
  if (!Array.isArray(data.tasks) || !Array.isArray(data.focusSessions) || !data.dailyReviews || typeof data.dailyReviews !== 'object' || Array.isArray(data.dailyReviews)) {
    throw new Error('备份缺少任务、专注记录或日志');
  }
  const ids = new Set();
  for (const task of data.tasks) {
    if (!task || typeof task.id !== 'string' || !task.id || typeof task.title !== 'string' || ids.has(task.id)) throw new Error('任务 ID 或标题不正确，或存在重复 ID');
    ids.add(task.id);
  }
  for (const session of data.focusSessions) {
    if (!session || typeof session.id !== 'string' || !session.id || typeof session.date !== 'string' || !Number.isFinite(session.durationSeconds)) throw new Error('专注记录格式不正确');
  }
  for (const [date, review] of Object.entries(data.dailyReviews)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !review || typeof review !== 'object') throw new Error('日志格式不正确');
  }
  return data;
}

export function backupSummary(data) {
  validateBackup(data);
  return { tasks: data.tasks.length, sessions: data.focusSessions.length, reviews: Object.keys(data.dailyReviews).length };
}
