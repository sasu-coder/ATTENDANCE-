
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, ArrowLeft, RefreshCw, Users, Target, 
  Navigation, Compass, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';

const GpsHeatmap = () => {
  const navigate = useNavigate();
  const [gpsData, setGpsData] = useState([]);
  const [locationStats, setLocationStats] = useState({
    totalLocations: 0,
    accurateLocations: 0,
    suspiciousLocations: 0
  });

  // Simulate GPS data
  useEffect(() => {
    const classroomLocations = [
      { name: 'Room 101', lat: 5.6507, lng: -0.1864, radius: 50 },
      { name: 'Lab 3', lat: 5.6510, lng: -0.1860, radius: 30 },
      { name: 'Room 205', lat: 5.6505, lng: -0.1870, radius: 40 }
    ];

    const students = [
      'Kwame Asante', 'Ama Osei', 'Kojo Mensah', 'Akosua Adjei', 'Yaw Boateng'
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const baseLocation = classroomLocations[Math.floor(Math.random() * classroomLocations.length)];
        const accuracy = Math.floor(Math.random() * 20) + 5;
        const isAccurate = accuracy <= 10;
        
        const newGpsPoint = {
          id: Date.now(),
          studentName: students[Math.floor(Math.random() * students.length)],
          studentId: `20230${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
          lat: baseLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: baseLocation.lng + (Math.random() - 0.5) * 0.001,
          accuracy: accuracy,
          location: baseLocation.name,
          time: new Date().toLocaleTimeString(),
          status: isAccurate ? 'verified' : 'suspicious',
          distance: Math.floor(Math.random() * 100)
        };

        setGpsData(prev => [newGpsPoint, ...prev.slice(0, 19)]);

        setLocationStats(prev => ({
          totalLocations: prev.totalLocations + 1,
          accurateLocations: prev.accurateLocations + (isAccurate ? 1 : 0),
          suspiciousLocations: prev.suspiciousLocations + (isAccurate ? 0 : 1)
        }));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    return status === 'verified' 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (status) => {
    return status === 'verified' 
      ? <Badge className="bg-green-100 text-green-800">Verified</Badge>
      : <Badge className="bg-yellow-100 text-yellow-800">Suspicious</Badge>;
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy <= 5) return 'text-green-600';
    if (accuracy <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/lecturer-portal')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GPS Location Heatmap</h1>
              <p className="text-gray-600">Real-time student location verification</p>
            </div>
          </div>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Locations</p>
                  <p className="text-3xl font-bold">{locationStats.totalLocations}</p>
                </div>
                <MapPin className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Verified Locations</p>
                  <p className="text-3xl font-bold">{locationStats.accurateLocations}</p>
                </div>
                <Target className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Suspicious Locations</p>
                  <p className="text-3xl font-bold">{locationStats.suspiciousLocations}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Compass className="h-5 w-5 text-blue-600" />
                <span>Location Heatmap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simulated heatmap dots */}
                {gpsData.slice(0, 10).map((point, index) => (
                  <div
                    key={point.id}
                    className={`absolute w-4 h-4 rounded-full ${
                      point.status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'
                    } opacity-70 animate-pulse`}
                    style={{
                      left: `${20 + (index % 3) * 25}%`,
                      top: `${20 + Math.floor(index / 3) * 20}%`
                    }}
                  />
                ))}
                <div className="text-center z-10">
                  <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">University of Ghana Campus</p>
                  <p className="text-sm text-gray-500">Live GPS tracking visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-green-600" />
                <span>Recent GPS Data ({gpsData.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {gpsData.map((point) => (
                  <div key={point.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(point.status)}
                        <span className="font-medium">{point.studentName}</span>
                      </div>
                      {getStatusBadge(point.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>ID: {point.studentId} • Location: {point.location}</p>
                      <p>Coordinates: {point.lat.toFixed(4)}, {point.lng.toFixed(4)}</p>
                      <div className="flex justify-between">
                        <span className={`font-medium ${getAccuracyColor(point.accuracy)}`}>
                          Accuracy: ±{point.accuracy}m
                        </span>
                        <span>{point.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {gpsData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Waiting for GPS data...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GpsHeatmap;
