import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Users, Camera, MapPin, FileText, MessageSquare, 
  Bot, Settings, AlertTriangle, Play, Pause, Download,
  Mail, Phone, Eye, Filter, Search, Calendar, Clock,
  TrendingUp, TrendingDown, BarChart3, PieChart, Home, LogOut, User,
  CheckCircle, XCircle, Star, Edit, Save, Trash2, Copy, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '@/hooks/useAttendanceStore';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode';

// Student ID range: 10900000 to 29999999
const generateStudentId = () => {
  return Math.floor(Math.random() * (29999999 - 10900000 + 1)) + 10900000;
};

const LecturerPortal = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAttendance();
  const [activeSession, setActiveSession] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [totalStudents] = useState(65);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [gpsHeatmap, setGpsHeatmap] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);
  const [myStudents, setMyStudents] = useState([]);
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [classSessions, setClassSessions] = useState([]);
  const [editingScores, setEditingScores] = useState({});
  const [studentScores, setStudentScores] = useState({});

  // Modern QR Generator State
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [selectedCourse, setSelectedCourse] = useState({
    id: 'CS301',
    name: 'Computer Networks',
    room: 'Room 101',
    time: '9:00 AM - 11:00 AM',
    lecturer: 'Dr. Sarah Johnson'
  });
  const qrCanvasRef = useRef(null);

  // Available courses for the lecturer
  const availableCourses = [
    { id: 'CS301', name: 'Computer Networks', room: 'Room 101', time: '9:00 AM - 11:00 AM', lecturer: 'Dr. Sarah Johnson' },
    { id: 'CS401', name: 'Database Systems', room: 'Room 203', time: '11:00 AM - 1:00 PM', lecturer: 'Dr. Sarah Johnson' },
    { id: 'CS501', name: 'Software Engineering', room: 'Lab 1', time: '2:00 PM - 4:00 PM', lecturer: 'Dr. Sarah Johnson' },
    { id: 'CS601', name: 'Machine Learning', room: 'Room 305', time: '4:00 PM - 6:00 PM', lecturer: 'Dr. Sarah Johnson' }
  ];

  // Fetch real students from database
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get current lecturer
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('No authenticated user found');
          return;
        }

        // Fetch courses taught by this lecturer
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('lecturer_id', user.id);

        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
          return;
        }

        if (!courses || courses.length === 0) {
          console.log('No courses found for this lecturer');
          return;
        }

        // Fetch enrollments for these courses
        const courseIds = courses.map(c => c.id);
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('course_enrollments')
          .select('*')
          .in('course_id', courseIds);

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
          return;
        }

        // Fetch student profiles
        const studentIds = (enrollments || []).map(e => e.student_id);
        if (studentIds.length === 0) {
          console.log('No enrolled students found');
          return;
        }

        const { data: students, error: studentsError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', studentIds)
          .eq('role', 'student');

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          return;
        }

        // Transform student data to match the expected format
        const transformedStudents = (students || []).map(student => ({
          id: student.id,
          name: student.full_name,
          email: student.email,
          department: student.department || 'Undefined',
          year: student.year_of_study || 1,
          isPresent: false,
          lastAttendance: null,
          attendanceRate: Math.floor(Math.random() * 30) + 70, // Random for demo, should be calculated from real data
          grade: ['A', 'A+', 'B+', 'B', 'C+', 'C'][Math.floor(Math.random() * 6)],
          status: Math.random() > 0.8 ? 'at-risk' : 'active',
          score: 0
        }));

        setMyStudents(transformedStudents);
        setStudentScores(transformedStudents.reduce((acc, student) => {
        acc[student.id] = student.score;
        return acc;
      }, {}));
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchLecturerData = async () => {
      setLoading(true);
      setError('');
      try {
        // Get current user (lecturer)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw userError || new Error('No user');
        // Fetch courses taught by this lecturer
        const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*').eq('lecturer_id', user.id);
        if (coursesError) throw coursesError;
        setCourses(coursesData || []);
        // Fetch class sessions for these courses
        const courseIds = (coursesData || []).map(c => c.id);
        const { data: sessionsData, error: sessionsError } = await supabase.from('class_sessions').select('*').in('course_id', courseIds);
        if (sessionsError) throw sessionsError;
        setClassSessions(sessionsData || []);
        // Fetch enrollments for these courses
        const { data: enrollments, error: enrollmentsError } = await supabase.from('course_enrollments').select('*').in('course_id', courseIds);
        if (enrollmentsError) throw enrollmentsError;
        // Fetch student profiles
        const studentIds = (enrollments || []).map(e => e.student_id);
        const { data: students, error: studentsError } = await supabase.from('profiles').select('*').in('id', studentIds);
        if (studentsError) throw studentsError;
        // Fetch attendance records for these courses
        const { data: attendance, error: attendanceError } = await supabase.from('attendance_records').select('*').in('session_id', (sessionsData || []).map(s => s.id));
        if (attendanceError) throw attendanceError;
        setAttendanceRecords(attendance || []);
      } catch (err) {
        setError('Failed to load lecturer data.');
        toast.error('Failed to load lecturer data from backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchLecturerData();
  }, []);

  // Generate attendance trends data based on real attendance records
  useEffect(() => {
    const generateTrendsFromRealData = () => {
      const trends = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        // Get attendance records for this specific date
        const dayRecords = state.attendanceRecords.filter(record => 
          record.date === dateString
        );
        
        const totalStudents = myStudents.length || 1;
        const attendanceCount = dayRecords.length;
        const percentage = Math.round((attendanceCount / totalStudents) * 100);
        
        // Calculate average score for this day
        const scoredRecords = dayRecords.filter(record => record.score !== undefined);
        const averageScore = scoredRecords.length > 0 
          ? Math.round(scoredRecords.reduce((sum, record) => sum + (record.score || 0), 0) / scoredRecords.length)
          : 0;
        
        trends.push({
          date: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          }),
          attendance: attendanceCount,
          percentage: percentage,
          totalStudents: totalStudents,
          records: dayRecords,
          averageScore: averageScore,
          scoredCount: scoredRecords.length
        });
      }
      
      setAttendanceTrends(trends);
    };

    generateTrendsFromRealData();
  }, [state.attendanceRecords, myStudents]);

  // Calculate performance distribution based on real student data
  useEffect(() => {
    const calculatePerformance = () => {
      const gradeRanges = [
        { grade: 'A', min: 90, max: 100, color: 'bg-green-500' },
        { grade: 'B', min: 80, max: 89, color: 'bg-blue-500' },
        { grade: 'C', min: 70, max: 79, color: 'bg-yellow-500' },
        { grade: 'D', min: 60, max: 69, color: 'bg-orange-500' },
        { grade: 'F', min: 0, max: 59, color: 'bg-red-500' }
      ];

      const performance = gradeRanges.map(range => {
        const count = myStudents.filter(student => 
          student.attendanceRate >= range.min && student.attendanceRate <= range.max
        ).length;
        
        return {
          grade: range.grade,
          count: count,
          color: range.color,
          percentage: myStudents.length > 0 ? Math.round((count / myStudents.length) * 100) : 0
        };
      });

      setPerformanceData(performance);
    };

    calculatePerformance();
  }, [myStudents]);

  // Listen to attendance state changes and update students with real data
  useEffect(() => {
    const currentAttendance = state.attendanceRecords.filter(record => 
      record.date === new Date().toISOString().split('T')[0]
    );
    setAttendanceCount(currentAttendance.length);

    // Update students based on attendance records with real student data
    setMyStudents(prev => {
      const updatedStudents = [...prev];
      
      currentAttendance.forEach(attendanceRecord => {
        // Check if student already exists in the list
        const existingStudentIndex = updatedStudents.findIndex(student => 
          student.id === attendanceRecord.studentId || 
          student.name === attendanceRecord.studentName
        );

        if (existingStudentIndex >= 0) {
          // Update existing student
          updatedStudents[existingStudentIndex] = {
            ...updatedStudents[existingStudentIndex],
            isPresent: true,
            lastAttendance: attendanceRecord.time,
            attendanceRate: Math.min(100, updatedStudents[existingStudentIndex].attendanceRate + 5)
          };
        } else {
          // Add new student with real data from attendance record
          const newStudent = {
            id: attendanceRecord.studentId,
            name: attendanceRecord.studentName,
            email: attendanceRecord.studentEmail || 'student@ug.edu.gh',
            department: attendanceRecord.studentDepartment || 'Computer Science',
            year: attendanceRecord.studentYear || 3,
            isPresent: true,
            lastAttendance: attendanceRecord.time,
            attendanceRate: 85,
            grade: 'A',
            status: 'active',
            score: 0,
            phone: attendanceRecord.studentPhone || '+233 24 123 4567',
            address: 'Accra, Ghana'
          };
          updatedStudents.push(newStudent);
        }
      });

      return updatedStudents;
    });
  }, [state.attendanceRecords]);

  // Simulate real-time data updates when session is active
  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(() => {
        // Update student attendance dynamically
        setMyStudents(prev => prev.map(student => {
          if (Math.random() > 0.7 && !student.isPresent) {
            const newAttendance = new Date().toLocaleTimeString();
            dispatch({
              type: 'ADD_NOTIFICATION',
              payload: {
                message: `${student.name} (ID: ${student.id}) has marked attendance at ${newAttendance}`,
                type: 'success'
              }
            });
            return {
              ...student,
              isPresent: true,
              lastAttendance: newAttendance
            };
          }
          return student;
        }));
        
        // Simulate face detection logs
        if (Math.random() > 0.6) {
          const students = ['Kwame Asante', 'Ama Osei', 'Kojo Mensah', 'Akosua Adjei'];
          const newFace = {
            id: Date.now(),
            studentId: generateStudentId().toString(),
            studentName: students[Math.floor(Math.random() * students.length)],
            confidence: (85 + Math.random() * 15).toFixed(1),
            timestamp: new Date().toLocaleTimeString(),
            status: Math.random() > 0.1 ? 'verified' : 'flagged'
          };
          setDetectedFaces(prev => [newFace, ...prev.slice(0, 9)]);
        }

        // Simulate GPS data
        if (Math.random() > 0.7) {
          const newGpsPoint = {
            lat: 5.6507 + (Math.random() - 0.5) * 0.001,
            lng: -0.1864 + (Math.random() - 0.5) * 0.001,
            studentId: generateStudentId().toString(),
            accuracy: Math.floor(Math.random() * 10) + 5,
            timestamp: new Date().toLocaleTimeString()
          };
          setGpsHeatmap(prev => [newGpsPoint, ...prev.slice(0, 19)]);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activeSession, dispatch]);

  const generateQRCode = async () => {
    try {
      // Create unique session ID
      const sessionId = `${selectedCourse.id}_${Date.now()}`;
      
      // Create QR data payload
      const qrPayload = {
        sessionId: sessionId,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        room: selectedCourse.room,
        lecturer: selectedCourse.lecturer,
        timestamp: new Date().toISOString(),
        validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // Valid for 2 hours
      };

      const qrDataString = JSON.stringify(qrPayload);
      setQrCodeData(qrDataString);

      // Generate QR code image
      const qrCodeURL = await QRCode.toDataURL(qrDataString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      setGeneratedQR(qrCodeURL);
      setShowQRGenerator(true);
      
      // Legacy support - keep old system working
      setQrCode(sessionId);
      setActiveSession(true);
      
      // Start session in attendance store
      dispatch({
        type: 'START_SESSION',
        payload: {
          courseId: selectedCourse.id,
          courseName: selectedCourse.name,
          qrCode: sessionId
        }
      });
      
      toast.success('QR Code generated successfully!');
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code. Please try again.');
    }
  };

  const downloadQR = () => {
    if (!generatedQR) return;
    
    const link = document.createElement('a');
    link.download = `${selectedCourse.id}_${selectedCourse.name.replace(/\s+/g, '_')}_QR.png`;
    link.href = generatedQR;
    link.click();
    toast.success('QR Code downloaded!');
  };

  const copyQRData = () => {
    if (!qrCodeData) return;
    
    navigator.clipboard.writeText(qrCodeData).then(() => {
      toast.success('QR data copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy QR data');
    });
  };

  const regenerateQR = () => {
    generateQRCode();
  };

  const endSession = () => {
    setActiveSession(false);
    setQrCode('');
    
    // End session in store
    dispatch({ type: 'END_SESSION' });
    
    toast.info('Session ended successfully.');
  };

  // Score management functions
  const startEditingScore = (studentId) => {
    setEditingScores(prev => ({ ...prev, [studentId]: true }));
  };

  const saveScore = (studentId) => {
    const score = studentScores[studentId];
    const student = myStudents.find(s => s.id === studentId);
    
    if (score >= 0 && score <= 100 && student) {
      // Update local state
      setEditingScores(prev => ({ ...prev, [studentId]: false }));
      
      // Update student's score in the list
      setMyStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, score: score } : s
      ));
      
      // Record score in attendance store for trends tracking
      const today = new Date().toISOString().split('T')[0];
      dispatch({
        type: 'SCORE_STUDENT',
        payload: {
          studentId: studentId,
          score: score,
          scoredBy: 'Dr. Sarah Johnson', // This should come from actual lecturer data
          date: today
        }
      });
      
      // Add notification about scoring
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          message: `Scored ${student.name} (${studentId}) with ${score} marks`,
          type: 'success'
        }
      });
      
      toast.success(`Score ${score} saved for ${student.name}`);
    } else {
      toast.error('Score must be between 0 and 100');
    }
  };

  const updateScore = (studentId, newScore) => {
    setStudentScores(prev => ({ ...prev, [studentId]: parseInt(newScore) || 0 }));
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Calculate attendance statistics
  const presentStudents = myStudents.filter(s => s.isPresent).length;
  const attendanceRate = myStudents.length > 0 ? Math.round((presentStudents / myStudents.length) * 100) : 0;

  const exportToPDF = async () => {
    try {
      // Get current lecturer
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error('Authentication required for export.');
        return;
      }

      // Fetch lecturer profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        toast.error('Failed to load lecturer profile.');
        return;
      }

      // Create comprehensive PDF content with real data
      const currentDate = new Date();
    const attendanceData = {
        reportTitle: 'Class Attendance Report',
        course: courses.length > 0 ? `${courses[0].name} - ${courses[0].code}` : 'Course Information',
        date: currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: currentDate.toLocaleTimeString(),
        lecturer: profile.full_name,
      sessionInfo: {
      totalStudents: myStudents.length,
      presentStudents: presentStudents,
        absentStudents: myStudents.length - presentStudents,
      attendanceRate: attendanceRate,
        sessionDuration: activeSession ? 'Active' : 'Not Started',
        sessionId: qrCode || 'N/A'
      },
      scoringInfo: {
      scoredStudents: myStudents.filter(s => studentScores[s.id] > 0).length,
        unscoredStudents: myStudents.filter(s => studentScores[s.id] === 0).length,
      averageScore: myStudents.filter(s => studentScores[s.id] > 0).length > 0 
        ? Math.round(myStudents.filter(s => studentScores[s.id] > 0)
            .reduce((sum, s) => sum + studentScores[s.id], 0) / 
            myStudents.filter(s => studentScores[s.id] > 0).length)
        : 0,
        highPerformers: myStudents.filter(s => studentScores[s.id] >= 80).length,
        needsImprovement: myStudents.filter(s => studentScores[s.id] > 0 && studentScores[s.id] < 60).length
      },
      trends: {
        weeklyAverage: Math.round(attendanceTrends.reduce((sum, t) => sum + t.percentage, 0) / 7),
        goodDays: attendanceTrends.filter(t => t.percentage >= 80).length,
        totalScored: attendanceTrends.reduce((sum, t) => sum + t.scoredCount, 0),
        averageScore: Math.round(attendanceTrends.reduce((sum, t) => sum + t.averageScore, 0) / Math.max(1, attendanceTrends.filter(t => t.averageScore > 0).length))
      },
      students: myStudents.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        status: student.isPresent ? 'Present' : 'Absent',
        attendanceTime: student.lastAttendance || 'N/A',
        attendanceRate: `${student.attendanceRate}%`,
        grade: student.grade,
        score: studentScores[student.id] || 0,
        scoreStatus: studentScores[student.id] > 0 ? 'Scored' : 'Not Scored',
        scoreDate: studentScores[student.id] > 0 ? currentDate.toLocaleDateString() : 'N/A',
        riskStatus: student.status === 'at-risk' ? 'At Risk' : 'Normal'
      })),
      performanceDistribution: performanceData,
      attendanceTrends: attendanceTrends.slice(-7) // Last 7 days
    };

    // Enhanced PDF export with detailed formatting
    const pdfContent = `
      ${attendanceData.reportTitle}
      ======================================
      
      Course: ${attendanceData.course}
      Date: ${attendanceData.date}
      Time: ${attendanceData.time}
      Lecturer: ${attendanceData.lecturer}
      
      SESSION SUMMARY
      ===============
      Total Students: ${attendanceData.sessionInfo.totalStudents}
      Present: ${attendanceData.sessionInfo.presentStudents}
      Absent: ${attendanceData.sessionInfo.absentStudents}
      Attendance Rate: ${attendanceData.sessionInfo.attendanceRate}%
      Session Status: ${attendanceData.sessionInfo.sessionDuration}
      Session ID: ${attendanceData.sessionInfo.sessionId}
      
      SCORING SUMMARY
      ===============
      Students Scored: ${attendanceData.scoringInfo.scoredStudents}
      Students Not Scored: ${attendanceData.scoringInfo.unscoredStudents}
      Average Score: ${attendanceData.scoringInfo.averageScore}%
      High Performers (80%+): ${attendanceData.scoringInfo.highPerformers}
      Needs Improvement (<60%): ${attendanceData.scoringInfo.needsImprovement}
      
      WEEKLY TRENDS
      =============
      Weekly Average Attendance: ${attendanceData.trends.weeklyAverage}%
      Good Attendance Days: ${attendanceData.trends.goodDays}
      Total Students Scored: ${attendanceData.trends.totalScored}
      Average Score: ${attendanceData.trends.averageScore}%
      
      STUDENT DETAILS
      ===============
      ${attendanceData.students.map(student => `
        ID: ${student.id}
        Name: ${student.name}
        Email: ${student.email}
        Department: ${student.department}
        Year: ${student.year}
        Status: ${student.status}
        Attendance Time: ${student.attendanceTime}
        Attendance Rate: ${student.attendanceRate}
        Grade: ${student.grade}
        Score: ${student.score}/100
        Score Status: ${student.scoreStatus}
        Risk Status: ${student.riskStatus}
        ----------------------------------------
      `).join('')}
      
      PERFORMANCE DISTRIBUTION
      =======================
      ${attendanceData.performanceDistribution.map(grade => `
        Grade ${grade.grade}: ${grade.count} students (${grade.percentage}%)
      `).join('')}
      
      ATTENDANCE TRENDS (Last 7 Days)
      ===============================
      ${attendanceData.attendanceTrends.map(trend => `
        ${trend.date}: ${trend.percentage}% (${trend.attendance}/${trend.totalStudents})
        Average Score: ${trend.averageScore}%
        Students Scored: ${trend.scoredCount}
      `).join('')}
    `;

    // Create downloadable PDF content
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-report-${currentDate.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

      console.log('Exporting Enhanced PDF:', attendanceData);
      toast.success('Comprehensive PDF report exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF report.');
    }
  };

  const exportToExcel = async () => {
    try {
      // Get current lecturer
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error('Authentication required for export.');
        return;
      }

      // Fetch lecturer profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        toast.error('Failed to load lecturer profile.');
        return;
      }

      const currentDate = new Date();
      const excelData = {
        summary: {
          'Report Date': currentDate.toLocaleDateString(),
          'Report Time': currentDate.toLocaleTimeString(),
          'Course': courses.length > 0 ? `${courses[0].name} - ${courses[0].code}` : 'Course Information',
          'Lecturer': profile.full_name,
        'Total Students': myStudents.length,
        'Present Students': presentStudents,
        'Absent Students': myStudents.length - presentStudents,
        'Attendance Rate': `${attendanceRate}%`,
        'Session Status': activeSession ? 'Active' : 'Not Started',
        'Session ID': qrCode || 'N/A'
      },
      students: myStudents.map(student => ({
      'Student ID': student.id,
      'Name': student.name,
      'Email': student.email,
        'Department': student.department,
        'Year': student.year,
      'Status': student.isPresent ? 'Present' : 'Absent',
      'Attendance Time': student.lastAttendance || 'N/A',
      'Attendance Rate': `${student.attendanceRate}%`,
      'Grade': student.grade,
      'Score': studentScores[student.id] || 0,
      'Score Status': studentScores[student.id] > 0 ? 'Scored' : 'Not Scored',
        'Score Date': studentScores[student.id] > 0 ? currentDate.toLocaleDateString() : 'N/A',
        'Risk Status': student.status === 'at-risk' ? 'At Risk' : 'Normal',
        'Last Attendance': student.lastAttendance || 'N/A'
      })),
      trends: attendanceTrends.map(trend => ({
        'Date': trend.date,
        'Attendance Count': trend.attendance,
        'Total Students': trend.totalStudents,
        'Attendance Percentage': `${trend.percentage}%`,
        'Average Score': `${trend.averageScore}%`,
        'Students Scored': trend.scoredCount,
        'Status': trend.percentage >= 90 ? 'Excellent' :
                 trend.percentage >= 80 ? 'Good' :
                 trend.percentage >= 70 ? 'Fair' :
                 trend.percentage >= 60 ? 'Poor' : 'Critical'
      })),
      performance: performanceData.map(grade => ({
        'Grade': grade.grade,
        'Student Count': grade.count,
        'Percentage': `${grade.percentage}%`,
        'Range': grade.grade === 'A' ? '90-100%' :
                grade.grade === 'B' ? '80-89%' :
                grade.grade === 'C' ? '70-79%' :
                grade.grade === 'D' ? '60-69%' : '0-59%'
      }))
    };

    // Create CSV content for Excel
    const createCSV = (data, sheetName) => {
      if (!data || data.length === 0) return '';
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');
      
      return `\n${sheetName}\n${csvContent}\n`;
    };

    const csvContent = 
      createCSV([excelData.summary], 'Summary') +
      createCSV(excelData.students, 'Student Details') +
      createCSV(excelData.trends, 'Attendance Trends') +
      createCSV(excelData.performance, 'Performance Distribution');

    // Create downloadable CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-report-${currentDate.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

      console.log('Exporting Enhanced Excel/CSV:', excelData);
      toast.success('Comprehensive Excel/CSV report exported successfully!');
    } catch (error) {
      console.error('Error exporting Excel/CSV:', error);
      toast.error('Failed to export Excel/CSV report.');
    }
  };

  const exportToJSON = async () => {
    try {
      // Get current lecturer
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error('Authentication required for export.');
        return;
      }

      // Fetch lecturer profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        toast.error('Failed to load lecturer profile.');
        return;
      }

      const currentDate = new Date();
      const jsonData = {
        metadata: {
          reportType: 'Class Attendance Report',
          generatedAt: currentDate.toISOString(),
          course: courses.length > 0 ? `${courses[0].name} - ${courses[0].code}` : 'Course Information',
          lecturer: profile.full_name,
        sessionInfo: {
          active: activeSession,
          sessionId: qrCode,
          totalStudents: myStudents.length,
          presentStudents: presentStudents,
          attendanceRate: attendanceRate
        }
      },
      data: {
        students: myStudents.map(student => ({
          id: student.id,
          name: student.name,
          email: student.email,
          department: student.department,
          year: student.year,
          isPresent: student.isPresent,
          lastAttendance: student.lastAttendance,
          attendanceRate: student.attendanceRate,
          grade: student.grade,
          score: studentScores[student.id] || 0,
          status: student.status
        })),
        trends: attendanceTrends,
        performance: performanceData,
        analytics: {
          weeklyAverage: Math.round(attendanceTrends.reduce((sum, t) => sum + t.percentage, 0) / 7),
          averageScore: myStudents.filter(s => studentScores[s.id] > 0).length > 0 
            ? Math.round(myStudents.filter(s => studentScores[s.id] > 0)
                .reduce((sum, s) => sum + studentScores[s.id], 0) / 
                myStudents.filter(s => studentScores[s.id] > 0).length)
            : 0,
          highPerformers: myStudents.filter(s => studentScores[s.id] >= 80).length,
          atRiskStudents: myStudents.filter(s => s.status === 'at-risk').length
        }
      }
    };

    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-data-${currentDate.toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

      console.log('Exporting JSON data:', jsonData);
      toast.success('JSON data exported successfully!');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast.error('Failed to export JSON data.');
    }
  };

  const showExportPreview = () => {
    const previewData = {
      students: myStudents.length,
      present: presentStudents,
      absent: myStudents.length - presentStudents,
      attendanceRate: attendanceRate,
      scored: myStudents.filter(s => studentScores[s.id] > 0).length,
      trends: attendanceTrends.length,
      performance: performanceData.length,
      averageScore: myStudents.filter(s => studentScores[s.id] > 0).length > 0 
        ? Math.round(myStudents.filter(s => studentScores[s.id] > 0)
            .reduce((sum, s) => sum + studentScores[s.id], 0) / 
            myStudents.filter(s => studentScores[s.id] > 0).length)
        : 0
    };

    toast.info(`Export Preview: ${previewData.students} students, ${previewData.attendanceRate}% attendance, ${previewData.scored} scored, ${previewData.averageScore}% avg score`, {
      duration: 4000
    });
  };

  const messageStudent = (studentId, studentName) => {
    toast.info(`Opening chat with ${studentName}`);
    navigate('/lecturer-chat', { state: { studentId, studentName } });
  };

  const viewStudentDetails = (studentId) => {
    const student = myStudents.find(s => s.id === studentId);
    if (student) {
      toast.info(`Viewing details for ${student.name}`);
      // Navigate to student details page
      navigate('/student-profile', { state: { student } });
    }
  };

  // Logout logic
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lecturer Command Center</h1>
              <p className="text-gray-600">Advanced Class Management & Analytics Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={`px-4 py-2 ${activeSession ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {activeSession ? 'Session Active' : 'No Active Session'}
              </Badge>
              <Button variant="outline" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              {/* User Menu */}
              <div className="relative group">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </Button>
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50">
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Live Attendance</p>
                  <p className="text-3xl font-bold">{presentStudents}/{myStudents.length}</p>
                  <p className="text-sm text-blue-200">{attendanceRate}% Present</p>
                </div>
                <Users className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Face Detections</p>
                  <p className="text-3xl font-bold">{detectedFaces.length}</p>
                  <p className="text-sm text-green-200">Recent verifications</p>
                </div>
                <Camera className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">GPS Locations</p>
                  <p className="text-3xl font-bold">{gpsHeatmap.length}</p>
                  <p className="text-sm text-purple-200">Active tracking</p>
                </div>
                <MapPin className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Risk Alerts</p>
                  <p className="text-3xl font-bold">{myStudents.filter(s => s.status === 'at-risk').length}</p>
                  <p className="text-sm text-red-200">Need attention</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Control Panel and Student List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                <span>Class Session Control</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Computer Networks - CS 301</h3>
                    <p className="text-gray-600">Room 101 • {new Date().toLocaleTimeString()}</p>
                  </div>
                  <Badge className={activeSession ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {activeSession ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {activeSession && qrCode && (
                  <div className="bg-white rounded-lg p-6 mb-4 text-center">
                    <div className="w-32 h-32 bg-black mx-auto mb-4 flex items-center justify-center text-white font-mono text-xs">
                      QR: {qrCode.slice(-8)}
                    </div>
                    <p className="text-sm text-gray-600">Session ID: {qrCode}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Students Present</p>
                    <p className="text-2xl font-bold text-green-600">{presentStudents}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!activeSession ? (
                    <Button onClick={generateQRCode} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Start Session & Generate QR
                    </Button>
                  ) : (
                    <Button onClick={endSession} variant="destructive">
                      <Pause className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => navigate('/attendance-viewer')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Live Viewer
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/gps-heatmap')}>
                    <MapPin className="h-4 w-4 mr-2" />
                    GPS Heatmap
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Students List with Scoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>My Students ({myStudents.length})</span>
                <Badge className="bg-green-100 text-green-800">
                  {presentStudents} Present
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {myStudents.map((student) => (
                  <div key={student.id} className={`p-3 rounded-lg border ${
                    student.status === 'at-risk' ? 'bg-red-50 border-red-200' : 
                    student.isPresent ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{student.name}</h4>
                          {student.isPresent && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Present
                            </Badge>
                          )}
                          {!student.isPresent && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Absent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">ID: {student.id}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        {student.phone && (
                          <p className="text-sm text-gray-600">Phone: {student.phone}</p>
                        )}
                        <p className="text-sm text-gray-600">{student.department} • Year {student.year}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-green-600 font-medium">
                            {student.attendanceRate}% attendance
                          </span>
                          <span className="text-xs text-blue-600 font-medium">
                            Grade: {student.grade}
                          </span>
                          <span className={`text-xs font-medium ${getScoreColor(studentScores[student.id] || 0)}`}>
                            Score: {studentScores[student.id] || 0}/100
                            {studentScores[student.id] > 0 && (
                              <span className="ml-1 text-green-600">✓</span>
                            )}
                          </span>
                        </div>
                        {student.lastAttendance && (
                          <p className="text-xs text-purple-600 mt-1">
                            Last attended: {student.lastAttendance}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        {/* Score Editing */}
                        {editingScores[student.id] ? (
                          <div className="flex items-center space-x-1">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={studentScores[student.id] || 0}
                              onChange={(e) => updateScore(student.id, e.target.value)}
                              className="w-16 h-8 text-xs"
                            />
                            <Button 
                              size="sm" 
                              className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700"
                              onClick={() => saveScore(student.id)}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2 py-1"
                            onClick={() => startEditingScore(student.id)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Score
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 py-1"
                          onClick={() => viewStudentDetails(student.id)}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs px-2 py-1"
                          onClick={() => messageStudent(student.id, student.name)}
                        >
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export and Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Enhanced Export Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Export Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={exportToPDF} className="w-full text-sm bg-red-600 hover:bg-red-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export PDF Report
              </Button>
              <Button onClick={exportToExcel} className="w-full text-sm bg-green-600 hover:bg-green-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export Excel/CSV
              </Button>
              <Button onClick={exportToJSON} className="w-full text-sm bg-purple-600 hover:bg-purple-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export JSON Data
              </Button>
              <Button onClick={showExportPreview} className="w-full text-sm bg-gray-600 hover:bg-gray-700 text-white">
                <Eye className="h-4 w-4 mr-2" />
                Preview Export
              </Button>
              <div className="text-xs text-gray-500 mt-2">
                <p>• Comprehensive attendance data</p>
                <p>• Student performance metrics</p>
                <p>• Weekly trends & analytics</p>
                <p>• Multiple export formats</p>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="font-medium text-gray-700">Export Summary:</p>
                  <p>• {myStudents.length} students</p>
                  <p>• {attendanceTrends.length} days of trends</p>
                  <p>• {performanceData.length} performance grades</p>
                  <p>• {myStudents.filter(s => studentScores[s.id] > 0).length} scored students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messaging Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span>Communication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full text-sm">
                <Phone className="h-4 w-4 mr-2" />
                Bulk SMS ({myStudents.length} students)
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-sm" 
                onClick={() => navigate('/lecturer-chat')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Open Chat Center
              </Button>
              <div className="text-xs text-gray-500 mt-2">
                <p>• Send attendance notifications</p>
                <p>• Individual student messaging</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
                <p className="text-xs text-gray-600">Today's Attendance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {(myStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / myStudents.length).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">Average Attendance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {myStudents.filter(s => studentScores[s.id] > 0).length}
                </p>
                <p className="text-xs text-gray-600">Students Scored</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {myStudents.filter(s => studentScores[s.id] > 0).length > 0 
                    ? Math.round(myStudents.filter(s => studentScores[s.id] > 0)
                        .reduce((sum, s) => sum + studentScores[s.id], 0) / 
                        myStudents.filter(s => studentScores[s.id] > 0).length)
                    : 0}%
                </p>
                <p className="text-xs text-gray-600">Average Score</p>
              </div>
            </CardContent>
          </Card>

          {/* Session Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Settings className="h-4 w-4 text-indigo-600" />
                <span>Session Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full text-sm" onClick={() => navigate('/attendance-viewer')}>
                <Eye className="h-4 w-4 mr-2" />
                Live Viewer
              </Button>
              <Button variant="outline" className="w-full text-sm" onClick={() => navigate('/gps-heatmap')}>
                <MapPin className="h-4 w-4 mr-2" />
                GPS Heatmap
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Redesigned Attendance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Attendance Trends (Last 7 Days)</span>
                </div>
                <div className="text-sm text-gray-500">
                  {myStudents.length} Total Students
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceTrends.map((trend, index) => (
                  <div key={index} className="group relative">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all duration-200 cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">{trend.date}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-blue-600">{trend.percentage}%</span>
                            <span className="text-xs text-gray-500">({trend.attendance}/{trend.totalStudents})</span>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                trend.percentage >= 90 ? 'bg-green-500' :
                                trend.percentage >= 80 ? 'bg-blue-500' :
                                trend.percentage >= 70 ? 'bg-yellow-500' :
                                trend.percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${trend.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">
                              {trend.attendance} students present
                            </span>
                            {trend.scoredCount > 0 && (
                              <span className="text-xs text-purple-600 font-medium">
                                • {trend.scoredCount} scored
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {trend.averageScore > 0 && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                Avg: {trend.averageScore}%
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              trend.percentage >= 90 ? 'bg-green-100 text-green-700' :
                              trend.percentage >= 80 ? 'bg-blue-100 text-blue-700' :
                              trend.percentage >= 70 ? 'bg-yellow-100 text-yellow-700' :
                              trend.percentage >= 60 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {trend.percentage >= 90 ? 'Excellent' :
                               trend.percentage >= 80 ? 'Good' :
                               trend.percentage >= 70 ? 'Fair' :
                               trend.percentage >= 60 ? 'Poor' : 'Critical'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                                         {/* Hover tooltip with detailed info */}
                     <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                       <div className="text-sm">
                         <p className="font-semibold mb-2">Attendance Details for {trend.date}</p>
                         {trend.records.length > 0 ? (
                           <div className="space-y-2">
                             <div>
                               <p className="text-gray-600 font-medium">Students who attended:</p>
                               {trend.records.slice(0, 3).map((record, idx) => (
                                 <p key={idx} className="text-xs text-gray-500">
                                   • {record.studentName} ({record.studentId}) - {record.time}
                                   {record.score !== undefined && (
                                     <span className="text-purple-600 ml-2">Score: {record.score}%</span>
                                   )}
                                 </p>
                               ))}
                               {trend.records.length > 3 && (
                                 <p className="text-xs text-gray-400">
                                   +{trend.records.length - 3} more students
                                 </p>
                               )}
                             </div>
                             
                             {trend.scoredCount > 0 && (
                               <div className="pt-2 border-t border-gray-100">
                                 <p className="text-gray-600 font-medium">Scoring Summary:</p>
                                 <p className="text-xs text-gray-500">
                                   • {trend.scoredCount} students scored
                                   • Average score: {trend.averageScore}%
                                   • {trend.records.filter(r => r.score !== undefined && r.score >= 80).length} high performers (80%+)
                                 </p>
                               </div>
                             )}
                           </div>
                         ) : (
                           <p className="text-gray-500 text-xs">No attendance records for this date</p>
                         )}
                       </div>
                     </div>
                  </div>
                ))}
              </div>
              
              {/* Summary Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">
                      {Math.round(attendanceTrends.reduce((sum, t) => sum + t.percentage, 0) / 7)}%
                    </p>
                    <p className="text-xs text-gray-600">Weekly Average</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      {attendanceTrends.filter(t => t.percentage >= 80).length}
                    </p>
                    <p className="text-xs text-gray-600">Good Days</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">
                      {attendanceTrends.reduce((sum, t) => sum + t.scoredCount, 0)}
                    </p>
                    <p className="text-xs text-gray-600">Students Scored</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">
                      {Math.round(attendanceTrends.reduce((sum, t) => sum + t.averageScore, 0) / Math.max(1, attendanceTrends.filter(t => t.averageScore > 0).length))}%
                    </p>
                    <p className="text-xs text-gray-600">Avg Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Performance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  <span>Class Performance Distribution</span>
                </div>
                <div className="text-sm text-gray-500">
                  Based on Attendance Rate
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((grade, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${grade.color}`}></div>
                        <div>
                          <span className="font-semibold text-gray-800">Grade {grade.grade}</span>
                          <div className="text-xs text-gray-500">
                            {grade.grade === 'A' ? '90-100%' :
                             grade.grade === 'B' ? '80-89%' :
                             grade.grade === 'C' ? '70-79%' :
                             grade.grade === 'D' ? '60-69%' : '0-59%'} attendance
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-800">{grade.count}</div>
                          <div className="text-xs text-gray-600">{grade.percentage}% of class</div>
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${grade.color.replace('bg-', 'bg-')}`}
                            style={{ width: `${grade.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Show students in this grade range on hover */}
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <div className="text-sm">
                        <p className="font-semibold mb-2">Students with Grade {grade.grade}</p>
                        {myStudents.filter(student => {
                          const rate = student.attendanceRate;
                          return (grade.grade === 'A' && rate >= 90) ||
                                 (grade.grade === 'B' && rate >= 80 && rate < 90) ||
                                 (grade.grade === 'C' && rate >= 70 && rate < 80) ||
                                 (grade.grade === 'D' && rate >= 60 && rate < 70) ||
                                 (grade.grade === 'F' && rate < 60);
                        }).slice(0, 3).map((student, idx) => (
                          <p key={idx} className="text-xs text-gray-500">
                            • {student.name} ({student.id}) - {student.attendanceRate}%
                          </p>
                        ))}
                        {grade.count > 3 && (
                          <p className="text-xs text-gray-400">
                            +{grade.count - 3} more students
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Performance Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Class Performance Summary</p>
                  <div className="flex justify-center space-x-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        {performanceData.filter(g => g.grade === 'A' || g.grade === 'B').reduce((sum, g) => sum + g.count, 0)}
                      </p>
                      <p className="text-xs text-gray-600">High Performers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-600">
                        {performanceData.filter(g => g.grade === 'C').reduce((sum, g) => sum + g.count, 0)}
                      </p>
                      <p className="text-xs text-gray-600">Average</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">
                        {performanceData.filter(g => g.grade === 'D' || g.grade === 'F').reduce((sum, g) => sum + g.count, 0)}
                      </p>
                      <p className="text-xs text-gray-600">Need Attention</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern QR Code Generator Modal */}
        {showQRGenerator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">QR Code Generator</h2>
                    <p className="text-gray-600">Generate attendance QR code for your class</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowQRGenerator(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {/* Course Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Course
                  </label>
                  <div className="grid gap-3">
                    {availableCourses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedCourse.id === course.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-900">{course.name}</h3>
                            <p className="text-sm text-gray-600">{course.id} • {course.room}</p>
                            <p className="text-sm text-gray-500">{course.time}</p>
                          </div>
                          {selectedCourse.id === course.id && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code Display */}
                {generatedQR && (
                  <div className="mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
                      <div className="bg-white rounded-lg p-4 inline-block shadow-lg">
                        <img 
                          src={generatedQR} 
                          alt="QR Code" 
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedCourse.name} ({selectedCourse.id})
                        </h3>
                        <p className="text-gray-600">{selectedCourse.room} • {selectedCourse.time}</p>
                        <p className="text-sm text-gray-500">
                          Valid for 2 hours • Generated at {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={generateQRCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </Button>
                  
                  {generatedQR && (
                    <>
                      <Button 
                        onClick={downloadQR}
                        variant="outline"
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PNG
                      </Button>
                      
                      <Button 
                        onClick={copyQRData}
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Data
                      </Button>
                      
                      <Button 
                        onClick={regenerateQR}
                        variant="outline"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </>
                  )}
                </div>

                {/* QR Data Preview */}
                {qrCodeData && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code Data (JSON)
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(JSON.parse(qrCodeData), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📱 How to use:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Display the QR code on your screen or projector</li>
                    <li>• Students scan with their attendance app</li>
                    <li>• QR codes are valid for 2 hours from generation</li>
                    <li>• Each QR contains course info, room, and session details</li>
                    <li>• Download as PNG for offline use</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerPortal;
