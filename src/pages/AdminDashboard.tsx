import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, BarChart3, FileText, Shield, Globe, 
  MessageSquare, Bell, Calendar, MapPin, Link, 
  Download, Upload, Eye, Plus, Edit, Trash2, Search,
  Filter, RefreshCw, Activity, TrendingUp, AlertTriangle,
  Mail, Phone, User, Building, Clock, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([
    { id: 'ADM001', name: 'John Admin', role: 'admin', email: 'admin@ug.edu.gh', status: 'active', lastLogin: '2024-01-15 09:30' },
    { id: 'LEC001', name: 'Dr. Sarah Johnson', role: 'lecturer', email: 'sarah.johnson@ug.edu.gh', status: 'active', lastLogin: '2024-01-15 08:45' },
    { id: 'LEC002', name: 'Prof. Kwame Nkrumah', role: 'lecturer', email: 'kwame.nkrumah@ug.edu.gh', status: 'active', lastLogin: '2024-01-15 07:20' },
    { id: 'STU001', name: 'Kwame Asante', role: 'student', email: 'kwame.asante@ug.edu.gh', status: 'active', lastLogin: '2024-01-15 10:15' },
    { id: 'STU002', name: 'Ama Osei', role: 'student', email: 'ama.osei@ug.edu.gh', status: 'active', lastLogin: '2024-01-15 09:50' }
  ]);

  const [courses, setCourses] = useState([
    { id: 'CS301', name: 'Computer Networks', lecturer: 'Dr. Sarah Johnson', students: 45, room: 'Room 101', schedule: 'Mon 9:00-11:00' },
    { id: 'CS340', name: 'Database Systems', lecturer: 'Prof. Kwame Nkrumah', students: 38, room: 'Room 203', schedule: 'Wed 2:00-4:00' },
    { id: 'CS350', name: 'Web Development', lecturer: 'Dr. Sarah Johnson', students: 52, room: 'Lab 3', schedule: 'Fri 10:00-12:00' }
  ]);

  const [systemLogs, setSystemLogs] = useState([
    { id: 1, type: 'login', user: 'kwame.asante@ug.edu.gh', action: 'User login', timestamp: '2024-01-15 10:15:32', ip: '192.168.1.45' },
    { id: 2, type: 'attendance', user: 'system', action: 'Attendance marked - CS301', timestamp: '2024-01-15 09:30:12', ip: 'system' },
    { id: 3, type: 'security', user: 'admin', action: 'Failed login attempt', timestamp: '2024-01-15 08:45:23', ip: '192.168.1.67' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'System Maintenance', message: 'Scheduled maintenance tonight 2:00 AM', type: 'info', sent: false },
    { id: 2, title: 'Attendance Alert', message: 'Low attendance detected in CS301', type: 'warning', sent: true },
    { id: 3, title: 'New User Registration', message: 'Welcome message for new students', type: 'info', sent: false }
  ]);

  const stats = [
    { title: 'Total Users', value: '1,234', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100', change: '+12%' },
    { title: 'Active Sessions', value: '45', icon: Activity, color: 'text-green-600', bgColor: 'bg-green-100', change: '+8%' },
    { title: 'Total Courses', value: '156', icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-100', change: '+3%' },
    { title: 'System Health', value: '99.9%', icon: Shield, color: 'text-orange-600', bgColor: 'bg-orange-100', change: 'Stable' }
  ];

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'courses', name: 'Course Management', icon: Calendar },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'reports', name: 'Reports', icon: FileText },
    { id: 'blockchain', name: 'Blockchain Explorer', icon: Link },
    { id: 'notifications', name: 'Push Notifications', icon: Bell },
    { id: 'settings', name: 'System Settings', icon: Settings },
    { id: 'logs', name: 'System Logs', icon: Activity }
  ];

  const handleCreateUser = () => {
    toast.success('User creation modal opened');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success('User deleted successfully');
  };

  const handleSendNotification = (notificationId: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, sent: true } : notif
    ));
    toast.success('Notification sent successfully');
  };

  const exportReport = (format: string) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-gray-600">{log.user} • {log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Server Status</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Database</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>API Response</span>
                <Badge className="bg-green-100 text-green-800">145ms</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Storage</span>
                <Badge className="bg-yellow-100 text-yellow-800">78% Used</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Users</CardTitle>
            <div className="flex space-x-2">
              <Input placeholder="Search users..." className="w-64" />
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Last Login</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{user.id}</td>
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3">
                      <Badge className={
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'lecturer' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <Badge className="bg-green-100 text-green-800">{user.status}</Badge>
                    </td>
                    <td className="p-3 text-sm">{user.lastLogin}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Report System</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Attendance Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Generate detailed attendance analytics</p>
            <div className="space-y-2">
              <Button onClick={() => exportReport('pdf')} className="w-full" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => exportReport('excel')} className="w-full" variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Analytics Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Student performance analytics</p>
            <div className="space-y-2">
              <Button onClick={() => exportReport('pdf')} className="w-full" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => exportReport('csv')} className="w-full" variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">User Reports</h3>
            <p className="text-sm text-gray-600 mb-4">User activity and engagement</p>
            <div className="space-y-2">
              <Button onClick={() => exportReport('pdf')} className="w-full" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => exportReport('json')} className="w-full" variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Push Notification System</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Notification
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Notification Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={notification.sent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {notification.sent ? 'Sent' : 'Pending'}
                  </Badge>
                  {!notification.sent && (
                    <Button 
                      size="sm" 
                      onClick={() => handleSendNotification(notification.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Send Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUserManagement();
      case 'reports': return renderReports();
      case 'notifications': return renderNotifications();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Admin Portal</span>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Administration Dashboard</h1>
            <p className="text-gray-600">Complete system management and analytics</p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
