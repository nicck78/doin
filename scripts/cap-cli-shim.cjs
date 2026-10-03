// Work around uv_os_get_passwd failures in restricted Windows shells when the Capacitor CLI asks for the user's shell.
const os = require('node:os');
const original = os.userInfo;
os.userInfo = (...args) => {
  try { return original(...args); }
  catch (error) {
    if (error.code !== 'ERR_SYSTEM_ERROR') throw error;
    return { username: process.env.USERNAME || 'user', uid: -1, gid: -1, shell: process.env.ComSpec || 'cmd.exe', homedir: process.env.USERPROFILE || process.cwd() };
  }
};
