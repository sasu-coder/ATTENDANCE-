import React, { useState, useEffect } from 'react';
import { 
  Activity, Download, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Info, Home, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 20;

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  action: string;
  user: string;
  ip: string;
  details: string;
  module: string;
  duration: string;
}

const AdminSystemLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const loadLogs = async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    // Query user_activities table
    const { data, error, count } = await supabase
      .from('user_activities')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) {
      setLoading(false);
      return;
    }
    // Map to LogEntry (best effort, as user_activities may not have all fields)
    const logs: LogEntry[] = (data || []).map((rec: any) => ({
      id: rec.id,
      timestamp: rec.created_at,
      level: rec.activity_type || 'info',
      action: rec.description || '',
      user: rec.user_id || '',
      ip: '', // Not available
      details: rec.metadata ? JSON.stringify(rec.metadata) : '',
      module: '', // Not available
      duration: '', // Not available
    }));
    setTotalLogs(count || 0);
    if (reset) {
      setLogs(logs);
      setPage(2);
    } else {
      setLogs(prev => [...prev, ...logs]);
      setPage(prev => prev + 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs(true);
  }, [searchTerm, filterLevel]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => loadLogs(true), 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, searchTerm, filterLevel]);

  useEffect(() => {
    setFilteredLogs(logs);
  }, [logs]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (level) {
      case 'error': return `${baseClasses} bg-red-100 text-red-800`;
      case 'warning': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'success': return `${baseClasses} bg-green-100 text-green-800`;
      default: return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  const handleExportLogs = () => {
    if (logs.length === 0) {
      toast.error('No logs to export');
      return;
    }
    // Export logs as CSV
    const csvRows = [
      ['Timestamp', 'Level', 'Module', 'Action', 'User', 'IP Address', 'Duration', 'Details'],
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.level.toUpperCase(),
        log.module,
        log.action,
        log.user,
        log.ip,
        log.duration,
        log.details
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "system_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('System logs exported successfully');
  };

  const handleRefreshLogs = () => {
    loadLogs(true);
    toast.info('Refreshing system logs...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">System Logs</span>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start mb-4"
              onClick={() => navigate('/admin-portal')}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Admin Portal
            </Button>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Auto Refresh</span>
                <Button 
                  size="sm" 
                  variant={autoRefresh ? "default" : "outline"}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
                <p className="text-gray-600">Monitor system activities and troubleshoot issues</p>
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleRefreshLogs} variant="outline" disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={handleExportLogs} variant="outline" disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Logs</p>
                      <p className="text-2xl font-bold">{totalLogs}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">Errors</p>
                      <p className="text-2xl font-bold">{logs.filter(log => log.level === 'error').length}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">Warnings</p>
                      <p className="text-2xl font-bold">{logs.filter(log => log.level === 'warning').length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Success</p>
                      <p className="text-2xl font-bold">{logs.filter(log => log.level === 'success').length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Info</p>
                      <p className="text-2xl font-bold">{logs.filter(log => log.level === 'info').length}</p>
                    </div>
                    <Info className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-64">
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterLevel} onValueChange={value => setFilterLevel(value as 'all' | 'info' | 'warning' | 'error' | 'success')}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>System Activity Logs ({logs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Timestamp</th>
                        <th className="text-left p-3">Level</th>
                        <th className="text-left p-3">Module</th>
                        <th className="text-left p-3">Action</th>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">IP Address</th>
                        <th className="text-left p-3">Duration</th>
                        <th className="text-left p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedLog(log)}>
                          <td className="p-3 font-mono text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              {getLevelIcon(log.level)}
                              <span className={getLevelBadge(log.level)}>
                                {log.level.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{log.module}</Badge>
                          </td>
                          <td className="p-3 font-medium">{log.action}</td>
                          <td className="p-3">{log.user}</td>
                          <td className="p-3 font-mono text-sm">{log.ip}</td>
                          <td className="p-3 text-sm">{log.duration}</td>
                          <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {logs.length < totalLogs && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => loadLogs()} disabled={loading}>
                      {loading ? 'Loading...' : 'Load More Logs'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Log Details Modal */}
            {selectedLog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setSelectedLog(null)}
                  >
                    Close
                  </button>
                  <h2 className="text-xl font-bold mb-4">Log Details</h2>
                  <div className="space-y-2">
                    <p><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                    <p><strong>Level:</strong> {selectedLog.level.toUpperCase()}</p>
                    <p><strong>Module:</strong> {selectedLog.module}</p>
                    <p><strong>Action:</strong> {selectedLog.action}</p>
                    <p><strong>User:</strong> {selectedLog.user}</p>
                    <p><strong>IP Address:</strong> {selectedLog.ip}</p>
                    <p><strong>Duration:</strong> {selectedLog.duration}</p>
                    <p><strong>Details:</strong> {selectedLog.details}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemLogs;
