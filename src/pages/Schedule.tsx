
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState('today');

  const schedule = {
    today: [
      {
        id: 1,
        course: 'Data Structures',
        code: 'CS301',
        time: '9:00 AM - 10:30 AM',
        location: 'Room 101, CS Building',
        lecturer: 'Dr. John Smith',
        status: 'upcoming'
      },
      {
        id: 2,
        course: 'Web Development',
        code: 'CS350',
        time: '11:00 AM - 12:30 PM',
        location: 'Lab 2, IT Building',
        lecturer: 'Prof. Sarah Johnson',
        status: 'upcoming'
      },
      {
        id: 3,
        course: 'Database Systems',
        code: 'CS340',
        time: '2:00 PM - 3:30 PM',
        location: 'Room 205, CS Building',
        lecturer: 'Dr. Michael Brown',
        status: 'upcoming'
      }
    ],
    tomorrow: [
      {
        id: 4,
        course: 'Software Engineering',
        code: 'CS320',
        time: '10:00 AM - 11:30 AM',
        location: 'Room 301, CS Building',
        lecturer: 'Prof. Emily Davis',
        status: 'scheduled'
      },
      {
        id: 5,
        course: 'Web Development',
        code: 'CS350',
        time: '2:00 PM - 3:30 PM',
        location: 'Lab 2, IT Building',
        lecturer: 'Prof. Sarah Johnson',
        status: 'scheduled'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-600">View your upcoming classes and manage your timetable.</p>
        </div>

        {/* Day Selection */}
        <div className="flex space-x-2">
          <Button
            variant={selectedDay === 'today' ? 'default' : 'outline'}
            onClick={() => setSelectedDay('today')}
          >
            Today
          </Button>
          <Button
            variant={selectedDay === 'tomorrow' ? 'default' : 'outline'}
            onClick={() => setSelectedDay('tomorrow')}
          >
            Tomorrow
          </Button>
          <Button
            variant={selectedDay === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedDay('week')}
          >
            This Week
          </Button>
        </div>

        {/* Schedule Cards */}
        <div className="space-y-4">
          {schedule[selectedDay as keyof typeof schedule]?.map((class_) => (
            <Card key={class_.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{class_.course}</h3>
                      <span className="text-sm text-gray-500">({class_.code})</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(class_.status)}`}>
                        {class_.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {class_.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {class_.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {class_.lecturer}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button size="sm">
                      Mark Attendance
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Overview */}
        {selectedDay === 'week' && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center">
                    <h4 className="font-medium text-gray-900 mb-2">{day}</h4>
                    <div className="space-y-1">
                      {day !== 'Sat' && day !== 'Sun' && (
                        <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded">
                          CS301 9:00
                        </div>
                      )}
                      {(day === 'Tue' || day === 'Thu') && (
                        <div className="text-xs bg-green-100 text-green-800 p-1 rounded">
                          CS350 11:00
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Schedule;
