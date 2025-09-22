
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';

const Analytics = () => {
  const monthlyData = [
    { month: 'Jan', attendance: 85 },
    { month: 'Feb', attendance: 90 },
    { month: 'Mar', attendance: 78 },
    { month: 'Apr', attendance: 88 },
    { month: 'May', attendance: 92 },
    { month: 'Jun', attendance: 85 }
  ];

  const coursePerformance = [
    { course: 'Data Structures', attendance: 92, trend: 'up' },
    { course: 'Web Development', attendance: 88, trend: 'up' },
    { course: 'Database Systems', attendance: 85, trend: 'down' },
    { course: 'Software Engineering', attendance: 90, trend: 'up' }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your attendance patterns and academic performance.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5% from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Classes This Month</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-xs text-green-600">21 attended</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Best Course</p>
                  <p className="text-lg font-bold text-gray-900">Data Structures</p>
                  <p className="text-xs text-green-600">92% attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                  <p className="text-lg font-bold text-gray-900">Database Systems</p>
                  <p className="text-xs text-red-600">85% attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Attendance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{data.month}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${data.attendance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{data.attendance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coursePerformance.map((course) => (
                  <div key={course.course} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{course.course}</p>
                      <p className="text-sm text-gray-600">{course.attendance}% attendance</p>
                    </div>
                    <div className="flex items-center">
                      {course.trend === 'up' ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const attendance = [95, 88, 92, 85, 90, 0, 0][index];
                return (
                  <div key={day} className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">{day}</p>
                    <div className="w-full bg-gray-200 rounded-full h-16 flex items-end justify-center">
                      {attendance > 0 && (
                        <div
                          className="bg-blue-600 rounded-full w-full flex items-end justify-center"
                          style={{ height: `${(attendance / 100) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium pb-1">
                            {attendance}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analytics;
