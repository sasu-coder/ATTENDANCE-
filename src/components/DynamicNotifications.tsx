import React, { useEffect, useState } from 'react';
import { Bell, X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAttendance } from '@/hooks/useAttendanceStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DynamicNotifications = () => {
  const { state, dispatch } = useAttendance();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Dynamic notification system - changes every 10 seconds
  useEffect(() => {
    const dynamicNotifications = [
      { message: "New attendance policy update: GPS verification now required", type: "info" },
      { message: "System maintenance scheduled for tonight 2:00 AM - 4:00 AM", type: "warning" },
      { message: "Face recognition accuracy improved to 99.2%", type: "success" },
      { message: "New feature: Bulk attendance export now available", type: "info" },
      { message: "Weather alert: Classes may be affected by heavy rainfall", type: "warning" },
      { message: "Library hours extended until 10 PM this week", type: "info" },
      { message: "Assignment deadline reminder: Database project due tomorrow", type: "warning" },
      { message: "New course material uploaded for CS301", type: "info" },
      { message: "System backup completed successfully", type: "success" },
      { message: "Internet connectivity issues resolved", type: "success" },
      { message: "New lecturer joined Computer Science department", type: "info" },
      { message: "Exam schedule released for all courses", type: "warning" }
    ];

    const interval = setInterval(() => {
      const randomNotification = dynamicNotifications[Math.floor(Math.random() * dynamicNotifications.length)];
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          message: randomNotification.message,
          type: randomNotification.type as 'info' | 'success' | 'warning' | 'error'
        }
      });
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="fixed top-4 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`relative bg-white shadow-lg hover:shadow-xl ${state.notifications.length > 0 ? 'animate-pulse' : ''}`}
                onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
              >
                <Bell className="h-4 w-4" />
                {state.notifications.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {state.notifications.length}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {state.notifications.length === 0 ? (
                <span>No new notifications</span>
              ) : (
                <div>
                  <span>{state.notifications.length} unread notification{state.notifications.length > 1 ? 's' : ''}</span>
                  <br />
                  <span className="font-semibold">Latest: </span>
                  <span>{state.notifications[state.notifications.length - 1]?.message}</span>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Notification Panel */}
      {isNotificationPanelOpen && (
        <div className="fixed top-16 right-4 z-40 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsNotificationPanelOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {state.notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              state.notifications.map((notification) => (
                <div key={notification.id} className="p-3 border-b hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={`text-xs ${getBadgeColor(notification.type)}`}>
                          {notification.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicNotifications;
