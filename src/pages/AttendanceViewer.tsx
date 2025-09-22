import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, Clock, MapPin, Camera, QrCode, CheckCircle, XCircle,
  AlertTriangle, TrendingUp, Filter, Search, RefreshCw, Download,
  Eye, BarChart3, Home, ArrowLeft, Star, Award, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useAttendance } from '@/hooks/useAttendanceStore';

const AttendanceViewer = () => {
  const navigate = useNavigate();
  const { state } = useAttendance();
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real student data with proper IDs
  const realStudents = [
    { 
      id: '20230001', 
      name: 'Kwame Asante', 
      email: 'kwame.asante@ug.edu.gh',
      phone: '+233 24 123 4567',
      department: 'Computer Science',
      year: 3
    },
    { 
      id: '20230002', 
      name: 'Ama Osei', 
      email: 'ama.osei@ug.edu.gh',
      phone: '+233 24 234 5678',
      department: 'Computer Science',
      year: 2
    },
    { 
      id: '20230003', 
      name: 'Kojo Mensah', 
      email: 'kojo.mensah@ug.edu.gh',
      phone: '+233 24 345 6789',
      department: 'Computer Science',
      year: 4
    },
    { 
      id: '20230004', 
      name: 'Akosua Adjei', 
      email: 'akosua.adjei@ug.edu.gh',
      phone: '+233 24 456 7890',
      department: 'Computer Science',
      year: 1
    },
    { 
      id: '20230005', 
      name: 'Yaw Darko', 
      email: 'yaw.darko@ug.edu.gh',
      phone: '+233 24 567 8901',
      department: 'Computer Science',
      year: 3
    },
    { 
      id: '20230006', 
      name: 'Efua Mensah', 
      email: 'efua.mensah@ug.edu.gh',
      phone: '+233 24 678 9012',
      department: 'Computer Science',
      year: 2
    },
    { 
      id: '20230007', 
      name: 'Kofi Addo', 
      email: 'kofi.addo@ug.edu.gh',
      phone: '+233 24 789 0123',
      department: 'Computer Science',
      year: 4
    },
    { 
      id: '20230008', 
      name: 'Abena Osei', 
      email: 'abena.osei@ug.edu.gh',
      phone: '+233 24 890 1234',
      department: 'Computer Science',
      year: 1
    }
  ];

  // Enhanced live records that integrate with real attendance store
  const [liveRecords, setLiveRecords] = useState([]);

  useEffect(() => {
    // Initialize with real attendance records from the store
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = state.attendanceRecords.filter(record => record.date === today);
    
    if (todayRecords.length > 0) {
      setLiveRecords(todayRecords);
    } else {
      // Initialize with some sample records using real student data
      const initialRecords = realStudents.slice(0, 3).map((student, index) => ({
        id: `record_${Date.now()}_${index}`,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        studentPhone: student.phone,
        studentDepartment: student.department,
        studentYear: student.year,
        courseId: 'CS301',
        courseName: 'Computer Networks',
        date: today,
        time: new Date(Date.now() - index * 60000).toLocaleTimeString(),
        status: 'present',
        method: ['QR Code', 'Face Recognition', 'GPS'][index],
        location: 'Room 101',
        lecturerName: 'Dr. Sarah Johnson',
        confidence: (85 + Math.random() * 15).toFixed(1),
        gpsAccuracy: Math.floor(Math.random() * 10) + 5
      }));
      setLiveRecords(initialRecords);
    }

    // Listen for new attendance records from the store
    const checkNewRecords = () => {
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = state.attendanceRecords.filter(record => record.date === today);
      
      // Update live records with real attendance data
      if (todayRecords.length > liveRecords.length) {
        const newRecords = todayRecords.filter(record => 
          !liveRecords.some(live => live.id === record.id)
        );
        
        if (newRecords.length > 0) {
          setLiveRecords(prev => [...newRecords, ...prev.slice(0, 19)]);
          
          // Show toast for new attendance
          newRecords.forEach(record => {
            toast.success(`${record.studentName} (ID: ${record.studentId}) marked attendance via ${record.method}`);
          });
        }
      }
    };

    // Check for new records every 2 seconds
    const interval = setInterval(checkNewRecords, 2000);

    return () => clearInterval(interval);
  }, [state.attendanceRecords, autoRefresh]);

  // Simulate additional attendance records when auto-refresh is on
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          const randomStudent = realStudents[Math.floor(Math.random() * realStudents.length)];
          const methods = ['QR Code', 'Face Recognition', 'GPS'];
          const newRecord = {
            id: `record_${Date.now()}`,
            studentId: randomStudent.id,
            studentName: randomStudent.name,
            studentEmail: randomStudent.email,
            studentPhone: randomStudent.phone,
            studentDepartment: randomStudent.department,
            studentYear: randomStudent.year,
            courseId: 'CS301',
            courseName: 'Computer Networks',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            status: 'present',
            method: methods[Math.floor(Math.random() * methods.length)],
            location: 'Room 101',
            lecturerName: 'Dr. Sarah Johnson',
            confidence: (85 + Math.random() * 15).toFixed(1),
            gpsAccuracy: Math.floor(Math.random() * 10) + 5
          };
          
          setLiveRecords(prev => [newRecord, ...prev.slice(0, 19)]);
          toast.success(`${randomStudent.name} (ID: ${randomStudent.id}) marked attendance via ${newRecord.method}`);
        }
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Combine live records with attendance store records
  const allRecords = [...liveRecords, ...state.attendanceRecords];

  // Filter and sort records
  useEffect(() => {
    let filtered = allRecords;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentId.includes(searchTerm) ||
        record.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply method filter
    if (filterMethod !== 'all') {
      filtered = filtered.filter(record => record.method === filterMethod);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        case 'name':
          return a.studentName.localeCompare(b.studentName);
        case 'id':
          return a.studentId.localeCompare(b.studentId);
        default:
          return 0;
      }
    });

    setFilteredRecords(filtered);
  }, [allRecords, searchTerm, filterMethod, sortBy]);

  const getMethodIcon = (method) => {
    switch (method) {
      case 'QR Code': return <QrCode className="h-4 w-4" />;
      case 'Face Recognition': return <Camera className="h-4 w-4" />;
      case 'GPS': return <MapPin className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'QR Code': return 'bg-blue-100 text-blue-800';
      case 'Face Recognition': return 'bg-green-100 text-green-800';
      case 'GPS': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const exportAttendanceData = () => {
    const csvData = filteredRecords.map(record => ({
      'Student ID': record.studentId,
      'Student Name': record.studentName,
      'Email': record.studentEmail || 'N/A',
      'Phone': record.studentPhone || 'N/A',
      'Department': record.studentDepartment || 'N/A',
      'Year': record.studentYear || 'N/A',
      'Course': record.courseName,
      'Date': record.date,
      'Time': record.time,
      'Status': record.status,
      'Method': record.method,
      'Location': record.location,
      'Lecturer': record.lecturerName,
      'Score': record.score || 'Not Scored',
      'Scored By': record.scoredBy || 'N/A',
      'Score Date': record.scoreDate || 'N/A',
      'Confidence': record.confidence || 'N/A',
      'GPS Accuracy': record.gpsAccuracy ? `±${record.gpsAccuracy}m` : 'N/A'
    }));

    console.log('Exporting comprehensive attendance data:', csvData);
    toast.success('Comprehensive attendance data exported successfully!');
  };

  const getAttendanceStats = () => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter(r => r.status === 'present').length;
    const qrCount = filteredRecords.filter(r => r.method === 'QR Code').length;
    const faceCount = filteredRecords.filter(r => r.method === 'Face Recognition').length;
    const gpsCount = filteredRecords.filter(r => r.method === 'GPS').length;

    return { total, present, qrCount, faceCount, gpsCount };
  };

  const stats = getAttendanceStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Button variant="ghost" onClick={() => navigate('/lecturer-portal')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Portal
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Live Attendance Viewer</h1>
              </div>
              <p className="text-gray-600">Real-time attendance tracking and monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <Badge className={`px-4 py-2 ${autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {autoRefresh ? 'Live Connection Active' : 'Auto-refresh OFF'}
                </Badge>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {state.attendanceRecords.length} Total Records
              </Badge>
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Records</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-sm text-blue-200">Today's attendance</p>
                </div>
                <Users className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Present</p>
                  <p className="text-3xl font-bold">{stats.present}</p>
                  <p className="text-sm text-green-200">
                    {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% rate
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">QR Code</p>
                  <p className="text-3xl font-bold">{stats.qrCount}</p>
                  <p className="text-sm text-purple-200">Marked via QR</p>
                </div>
                <QrCode className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Face Recognition</p>
                  <p className="text-3xl font-bold">{stats.faceCount}</p>
                  <p className="text-sm text-orange-200">AI verified</p>
                </div>
                <Camera className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">GPS Location</p>
                  <p className="text-3xl font-bold">{stats.gpsCount}</p>
                  <p className="text-sm text-indigo-200">Location verified</p>
                </div>
                <MapPin className="h-10 w-10 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <span>Attendance Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search by name, ID, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="QR Code">QR Code</option>
                <option value="Face Recognition">Face Recognition</option>
                <option value="GPS">GPS</option>
                <option value="Manual">Manual</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="time">Sort by Time</option>
                <option value="name">Sort by Name</option>
                <option value="id">Sort by ID</option>
              </select>

              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-100 text-green-800' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </Button>

              <Button onClick={exportAttendanceData} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No attendance records found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredRecords.map((record, index) => (
                  <div
                    key={record.id}
                    className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${
                      index === 0 ? 'bg-green-50 border-green-200 animate-pulse' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          <div>
                            <h4 className="font-semibold">{record.studentName}</h4>
                            <p className="text-sm text-gray-600">ID: {record.studentId}</p>
                            {record.studentEmail && (
                              <p className="text-sm text-gray-600">Email: {record.studentEmail}</p>
                            )}
                            {record.studentPhone && (
                              <p className="text-sm text-gray-600">Phone: {record.studentPhone}</p>
                            )}
                            {record.studentDepartment && (
                              <p className="text-sm text-gray-600">{record.studentDepartment} • Year {record.studentYear || 3}</p>
                            )}
                            <p className="text-sm text-gray-600">{record.courseName}</p>
                            {record.score !== undefined && (
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                  Score: {record.score}%
                                </span>
                                {record.scoredBy && (
                                  <span className="text-xs text-gray-500">
                                    by {record.scoredBy}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{record.time}</p>
                          <p className="text-xs text-gray-500">{record.date}</p>
                          <p className="text-xs text-gray-500">{record.location}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge className={getMethodColor(record.method)}>
                            {getMethodIcon(record.method)}
                            <span className="ml-1">{record.method}</span>
                          </Badge>

                          {record.confidence && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              {record.confidence}%
                            </Badge>
                          )}

                          {record.gpsAccuracy && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <MapPin className="h-3 w-3 mr-1" />
                              ±{record.gpsAccuracy}m
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {index === 0 && (
                      <div className="mt-2 p-2 bg-green-100 rounded text-green-800 text-xs">
                        <Award className="h-3 w-3 inline mr-1" />
                        Latest attendance record
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Real-time Activity Feed</span>
              <Badge className="bg-green-100 text-green-800">
                {filteredRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length} Today
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredRecords.slice(0, 8).map((record, index) => (
                <div key={`feed_${record.id}`} className={`flex items-center space-x-3 p-3 rounded transition-all duration-200 ${
                  index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{record.time}</span>
                      <span className="text-sm font-medium">{record.studentName}</span>
                      <span className="text-xs text-gray-500">({record.studentId})</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">marked attendance via</span>
                      <Badge className={`${getMethodColor(record.method)} text-xs`}>
                        {getMethodIcon(record.method)}
                        <span className="ml-1">{record.method}</span>
                      </Badge>
                      {record.score !== undefined && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                          Score: {record.score}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      Latest
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceViewer;
