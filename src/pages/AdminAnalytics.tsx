import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, BookOpen, 
  Calendar, Download, Filter, Home, PieChart, Activity,
  Clock, Target, Award, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Add types for department and course stats
interface DeptStat {
  name: string;
  students: number;
  rate: number;
}
interface CourseStat {
  name: string;
  students: number;
  attendance: number;
}

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('attendance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalAttendance: 0,
    avgAttendanceRate: 0,
    systemUptime: 99.9
  });
  const [attendanceByDept, setAttendanceByDept] = useState<DeptStat[]>([]);
  const [mostPopularCourses, setMostPopularCourses] = useState<CourseStat[]>([]);
  const [leastPopularCourses, setLeastPopularCourses] = useState<CourseStat[]>([]);
  const [userActivity, setUserActivity] = useState({
    dailyActive: 0,
    weeklyActive: 0,
    monthlyActive: 0,
    peakHours: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        // Users
        const { data: users, error: usersError } = await supabase.from('profiles').select('*');
        if (usersError) throw usersError;
        // Courses
        const { data: courses, error: coursesError } = await supabase.from('courses').select('*');
        if (coursesError) throw coursesError;
        // Attendance Analytics
        const { data: analytics, error: analyticsError } = await supabase.from('attendance_analytics').select('*');
        if (analyticsError) throw analyticsError;
        // Attendance Records
        const { data: records, error: recordsError } = await supabase.from('attendance_records').select('*');
        if (recordsError) throw recordsError;
        // User Activities
        const { data: activities, error: activitiesError } = await supabase.from('user_activities').select('*');
        if (activitiesError) throw activitiesError;

        // Overview
        setOverview({
          totalUsers: users.length,
          activeUsers: users.filter(u => u.role !== 'admin').length, // Example: non-admins as active
          totalCourses: courses.length,
          totalAttendance: records.length,
          avgAttendanceRate: analytics.length > 0 ? analytics.reduce((sum, a) => sum + (a.attendance_percentage || 0), 0) / analytics.length : 0,
          systemUptime: 99.9 // Placeholder
        });

        // Attendance by Department
        const deptMap: { [key: string]: DeptStat & { totalRate: number; count: number } } = {};
        users.forEach(u => {
          if (!u.department) return;
          if (!deptMap[u.department]) deptMap[u.department] = { name: u.department, students: 0, totalRate: 0, count: 0, rate: 0 };
          deptMap[u.department].students++;
        });
        analytics.forEach(a => {
          const user = users.find(u => u.id === a.student_id);
          if (user && user.department && a.attendance_percentage) {
            deptMap[user.department].totalRate += a.attendance_percentage;
            deptMap[user.department].count++;
          }
        });
        setAttendanceByDept(Object.values(deptMap).map((d) => ({
          name: d.name,
          students: d.students,
          rate: d.count > 0 ? d.totalRate / d.count : 0
        })));

        // Most/Least Popular Courses
        const courseStats: CourseStat[] = courses.map(course => {
          const enrolled = analytics.filter(a => a.course_id === course.id).length;
          const avgAttendance = analytics.filter(a => a.course_id === course.id).reduce((sum, a) => sum + (a.attendance_percentage || 0), 0) / (enrolled || 1);
          return { name: course.course_name, students: enrolled, attendance: avgAttendance };
        });
        setMostPopularCourses(courseStats.sort((a, b) => b.students - a.students).slice(0, 4));
        setLeastPopularCourses(courseStats.sort((a, b) => a.students - b.students).slice(0, 2));

        // User Activity (very basic, can be improved)
        setUserActivity({
          dailyActive: activities.length,
          weeklyActive: activities.length, // Placeholder
          monthlyActive: activities.length, // Placeholder
          peakHours: []
        });
      } catch (err) {
        setError('Failed to load analytics data.');
        toast.error('Failed to load analytics data from backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  const handleExportReport = () => {
    toast.success('Analytics report exported successfully');
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'attendance': return <Calendar className="h-5 w-5" />;
      case 'users': return <Users className="h-5 w-5" />;
      case 'courses': return <BookOpen className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Analytics</span>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start mb-6"
              onClick={() => navigate('/admin-portal')}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Admin Portal
            </Button>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Time Range
                </label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Focus Metric
                </label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="users">User Activity</SelectItem>
                    <SelectItem value="courses">Course Performance</SelectItem>
                    <SelectItem value="system">System Health</SelectItem>
                  </SelectContent>
                </Select>
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
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Comprehensive insights and performance metrics</p>
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleExportReport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12 text-lg text-gray-500">Loading analytics...</div>
            ) : error ? (
              <div className="text-center py-12 text-lg text-red-500">{error}</div>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Users</p>
                          <p className="text-2xl font-bold">{overview.totalUsers.toLocaleString()}</p>
                          <div className="flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-blue-200 mr-1" />
                            <span className="text-xs text-blue-200">+Live</span>
                          </div>
                        </div>
                        <Users className="h-8 w-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Active Users</p>
                          <p className="text-2xl font-bold">{overview.activeUsers}</p>
                          <div className="flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-green-200 mr-1" />
                            <span className="text-xs text-green-200">+Live</span>
                          </div>
                        </div>
                        <Activity className="h-8 w-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Total Courses</p>
                          <p className="text-2xl font-bold">{overview.totalCourses}</p>
                          <div className="flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-purple-200 mr-1" />
                            <span className="text-xs text-purple-200">+Live</span>
                          </div>
                        </div>
                        <BookOpen className="h-8 w-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Total Attendance</p>
                          <p className="text-2xl font-bold">{overview.totalAttendance}</p>
                          <div className="flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-orange-200 mr-1" />
                            <span className="text-xs text-orange-200">+Live</span>
                          </div>
                        </div>
                        <CheckCircle className="h-8 w-8 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-pink-100 text-sm">Avg Attendance Rate</p>
                          <p className="text-2xl font-bold">{overview.avgAttendanceRate}%</p>
                          <div className="flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-pink-200 mr-1" />
                            <span className="text-xs text-pink-200">+Live</span>
                          </div>
                        </div>
                        <PieChart className="h-8 w-8 text-pink-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-100 text-sm">System Uptime</p>
                          <p className="text-2xl font-bold">{overview.systemUptime}%</p>
                          <div className="flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-gray-200 mr-1" />
                            <span className="text-xs text-gray-200">+Live</span>
                          </div>
                        </div>
                        <Clock className="h-8 w-8 text-gray-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Attendance by Department */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Attendance by Department</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {attendanceByDept.map((dept, idx) => (
                      <Card key={idx} className="bg-white shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-700 font-semibold">{dept.name}</p>
                              <p className="text-2xl font-bold">{dept.rate}%</p>
                              <p className="text-xs text-gray-500">{dept.students} students</p>
                            </div>
                            <Award className="h-8 w-8 text-yellow-500" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                {/* Most/Least Popular Courses */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Course Performance</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Most Popular</h3>
                      {mostPopularCourses.map((course, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                          <span>{course.name}</span>
                          <span className="font-bold">{course.students} students</span>
                          <span className="text-green-600">{course.attendance}%</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Least Popular</h3>
                      {leastPopularCourses.map((course, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                          <span>{course.name}</span>
                          <span className="font-bold">{course.students} students</span>
                          <span className="text-red-600">{course.attendance}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
