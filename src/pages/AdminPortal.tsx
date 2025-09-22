import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, BarChart3, FileText, Shield, 
  MessageSquare, Bell, Calendar, MapPin, Link, 
  Download, Upload, Eye, Plus, Edit, Trash2, Search,
  Filter, RefreshCw, Activity, TrendingUp, AlertTriangle,
  Mail, Phone, User, Building, Clock, Target, Home,
  BookOpen, Globe, Database, Lock, Languages, LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AdminPortal = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users and courses from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: usersData, error: usersError } = await supabase.from('profiles').select('*');
        const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*');
        if (usersError) throw usersError;
        if (coursesError) throw coursesError;
        setUsers(usersData || []);
        setCourses(coursesData || []);
      } catch (err) {
        setError('Failed to load data.');
        toast.error('Failed to load data from backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Logout logic
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const adminSections = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'courses', name: 'Course Management', icon: BookOpen },
    { id: 'analytics', name: 'Analytics & Reports', icon: BarChart3 },
    { id: 'blockchain', name: 'Blockchain Explorer', icon: Link },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'System Settings', icon: Settings },
    { id: 'logs', name: 'System Logs', icon: Activity }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-12 text-lg text-gray-500">Loading dashboard...</div>
      ) : error ? (
        <div className="text-center py-12 text-lg text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                  <p className="text-sm text-blue-200">{users.length > 0 ? '+Live' : ''}</p>
                </div>
                <Users className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active Sessions</p>
                  <p className="text-3xl font-bold">-</p>
                  <p className="text-sm text-green-200">Real-time</p>
                </div>
                <Activity className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Courses</p>
                  <p className="text-3xl font-bold">{courses.length}</p>
                  <p className="text-sm text-purple-200">All departments</p>
                </div>
                <BookOpen className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">System Health</p>
                  <p className="text-3xl font-bold">99.9%</p>
                  <p className="text-sm text-orange-200">Uptime</p>
                </div>
                <Shield className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">New user registration</p>
                  <p className="text-sm text-gray-600">kwame.asante@ug.edu.gh • 10 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Attendance marked - CS301</p>
                  <p className="text-sm text-gray-600">45 students present • 15 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
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
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{user.id}</td>
                      <td className="p-3 font-medium">{user.full_name}</td>
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
                        <Badge className="bg-green-100 text-green-800">active</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUserManagement();
      case 'courses': return (
        <div className="p-8 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h3 className="text-xl font-semibold mb-2">Course Management</h3>
          <p className="text-gray-600 mb-4">Manage all courses, assignments, and enrollments</p>
          <Button onClick={() => navigate('/admin-courses')} className="bg-blue-600 hover:bg-blue-700">
            Open Course Management
          </Button>
        </div>
      );
      case 'analytics': return (
        <div className="p-8 text-center">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
          <p className="text-gray-600 mb-4">Comprehensive insights and performance metrics</p>
          <Button onClick={() => navigate('/admin-analytics')} className="bg-green-600 hover:bg-green-700">
            Open Analytics Dashboard
          </Button>
        </div>
      );
      case 'blockchain': return <div className="p-8 text-center"><Link className="h-16 w-16 mx-auto mb-4 text-gray-400" /><p>Blockchain Explorer - Coming Soon</p></div>;
      case 'notifications': return <div className="p-8 text-center"><Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" /><p>Notification System - Coming Soon</p></div>;
      case 'system': return <div className="p-8 text-center"><Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" /><p>System Settings - Coming Soon</p></div>;
      case 'logs': return (
        <div className="p-8 text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 text-purple-600" />
          <h3 className="text-xl font-semibold mb-2">System Logs</h3>
          <p className="text-gray-600 mb-4">Monitor system activities and troubleshoot issues</p>
          <Button onClick={() => navigate('/admin-logs')} className="bg-purple-600 hover:bg-purple-700">
            Open System Logs
          </Button>
        </div>
      );
      default: return renderDashboard();
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
              {adminSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <span>{section.name}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start mt-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Administration Portal</h1>
            <p className="text-gray-600">Complete system management and control</p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
