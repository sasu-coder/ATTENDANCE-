import React, { useState, useRef } from 'react';
import { QrCode, Users, BarChart3, Calendar, MessageCircle, Settings, Bell, MapPin, ExternalLink, Download, Copy, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import QRCode from 'qrcode';

const LecturerDashboard = () => {
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
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Available courses for the lecturer
  const courses = [
    { id: 'CS301', name: 'Computer Networks', room: 'Room 101', time: '9:00 AM - 11:00 AM', lecturer: 'Dr. Sarah Johnson' },
    { id: 'CS401', name: 'Database Systems', room: 'Room 203', time: '11:00 AM - 1:00 PM', lecturer: 'Dr. Sarah Johnson' },
    { id: 'CS501', name: 'Software Engineering', room: 'Lab 1', time: '2:00 PM - 4:00 PM', lecturer: 'Dr. Sarah Johnson' },
    { id: 'CS601', name: 'Machine Learning', room: 'Room 305', time: '4:00 PM - 6:00 PM', lecturer: 'Dr. Sarah Johnson' }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lecturer Dashboard</h1>
              <p className="text-gray-600">Welcome back, Dr. Sarah Johnson</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/lecturer-portal">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Advanced Portal
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Access Banner */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold mb-2">🚀 New Advanced Lecturer Portal Available!</h2>
                <p className="text-blue-100">Access the full-featured command center with AI analytics, real-time monitoring, and advanced controls.</p>
              </div>
              <Link to="/lecturer-portal">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Launch Portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Sessions</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <QrCode className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Students</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Avg Attendance</p>
                  <p className="text-2xl font-bold">78%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Risk Alerts</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Bell className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5 text-blue-600" />
                  <span>Class Session Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Computer Networks - CS 301</h3>
                      <p className="text-gray-600">Room 101 • 9:00 AM - 11:00 AM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Students Present</p>
                      <p className="text-2xl font-bold text-green-600">42/65</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                      <p className="text-2xl font-bold text-blue-600">65%</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={generateQRCode}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate QR
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      View Map
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      End Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span>Today's Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Computer Networks</p>
                    <p className="text-sm text-gray-600">9:00 AM - Room 101</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Database Systems</p>
                    <p className="text-sm text-gray-600">11:00 AM - Room 203</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Next</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Software Lab</p>
                    <p className="text-sm text-gray-600">2:00 PM - Lab 1</p>
                  </div>
                  <Badge variant="outline">Later</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-red-600">Risk Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="font-medium text-red-800">Proxy Detection</p>
                  <p className="text-sm text-red-600">Multiple face matches for Student ID: 10654321</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-medium text-yellow-800">Location Anomaly</p>
                  <p className="text-sm text-yellow-600">GPS mismatch detected for 3 students</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">View detailed attendance analytics</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Student Management</h3>
              <p className="text-sm text-gray-600">Manage enrolled students</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Messaging</h3>
              <p className="text-sm text-gray-600">Send notifications to students</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Export Reports</h3>
              <p className="text-sm text-gray-600">Generate PDF/Excel reports</p>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Generator Modal */}
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
                    {courses.map((course) => (
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

export default LecturerDashboard;
