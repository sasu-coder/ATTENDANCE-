
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Clock, MapPin, Plus, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Courses = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const courses = [
    {
      id: 1,
      code: 'CS301',
      name: 'Data Structures and Algorithms',
      lecturer: 'Dr. John Smith',
      lecturerId: 'LEC001',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      location: 'Room 101, CS Building',
      students: 45,
      attendanceRate: 88,
      description: 'Advanced study of data structures including trees, graphs, hash tables, and their applications in algorithm design.',
      prerequisites: ['CS201 - Programming Fundamentals', 'MATH101 - Discrete Mathematics'],
      credits: 3,
      semester: 'Fall 2024',
      assignments: [
        { name: 'Binary Trees Implementation', due: '2024-02-15', status: 'pending' },
        { name: 'Graph Algorithms Project', due: '2024-03-01', status: 'submitted' }
      ],
      announcements: [
        { date: '2024-01-15', message: 'Midterm exam scheduled for February 20th' },
        { date: '2024-01-10', message: 'New reading materials uploaded to course portal' }
      ]
    },
    {
      id: 2,
      code: 'CS350',
      name: 'Web Development',
      lecturer: 'Prof. Sarah Johnson',
      lecturerId: 'LEC002',
      schedule: 'Tue, Thu - 11:00 AM',
      location: 'Lab 2, IT Building',
      students: 38,
      attendanceRate: 92,
      description: 'Comprehensive course covering modern web development technologies including HTML5, CSS3, JavaScript, React, and backend development.',
      prerequisites: ['CS201 - Programming Fundamentals', 'CS250 - Database Basics'],
      credits: 4,
      semester: 'Fall 2024',
      assignments: [
        { name: 'Portfolio Website', due: '2024-02-10', status: 'completed' },
        { name: 'E-commerce Application', due: '2024-03-15', status: 'in-progress' }
      ],
      announcements: [
        { date: '2024-01-12', message: 'Guest lecture on React best practices next Thursday' },
        { date: '2024-01-08', message: 'Lab sessions extended by 30 minutes starting this week' }
      ]
    },
    {
      id: 3,
      code: 'CS340',
      name: 'Database Systems',
      lecturer: 'Dr. Michael Brown',
      lecturerId: 'LEC003',
      schedule: 'Mon, Wed - 2:00 PM',
      location: 'Room 205, CS Building',
      students: 42,
      attendanceRate: 85,
      description: 'In-depth study of database design, implementation, and management including SQL, NoSQL, and database optimization.',
      prerequisites: ['CS250 - Database Basics', 'MATH201 - Statistics'],
      credits: 3,
      semester: 'Fall 2024',
      assignments: [
        { name: 'Database Design Project', due: '2024-02-25', status: 'pending' },
        { name: 'SQL Query Optimization', due: '2024-03-10', status: 'pending' }
      ],
      announcements: [
        { date: '2024-01-14', message: 'Database lab access extended to weekends' },
        { date: '2024-01-09', message: 'Additional tutoring sessions available on Fridays' }
      ]
    },
    {
      id: 4,
      code: 'CS320',
      name: 'Software Engineering',
      lecturer: 'Prof. Emily Davis',
      lecturerId: 'LEC004',
      schedule: 'Tue, Thu - 10:00 AM',
      location: 'Room 301, CS Building',
      students: 40,
      attendanceRate: 90,
      description: 'Comprehensive course on software development methodologies, project management, and team collaboration.',
      prerequisites: ['CS301 - Data Structures', 'CS250 - Database Basics'],
      credits: 4,
      semester: 'Fall 2024',
      assignments: [
        { name: 'Agile Project Planning', due: '2024-02-20', status: 'submitted' },
        { name: 'Team Software Project', due: '2024-04-15', status: 'in-progress' }
      ],
      announcements: [
        { date: '2024-01-16', message: 'Industry mentorship program now available' },
        { date: '2024-01-11', message: 'Team formation deadline extended to January 25th' }
      ]
    }
  ];

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowDetails(true);
    toast.success(`Viewing details for ${course.name}`);
  };

  const handleMarkAttendance = (course) => {
    navigate('/student-attendance', { 
      state: { 
        courseId: course.code, 
        courseName: course.name,
        lecturer: course.lecturer,
        location: course.location,
        schedule: course.schedule
      } 
    });
    toast.info(`Opening attendance for ${course.name}`);
  };

  const handleEnrollCourse = () => {
    toast.success('Course enrollment feature will be available soon!');
  };

  const getAssignmentStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  if (showDetails && selectedCourse) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="outline" onClick={() => setShowDetails(false)} className="mb-4">
                ← Back to Courses
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">{selectedCourse.code}</h1>
              <h2 className="text-xl text-gray-700">{selectedCourse.name}</h2>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => handleMarkAttendance(selectedCourse)} className="bg-blue-600 hover:bg-blue-700">
                Mark Attendance
              </Button>
              <Button variant="outline">
                Contact Lecturer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Overview */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{selectedCourse.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Course Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Credits:</span> {selectedCourse.credits}</p>
                        <p><span className="font-medium">Semester:</span> {selectedCourse.semester}</p>
                        <p><span className="font-medium">Students:</span> {selectedCourse.students}</p>
                        <p><span className="font-medium">Attendance Rate:</span> {selectedCourse.attendanceRate}%</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Schedule & Location</h4>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center"><Clock className="h-4 w-4 mr-2" />{selectedCourse.schedule}</p>
                        <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{selectedCourse.location}</p>
                        <p className="flex items-center"><BookOpen className="h-4 w-4 mr-2" />{selectedCourse.lecturer}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Prerequisites</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {selectedCourse.prerequisites.map((prereq, index) => (
                        <li key={index} className="text-gray-700">{prereq}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignments & Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCourse.assignments.map((assignment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{assignment.name}</h4>
                          <p className="text-sm text-gray-600">Due: {new Date(assignment.due).toLocaleDateString()}</p>
                        </div>
                        {getAssignmentStatusBadge(assignment.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleMarkAttendance(selectedCourse)} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Course Materials
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Class Discussion
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Announcements */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCourse.announcements.map((announcement, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">{announcement.message}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {new Date(announcement.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">92%</div>
                      <p className="text-sm text-gray-600">Your Attendance Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">A-</div>
                      <p className="text-sm text-gray-600">Current Grade</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">3</div>
                      <p className="text-sm text-gray-600">Assignments Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600">Manage your enrolled courses and view details.</p>
          </div>
          <Button onClick={handleEnrollCourse} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Enroll in Course
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.code}</CardTitle>
                    <p className="text-gray-600 mt-1">{course.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Attendance</p>
                    <p className="text-lg font-bold text-green-600">{course.attendanceRate}%</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {course.lecturer}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {course.schedule}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {course.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {course.students} students enrolled
                  </div>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(course)}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleMarkAttendance(course)}
                  >
                    <CheckCircle className="h-3 w-3 mr-2" />
                    Mark Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Courses;
