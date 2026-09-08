/**
 * 专注计时精确引擎 (timerEngine.js)
 * 采用绝对时间戳比对算法，杜绝锁屏/休眠/后台节流导致的计时变慢问题
 */

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

// 基于 Web Audio API 的轻量悦耳完成提示音（无需加载外部 mp3，纯本地零依赖）
export function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    
    // 简短优美的双音节（类似苹果钟声/禅钟）
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
