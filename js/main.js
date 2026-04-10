import { AttendanceHistory } from './attendance/history.js';
import { AttendanceManager } from './attendance/manager.js';
import { AttendanceUI } from './ui/ui.js';
import { calculateWorkingDays } from './attendance/utils.js';
import { CONFIG } from './helpers.js';
import { initStaleReload } from './utils/StaleReloadManager.js';

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed
const attendanceHistory = new AttendanceHistory();
const attendanceManager = new AttendanceManager(year, month, attendanceHistory);

// Initialize UI
const attendanceUI = new AttendanceUI(attendanceManager, today);






initStaleReload();
