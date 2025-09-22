
import React, { useState } from 'react';
import { 
  BookOpen, Plus, Search, Filter, Edit, Trash2, Users, 
  Calendar, MapPin, Clock, Download, Upload, Eye, Settings,
  Home, BarChart3, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AdminCourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([
    {
      id: 'CS301',
      name: 'Data Structures and Algorithms',
      code: 'CS301',
      lecturer: 'Dr. John Smith',
      lecturerId: 'LEC001',
      department: 'Computer Science',
      credits: 3,
      students: 45,
      maxStudents: 50,
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      room: 'Room 101',
      status: 'active',
      attendanceRate: 88,
      semester: 'Fall 2024'
    },
    {
      id: 'CS350',
      name: 'Web Development',
      code: 'CS350',
      lecturer: 'Prof. Sarah Johnson',
      lecturerId: 'LEC002',
      department: 'Computer Science',
      credits: 4,
      students: 38,
      maxStudents: 40,
      schedule: 'Tue, Thu - 11:00 AM',
      room: 'Lab 2',
      status: 'active',
      attendanceRate: 92,
      semester: 'Fall 2024'
    },
    {
      id: 'CS340',
      name: 'Database Systems',
      code: 'CS340',
      lecturer: 'Dr. Michael Brown',
      lecturerId: 'LEC003',
      department: 'Computer Science',
      credits: 3,
      students: 42,
      maxStudents: 45,
      schedule: 'Mon, Wed - 2:00 PM',
      room: 'Room 205',
      status: 'active',
      attendanceRate: 85,
      semester: 'Fall 2024'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddCourse = () => {
    setShowAddModal(true);
    toast.info('Add course modal opened');
  };

  const handleEditCourse = (courseId) => {
    toast.info(`Editing course ${courseId}`);
  };

  const handleDeleteCourse = (courseId) => {
    setCourses(courses.filter(course => course.id !== courseId));
    toast.success(`Course ${courseId} deleted successfully`);
  };

  const handleExportData = () => {
    toast.success('Course data exported successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Course Management</span>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start mb-4"
              onClick={() => navigate('/admin-portal')}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Admin Portal
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
                <p className="text-gray-600">Manage all courses, assignments, and enrollments</p>
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleExportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button onClick={handleAddCourse} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Courses</p>
                      <p className="text-3xl font-bold">{courses.length}</p>
                    </div>
                    <BookOpen className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Active Courses</p>
                      <p className="text-3xl font-bold">{courses.filter(c => c.status === 'active').length}</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Students</p>
                      <p className="text-3xl font-bold">{courses.reduce((sum, course) => sum + course.students, 0)}</p>
                    </div>
                    <Users className="h-10 w-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Avg. Attendance</p>
                      <p className="text-3xl font-bold">{Math.round(courses.reduce((sum, course) => sum + course.attendanceRate, 0) / courses.length)}%</p>
                    </div>
                    <BarChart3 className="h-10 w-10 text-orange-200" />
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
                      placeholder="Search courses, lecturers, or codes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Courses Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Course Code</th>
                        <th className="text-left p-3">Course Name</th>
                        <th className="text-left p-3">Lecturer</th>
                        <th className="text-left p-3">Students</th>
                        <th className="text-left p-3">Schedule</th>
                        <th className="text-left p-3">Room</th>
                        <th className="text-left p-3">Attendance</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono font-bold">{course.code}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{course.name}</p>
                              <p className="text-sm text-gray-600">{course.credits} Credits • {course.department}</p>
                            </div>
                          </td>
                          <td className="p-3">{course.lecturer}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <span>{course.students}/{course.maxStudents}</span>
                              <div className="w-12 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-2 bg-blue-500 rounded-full" 
                                  style={{ width: `${(course.students / course.maxStudents) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm">{course.schedule}</td>
                          <td className="p-3">{course.room}</td>
                          <td className="p-3">
                            <Badge className={`${course.attendanceRate >= 90 ? 'bg-green-100 text-green-800' : 
                              course.attendanceRate >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {course.attendanceRate}%
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={`${course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {course.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditCourse(course.id)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteCourse(course.id)}>
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
        </div>
      </div>
    </div>
  );
};

export default AdminCourseManagement;
