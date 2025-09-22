import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Play, 
  Users, 
  CheckCircle, 
  MapPin, 
  Camera, 
  QrCode, 
  Bell, 
  Award,
  Target,
  Zap,
  Star,
  AlertCircle,
  CheckSquare,
  XCircle,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useAttendance } from '@/hooks/useAttendanceStore';
import { useUserData } from '@/hooks/useUserData';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAttendance();
  const { profile } = useUserData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Database Systems class starts in 15 minutes', type: 'info', time: '2 min ago' },
    { id: 2, message: 'Attendance marked successfully for Computer Networks', type: 'success', time: '1 hour ago' },
    { id: 3, message: 'New assignment posted in Software Engineering', type: 'warning', time: '3 hours ago' }
  ]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      title: 'Enrolled Courses',
      value: '8',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      progress: 100,
      onClick: () => navigate('/courses')
    },
    {
      title: 'Attendance Rate',
      value: '87%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      progress: 87,
      onClick: () => navigate('/analytics')
    },
    {
      title: 'Classes Today',
      value: '4',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      progress: 50,
      onClick: () => navigate('/schedule')
    },
    {
      title: 'Next Class',
      value: '2:00 PM',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      progress: 75,
      onClick: () => toast.info('Database Systems starts at 2:00 PM in Room 101')
    }
  ];

  const todayClasses = [
    { 
      course: 'Computer Networks', 
      time: '8:00 AM', 
      status: 'Present', 
      date: 'Today', 
      room: 'Room 205',
      lecturer: 'Dr. Kwame Nkrumah',
      attendanceMethod: 'Face Recognition',
      progress: 100,
      completed: true
    },
    { 
      course: 'Software Engineering', 
      time: '10:00 AM', 
      status: 'Present', 
      date: 'Today', 
      room: 'Lab 2',
      lecturer: 'Prof. Ama Aidoo',
      attendanceMethod: 'QR Code',
      progress: 100,
      completed: true
    },
    { 
      course: 'Database Systems', 
      time: '2:00 PM', 
      status: 'Upcoming', 
      date: 'Today', 
      room: 'Room 101',
      lecturer: 'Dr. John Smith',
      attendanceMethod: 'Pending',
      progress: 0,
      completed: false
    },
    { 
      course: 'Web Development', 
      time: '4:00 PM', 
      status: 'Upcoming', 
      date: 'Today', 
      room: 'Lab 3',
      lecturer: 'Prof. Sarah Johnson',
      attendanceMethod: 'Pending',
      progress: 0,
      completed: false
    },
  ];

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Use QR code, Face ID, or GPS to mark your presence',
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      onClick: () => {
        dispatch({
          type: 'MARK_ATTENDANCE',
          payload: {
            studentId: profile?.student_id || '20230001',
            studentName: profile?.full_name || 'Student',
            courseId: 'CS340',
            courseName: 'Database Systems',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            status: 'present',
            method: 'QR Code',
            location: 'Room 101',
            lecturerName: 'Dr. John Smith'
          }
        });
        toast.success('Attendance marked successfully for Database Systems!');
        navigate('/attendance');
      }
    },
    {
      title: 'View Schedule',
      description: 'Check your complete class timetable and assignments',
      icon: Calendar,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      onClick: () => navigate('/schedule')
    },
    {
      title: 'Join Live Class',
      description: 'Connect to ongoing virtual or hybrid sessions',
      icon: Play,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      onClick: () => {
        toast.success('Joining Database Systems virtual session...');
        setTimeout(() => {
          toast.info('Connected to virtual classroom');
        }, 2000);
      }
    }
  ];

  const recentAchievements = [
    { 
      title: 'Perfect Attendance', 
      description: 'Maintained 100% attendance for Computer Networks', 
      icon: '🏆',
      points: 50,
      color: 'from-yellow-400 to-orange-500'
    },
    { 
      title: 'Early Bird', 
      description: 'Arrived 15 minutes early for 5 consecutive classes', 
      icon: '⏰',
      points: 30,
      color: 'from-blue-400 to-cyan-500'
    },
    { 
      title: 'Tech Savvy', 
      description: 'Successfully used all attendance methods', 
      icon: '💻',
      points: 25,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const weeklyProgress = [
    { day: 'Mon', attendance: 100, target: 100 },
    { day: 'Tue', attendance: 100, target: 100 },
    { day: 'Wed', attendance: 75, target: 100 },
    { day: 'Thu', attendance: 100, target: 100 },
    { day: 'Fri', attendance: 50, target: 100 },
    { day: 'Sat', attendance: 0, target: 0 },
    { day: 'Sun', attendance: 0, target: 0 }
  ];

  const handleMarkAttendance = (method: 'qr' | 'face' | 'gps') => {
    const methods = {
      qr: 'QR Code',
      face: 'Face Recognition',
      gps: 'GPS Verification'
    };
    
    toast.success(`Attempting ${methods[method]} attendance...`);
    
    setTimeout(() => {
      dispatch({
        type: 'MARK_ATTENDANCE',
        payload: {
          studentId: '20230001',
          studentName: 'Kwame Asante',
          courseId: 'CS301',
          courseName: 'Computer Networks',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          status: 'present',
          method: methods[method] as any,
          location: 'Room 205'
        }
      });
      toast.success(`Attendance marked via ${methods[method]}!`);
    }, 2000);
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Enhanced Header with Real-time Status */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'Student'}! 👋</h1>
                <p className="text-blue-100">Here's your academic overview for today</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                <Calendar className="h-4 w-4 mr-1" />
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 mr-1" />
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card 
              key={stat.title} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md"
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${stat.bgColor} mr-4`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                  <div className="w-16">
                    <Progress value={stat.progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Weekly Attendance Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium text-gray-600 mb-2">{day.day}</div>
                  <div className="relative h-20 bg-gray-100 rounded-lg flex items-end justify-center p-1">
                    <div 
                      className="bg-gradient-to-t from-green-400 to-green-600 rounded w-full transition-all duration-300"
                      style={{ height: `${(day.attendance / day.target) * 100}%` }}
                    ></div>
                    <span className="absolute -bottom-6 text-xs text-gray-500">
                      {day.attendance}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Attendance Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Quick Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleMarkAttendance('qr')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 h-auto flex flex-col items-center space-y-3 transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 bg-white/20 rounded-full">
                  <QrCode className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">QR Code</div>
                  <div className="text-xs opacity-90">Scan classroom QR</div>
                </div>
              </Button>
              <Button
                onClick={() => handleMarkAttendance('face')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 h-auto flex flex-col items-center space-y-3 transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 bg-white/20 rounded-full">
                  <Camera className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">Face Recognition</div>
                  <div className="text-xs opacity-90">AI facial verification</div>
                </div>
              </Button>
              <Button
                onClick={() => handleMarkAttendance('gps')}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 h-auto flex flex-col items-center space-y-3 transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 bg-white/20 rounded-full">
                  <MapPin className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">GPS Check-in</div>
                  <div className="text-xs opacity-90">Location verification</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-red-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  onClick={action.onClick}
                  className={`${action.color} text-white p-6 h-auto flex flex-col items-center space-y-3 transition-all duration-300 hover:scale-105 shadow-lg`}
                >
                  <div className="p-3 bg-white/20 rounded-full">
                    <action.icon className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Today's Classes */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Today's Classes
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/schedule')}
                className="hover:bg-blue-50"
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayClasses.map((class_, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 cursor-pointer border border-gray-200"
                  onClick={() => toast.info(`${class_.course} with ${class_.lecturer} - ${class_.room}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${class_.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {class_.completed ? (
                          <CheckSquare className="h-5 w-5 text-green-600" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{class_.course}</p>
                      <p className="text-sm text-gray-500">
                        {class_.time} • {class_.room} • {class_.lecturer}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">
                          Method: {class_.attendanceMethod}
                        </span>
                        <Progress value={class_.progress} className="w-20 h-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={class_.status === 'Present' ? 'default' : class_.status === 'Upcoming' ? 'secondary' : 'destructive'}
                      className={`${
                        class_.status === 'Present' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : class_.status === 'Upcoming'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {class_.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Achievements */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">{achievement.points} points</span>
                      </div>
                    </div>
                  </div>
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${achievement.color} opacity-10 rounded-full -translate-y-10 translate-x-10`}></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;
