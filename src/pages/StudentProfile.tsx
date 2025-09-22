
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Camera } from 'lucide-react';
import { toast } from 'sonner';

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Kwame Asante',
    email: 'kwame.asante@ug.edu.gh',
    phone: '+233 24 123 4567',
    address: 'Legon Hall, Room 205',
    studentId: '10654321',
    program: 'Computer Science',
    level: '300 Level',
    gpa: '3.67',
    enrollmentDate: '2022-09-15'
  });

  const achievements = [
    { title: 'Dean\'s List', semester: 'Semester 1, 2023', icon: '🏆' },
    { title: 'Perfect Attendance', course: 'Data Structures', icon: '📚' },
    { title: 'Programming Contest Winner', event: 'UG CodeFest 2023', icon: '🥇' },
    { title: 'Research Assistant', department: 'CS Department', icon: '🔬' }
  ];

  const academicHistory = [
    { semester: 'Semester 2, 2023', gpa: '3.8', status: 'Completed' },
    { semester: 'Semester 1, 2023', gpa: '3.9', status: 'Completed' },
    { semester: 'Semester 2, 2022', gpa: '3.2', status: 'Completed' },
    { semester: 'Semester 1, 2022', gpa: '3.4', status: 'Completed' }
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    toast.info('Changes discarded');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Student Profile</h1>
          <p className="text-blue-100">Manage your personal and academic information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <div className="space-x-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-xl">KA</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={profile.studentId}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic History */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Academic History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {academicHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{record.semester}</p>
                        <p className="text-sm text-gray-600">GPA: {record.gpa}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Academic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{profile.program}</p>
                    <p className="text-sm text-gray-600">Program</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{profile.level}</p>
                    <p className="text-sm text-gray-600">Current Level</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">{profile.enrollmentDate}</p>
                    <p className="text-sm text-gray-600">Enrollment Date</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">{profile.gpa}</p>
                    <p className="text-sm text-gray-600">Current GPA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <span className="text-xl">{achievement.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-gray-600">
                          {achievement.semester || achievement.course || achievement.event || achievement.department}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">87%</p>
                  <p className="text-sm text-gray-600">Overall Attendance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">8</p>
                  <p className="text-sm text-gray-600">Courses Enrolled</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">142</p>
                  <p className="text-sm text-gray-600">Total Credits</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentProfile;
