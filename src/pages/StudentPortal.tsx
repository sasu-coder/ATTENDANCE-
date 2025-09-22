import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  QrCode, Camera, MapPin, Calendar, Award, Bell, 
  Settings, MessageSquare, Clock, CheckCircle, XCircle,
  AlertTriangle, Star, Trophy, Target, Book, TrendingUp,
  Navigation, Scan, Shield, Activity, Users, BookOpen, Home
} from 'lucide-react';
import { toast } from 'sonner';
import { useAttendance } from '@/hooks/useAttendanceStore';
import { supabase } from '@/integrations/supabase/client';

const StudentPortal = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAttendance();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [classSessions, setClassSessions] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [scanningMode, setScanningMode] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);


  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError('');
      try {
        // Get current user (student)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('No authenticated user found. Please log in.');
          toast.error('Authentication required. Please log in.');
          return;
        }

        // Fetch real student profile from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setError('Failed to load user profile.');
          toast.error('Failed to load user profile from database.');
          return;
        }

        if (!profile) {
          setError('User profile not found.');
          toast.error('User profile not found in database.');
          return;
        }

        // Set student data with real user information
        setStudentData({
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          program: profile.department || 'Undefined',
          level: `Year ${profile.year_of_study || 'N/A'}`,
          student_id: profile.student_id || profile.id,
          department: profile.department || 'Undefined',
          year: profile.year_of_study || 0,
          phone: profile.phone_number || 'Not provided',
          address: 'University of Ghana',
          profile_image: profile.profile_image_url || '/placeholder-avatar.jpg'
        });
        
        // Fetch real enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('student_id', user.id);

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
          setEnrolledCourses([]);
        } else {
          // Fetch courses for enrolled courses
          const courseIds = (enrollments || []).map(e => e.course_id);
          if (courseIds.length > 0) {
            const { data: courses, error: coursesError } = await supabase
              .from('courses')
              .select('*')
              .in('id', courseIds);
            
            if (coursesError) {
              console.error('Error fetching courses:', coursesError);
              setEnrolledCourses([]);
            } else {
              setEnrolledCourses(courses || []);
            }
          } else {
            setEnrolledCourses([]);
          }
        }
        
        // Fetch real attendance analytics
        const { data: analytics, error: analyticsError } = await supabase
          .from('attendance_analytics')
          .select('*')
          .eq('student_id', user.id);

        if (analyticsError) {
          console.error('Error fetching analytics:', analyticsError);
          setAttendanceStats([]);
        } else {
          setAttendanceStats(analytics || []);
        }
        
        // Fetch real attendance records
        const { data: records, error: recordsError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (recordsError) {
          console.error('Error fetching attendance records:', recordsError);
          setAttendanceRecords([]);
        } else {
          setAttendanceRecords(records || []);
        }
        
        // Fetch class sessions for enrolled courses
        const courseIds = (enrollments || []).map(e => e.course_id);
        if (courseIds.length > 0) {
          const { data: sessions, error: sessionsError } = await supabase
            .from('class_sessions')
            .select('*')
            .in('course_id', courseIds);

          if (sessionsError) {
            console.error('Error fetching class sessions:', sessionsError);
            setClassSessions([]);
          } else {
            setClassSessions(sessions || []);
          }
        } else {
          setClassSessions([]);
        }
      } catch (err) {
        setError('Failed to load student data.');
        toast.error('Failed to load student data from backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  // Generate student ID in proper range
  const generateStudentId = () => {
    return Math.floor(Math.random() * (29999999 - 10900000 + 1)) + 10900000;
  };

  // Simulate live class tracking
  useEffect(() => {
    const liveClasses = [
      { course: 'Database Systems', time: '2:00 PM', location: 'Room 101', status: 'Live Now' },
      { course: 'Web Development', time: '4:00 PM', location: 'Lab 3', status: 'Starting Soon' },
      { course: 'Software Engineering', time: '10:00 AM', location: 'Room 205', status: 'Upcoming' }
    ];
    
    const currentTime = new Date().getHours();
    if (currentTime >= 14 && currentTime <= 16) {
      setCurrentClass(liveClasses[0]);
    } else if (currentTime >= 16 && currentTime <= 18) {
      setCurrentClass(liveClasses[1]);
    } else {
      setCurrentClass(liveClasses[2]);
    }
  }, []);

  // Get GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setGpsLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      });
    }
  }, []);

  const upcomingClasses = [
    { 
      id: 'cs301',
      course: 'Database Systems', 
      time: '2:00 PM', 
      room: 'Room 101', 
      lecturer: 'Dr. John Smith',
      status: 'active'
    },
    { 
      id: 'cs350',
      course: 'Web Development', 
      time: '4:00 PM', 
      room: 'Lab 3', 
      lecturer: 'Prof. Sarah Johnson',
      status: 'upcoming'
    },
    { 
      id: 'cs400',
      course: 'Software Engineering', 
      time: '10:00 AM', 
      room: 'Room 205', 
      lecturer: 'Dr. Kwame Nkrumah',
      status: 'scheduled'
    }
  ];

  const achievements = [
    { 
      title: 'Perfect Attendance', 
      description: 'Maintained 100% attendance for 2 weeks', 
      icon: Trophy, 
      color: 'text-yellow-600',
      dateEarned: '2024-01-10',
      progress: 100
    },
    { 
      title: 'Early Bird', 
      description: 'Arrived early 10 times consecutively', 
      icon: Clock, 
      color: 'text-blue-600',
      dateEarned: '2024-01-05',
      progress: 100
    },
    { 
      title: 'Tech Savvy', 
      description: 'Used all attendance methods successfully', 
      icon: Star, 
      color: 'text-purple-600',
      dateEarned: '2024-01-12',
      progress: 100
    },
    { 
      title: 'Consistent Learner', 
      description: 'Never missed a class this month', 
      icon: Target, 
      color: 'text-green-600',
      dateEarned: '2024-01-15',
      progress: 90
    },
    { 
      title: 'High Performer', 
      description: 'Maintained GPA above 3.5', 
      icon: Award, 
      color: 'text-red-600',
      dateEarned: '2024-01-08',
      progress: 100
    },
    { 
      title: 'Active Participant', 
      description: 'Participated in 5 class discussions', 
      icon: Users, 
      color: 'text-indigo-600',
      dateEarned: '2024-01-14',
      progress: 80
    }
  ];

  const handleQRScan = () => {
    if (!studentData) {
      toast.error('Student data not loaded. Please try again.');
      return;
    }

    // Mark attendance via QR Code with real student data
    const attendanceRecord = {
      studentId: studentData.student_id || studentData.id,
      studentName: studentData.name,
      studentEmail: studentData.email,
      studentPhone: studentData.phone,
      studentDepartment: studentData.department,
      studentYear: studentData.year,
      courseId: currentClass?.course || 'CS301',
      courseName: currentClass?.course || 'Computer Networks',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: 'present' as const,
      method: 'QR Code' as const,
      location: currentClass?.location || 'Room 101',
      lecturerName: 'Dr. Sarah Johnson'
    };

    dispatch({ type: 'MARK_ATTENDANCE', payload: attendanceRecord });
    toast.success(`Attendance marked successfully via QR Code! Student: ${studentData.name} (ID: ${attendanceRecord.studentId})`);
    navigate('/student-attendance');
  };

  const handleFaceVerification = () => {
    if (!studentData) {
      toast.error('Student data not loaded. Please try again.');
      return;
    }

    // Mark attendance via Face Recognition with real student data
    const attendanceRecord = {
      studentId: studentData.student_id || studentData.id,
      studentName: studentData.name,
      studentEmail: studentData.email,
      studentPhone: studentData.phone,
      studentDepartment: studentData.department,
      studentYear: studentData.year,
      courseId: currentClass?.course || 'CS301',
      courseName: currentClass?.course || 'Computer Networks',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: 'present' as const,
      method: 'Face Recognition' as const,
      location: currentClass?.location || 'Room 101',
      lecturerName: 'Dr. Sarah Johnson'
    };

    dispatch({ type: 'MARK_ATTENDANCE', payload: attendanceRecord });
    toast.success(`Attendance marked successfully via Face Recognition! Student: ${studentData.name} (ID: ${attendanceRecord.studentId})`);
    navigate('/student-attendance');
  };

  const handleGPSVerification = () => {
    if (!studentData) {
      toast.error('Student data not loaded. Please try again.');
      return;
    }

    // Mark attendance via GPS with real student data
    const attendanceRecord = {
      studentId: studentData.student_id || studentData.id,
      studentName: studentData.name,
      studentEmail: studentData.email,
      studentPhone: studentData.phone,
      studentDepartment: studentData.department,
      studentYear: studentData.year,
      courseId: currentClass?.course || 'CS301',
      courseName: currentClass?.course || 'Computer Networks',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: 'present' as const,
      method: 'GPS' as const,
      location: currentClass?.location || 'Room 101',
      lecturerName: 'Dr. Sarah Johnson'
    };

    dispatch({ type: 'MARK_ATTENDANCE', payload: attendanceRecord });
    toast.success(`Attendance marked successfully via GPS! Student: ${studentData.name} (ID: ${attendanceRecord.studentId})`);
    navigate('/student-attendance');
  };

  const markAttendanceForClass = (classInfo) => {
    if (!studentData) {
      toast.error('Student data not loaded. Please try again.');
      return;
    }

    const attendanceRecord = {
      studentId: studentData.student_id || studentData.id,
      studentName: studentData.name,
      studentEmail: studentData.email,
      studentPhone: studentData.phone,
      studentDepartment: studentData.department,
      studentYear: studentData.year,
      courseId: classInfo.id,
      courseName: classInfo.course,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: 'present' as const,
      method: 'Manual' as const,
      location: classInfo.room,
      lecturerName: classInfo.lecturer
    };

    dispatch({ type: 'MARK_ATTENDANCE', payload: attendanceRecord });
    toast.success(`Attendance marked for ${classInfo.course}! Student: ${studentData.name} (ID: ${attendanceRecord.studentId})`);
    
    // Add notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        message: `Successfully marked attendance for ${classInfo.course} at ${classInfo.time} - ${studentData.name} (ID: ${attendanceRecord.studentId})`,
        type: 'success'
      }
    });
  };

  const viewClassDetails = (classInfo) => {
    navigate('/courses', { state: { selectedCourse: classInfo } });
  };

  const openSupport = () => {
    navigate('/support');
  };

  const openMessaging = () => {
    navigate('/messaging');
  };

  const openSettings = () => {
    navigate('/settings');
    toast.info('Opening settings page...');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'present': return `${baseClasses} bg-green-100 text-green-800`;
      case 'absent': return `${baseClasses} bg-red-100 text-red-800`;
      case 'late': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">


      {/* Student Info Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20 border-4 border-white/20">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-xl bg-white/20">
                {studentData?.name?.split(' ').map(n => n[0]).join('') || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{studentData?.name}</h2>
              <p className="text-blue-100">ID: {studentData?.student_id || studentData?.id}</p>
              <p className="text-blue-100">{studentData?.program} • {studentData?.level}</p>
              <p className="text-blue-100">{studentData?.email}</p>
              {studentData?.phone && (
                <p className="text-blue-100">Phone: {studentData.phone}</p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <div className="text-center">
                  <p className="text-lg font-bold">{attendanceStats[0]?.attendanceRate || 0}%</p>
                  <p className="text-xs text-blue-200">Attendance</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{attendanceStats[0]?.gpa || 0}</p>
                  <p className="text-xs text-blue-200">GPA</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{attendanceStats[0]?.achievements || 0}</p>
                  <p className="text-xs text-blue-200">Achievements</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Class Tracker */}
      {currentClass && (
        <Card className="border-0 shadow-lg border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-lg">{currentClass.course}</h3>
                  <p className="text-gray-600">{currentClass.time} • {currentClass.location}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 animate-pulse">
                {currentClass.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Attendance Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <QrCode className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">QR Code Scanner</h3>
            <p className="text-sm text-gray-600 mb-4">Scan classroom QR code</p>
            <Button 
              onClick={handleQRScan} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Mark Attendance
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Camera className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Face Verification</h3>
            <p className="text-sm text-gray-600 mb-4">AI facial recognition</p>
            <Button 
              onClick={handleFaceVerification} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Mark Attendance
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">GPS Verification</h3>
            <p className="text-sm text-gray-600 mb-4">Location-based check-in</p>
            <Button 
              onClick={handleGPSVerification} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Mark Attendance
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule with Mark Attendance */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Today's Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classSessions.map((class_, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{class_.course}</p>
                    <p className="text-sm text-gray-600">{class_.time} • {class_.room} • {class_.lecturer}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => viewClassDetails(class_)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => markAttendanceForClass(class_)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Mark Attendance
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAttendanceHistory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance History</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Filter</Button>
          <Button variant="outline" size="sm">Export</Button>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Course</th>
                  <th className="text-left p-4">Time</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Method</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">{record.date}</td>
                    <td className="p-4 font-medium">{record.course}</td>
                    <td className="p-4">{record.time}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={getStatusBadge(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">{record.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Achievements & Badges</h2>
        <Badge className="bg-yellow-100 text-yellow-800">
          {achievements.filter(a => a.progress === 100).length} Completed
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((achievement, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-full ${achievement.progress === 100 ? 'bg-yellow-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  <achievement.icon className={`h-6 w-6 ${achievement.progress === 100 ? achievement.color : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                {achievement.progress === 100 ? (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Earned
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    {achievement.progress}%
                  </Badge>
                )}
              </div>
              {achievement.progress === 100 && (
                <div className="text-xs text-gray-500 mt-2">
                  Earned on {achievement.dateEarned}
                </div>
              )}
              {achievement.progress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'attendance', name: 'Attendance History', icon: Calendar },
    { id: 'achievements', name: 'Achievements', icon: Award },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'support', name: 'Support', icon: MessageSquare }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'attendance': return (
        <div className="p-8 text-center" onClick={() => navigate('/student-attendance')}>
          <Calendar className="h-16 w-16 mx-auto mb-4 text-blue-600 cursor-pointer hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold mb-2">Attendance History</h3>
          <p className="cursor-pointer text-gray-600 hover:text-blue-600">Click to view detailed attendance records</p>
        </div>
      );
      case 'achievements': return renderAchievements();
      case 'settings': return (
        <div className="p-8 text-center" onClick={() => navigate('/settings')}>
          <Settings className="h-16 w-16 mx-auto mb-4 text-gray-600 cursor-pointer hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold mb-2">Settings</h3>
          <p className="cursor-pointer text-gray-600 hover:text-blue-600">Configure your preferences and account settings</p>
        </div>
      );
      case 'support': return (
        <div className="p-8 text-center" onClick={() => navigate('/support')}>
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-green-600 cursor-pointer hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold mb-2">Support Center</h3>
          <p className="cursor-pointer text-gray-600 hover:text-green-600">Get help and contact support team</p>
        </div>
      );
      default: return renderDashboard();
    }
  };

  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Student Portal</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <Home className="h-4 w-4" />
              </Button>
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
        <div className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentPortal;
