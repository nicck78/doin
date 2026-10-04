/**
 * 专注计时使用时间戳计算时长，减少锁屏或后台定时器节流造成的误差。
 * 这不提供锁屏通知，也不保证应用进程被系统结束后继续运行。
 */

export function calculateElapsedMs(accumulatedMs, startedAt, now = Date.now()) {
  const completedSegments = Math.max(0, accumulatedMs);
  return startedAt === null ? completedSegments : completedSegments + Math.max(0, now - startedAt);
}

// 格式化秒数为 MM:SS 或 HH:MM:SS
export function formatTimeDisplay(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

// 使用 Web Audio API 播放完成提示音。
export function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    
    // 依次播放三个短音。
    const playNote = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    playNote(523.25, now, 0.4);       // C5
    playNote(659.25, now + 0.15, 0.6); // E5
    playNote(783.99, now + 0.3, 1.2);  // G5
  } catch (e) {
    console.warn('Audio feedback failed or muted by browser policy:', e);
  }
}
