import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Calendar, Camera, Loader2 } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { toast } from 'sonner';

const Profile = () => {
  const { profile, loading, error, updateProfile } = useUserData();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    phone: '',
    department: '',
    faculty: '',
    yearOfStudy: '',
    dateOfBirth: '',
    address: ''
  });

  // Update profile data when profile is loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.full_name || '',
        email: profile.email || '',
        studentId: profile.student_id || '',
        phone: profile.phone_number || '',
        department: profile.department || '',
        faculty: profile.faculty || '',
        yearOfStudy: profile.year_of_study?.toString() || '',
        dateOfBirth: '', // Not stored in database yet
        address: '' // Not stored in database yet
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    try {
      const updates = {
        full_name: profileData.fullName,
        phone_number: profileData.phone,
        department: profileData.department,
        faculty: profileData.faculty,
        year_of_study: profileData.yearOfStudy ? parseInt(profileData.yearOfStudy) : null
      };

      const { error } = await updateProfile(updates);
      
      if (error) {
        toast.error('Failed to update profile');
        console.error('Profile update error:', error);
      } else {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error('Profile update error:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original profile data
    if (profile) {
      setProfileData({
        fullName: profile.full_name || '',
        email: profile.email || '',
        studentId: profile.student_id || '',
        phone: profile.phone_number || '',
        department: profile.department || '',
        faculty: profile.faculty || '',
        yearOfStudy: profile.year_of_study?.toString() || '',
        dateOfBirth: '',
        address: ''
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading profile: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No profile data found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={profile.profile_image_url || "/placeholder-avatar.jpg"} />
                <AvatarFallback className="text-lg">
                  {profileData.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Courses Enrolled</span>
                <span className="font-medium">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="font-medium text-green-600">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Year of Study</span>
                <span className="font-medium">{profileData.yearOfStudy ? `${profileData.yearOfStudy}rd Year` : 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">GPA</span>
                <span className="font-medium">3.45</span>
              </div>
            </CardContent>
          </Card>

          {/* Academic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-medium">{profileData.studentId || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{profileData.department || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Faculty</p>
                <p className="font-medium">{profileData.faculty || 'Not set'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled={true}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearOfStudy">Year of Study</Label>
                <Select value={profileData.yearOfStudy} disabled={!isEditing} onValueChange={(value) => setProfileData({...profileData, yearOfStudy: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={profileData.department}
                  onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Input
                  id="faculty"
                  value={profileData.faculty}
                  onChange={(e) => setProfileData({...profileData, faculty: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-4 mt-6">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
