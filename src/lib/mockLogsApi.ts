type LogLevel = 'info' | 'warning' | 'error' | 'success';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  action: string;
  user: string;
  ip: string;
  details: string;
  module: string;
  duration: string;
}

const logTypes: LogLevel[] = ['info', 'warning', 'error', 'success'];
const actions = [
  'User login attempt',
  'Database query executed',
  'File upload completed',
  'Attendance marked',
  'Course created',
  'User registration',
  'Password reset',
  'Session timeout',
  'API request',
  'System backup',
  'Cache cleared',
  'Email sent'
];
const users = ['john.doe@ug.edu.gh', 'jane.smith@ug.edu.gh', 'system', 'admin@ug.edu.gh'];
const modules = ['Auth', 'Database', 'API', 'UI', 'System'];

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function generateLog(id: number): LogEntry {
  return {
    id,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    level: logTypes[randomInt(logTypes.length)],
    action: actions[randomInt(actions.length)],
    user: users[randomInt(users.length)],
    ip: `192.168.1.${randomInt(255)}`,
    details: `Operation completed ${Math.random() > 0.5 ? 'successfully' : 'with warnings'}`,
    module: modules[randomInt(modules.length)],
    duration: `${randomInt(1000)}ms`
  };
}

const TOTAL_LOGS = 200;
const allLogs: LogEntry[] = Array.from({ length: TOTAL_LOGS }, (_, i) => generateLog(i + 1))
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export interface FetchLogsParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
  filterLevel?: LogLevel | 'all';
  startDate?: string;
  endDate?: string;
  sortBy?: 'timestamp' | 'level';
  sortOrder?: 'asc' | 'desc';
}

export interface FetchLogsResult {
  logs: LogEntry[];
  total: number;
}

export function fetchLogs(params: FetchLogsParams): Promise<FetchLogsResult> {
  return new Promise((resolve) => {
    let filtered = allLogs;

    if (params.searchTerm) {
      const term = params.searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(term) ||
        log.user.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        log.module.toLowerCase().includes(term)
      );
    }

    if (params.filterLevel && params.filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === params.filterLevel);
    }

    if (params.startDate) {
      const start = new Date(params.startDate).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= start);
    }

    if (params.endDate) {
      const end = new Date(params.endDate).getTime();
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() <= end);
    }

    if (params.sortBy) {
      filtered = filtered.sort((a, b) => {
        let compare = 0;
        if (params.sortBy === 'timestamp') {
          compare = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        } else if (params.sortBy === 'level') {
          const levelOrder = { error: 1, warning: 2, success: 3, info: 4 };
          compare = levelOrder[a.level] - levelOrder[b.level];
        }
        return params.sortOrder === 'desc' ? -compare : compare;
      });
    }

    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageLogs = filtered.slice(start, end);

    setTimeout(() => {
      resolve({
        logs: pageLogs,
        total: filtered.length
      });
    }, 500); // simulate network delay
  });
}
