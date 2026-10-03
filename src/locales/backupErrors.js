const backupErrors = {
  '备份内容不是数据对象': 'Backup content is not a data object',
  '备份缺少任务、专注记录或日志': 'Backup is missing tasks, focus sessions, or notes',
  '任务 ID 或标题不正确，或存在重复 ID': 'A task has an invalid ID or name, or a duplicate ID',
  '专注记录格式不正确': 'A focus session has an invalid format',
  '日志格式不正确': 'A note has an invalid format',
  '恢复文件名不正确': 'Invalid recovery file name',
  '新数据写入失败，原数据仍可从恢复文件找回': 'Could not save imported data. Your previous data is still in the recovery file',
  '接收端恢复文件创建失败': 'Could not create a recovery file on this device'
};

export function localizeBackupError(message, lang) {
  return lang === 'en' ? backupErrors[message] || message : message;
}
