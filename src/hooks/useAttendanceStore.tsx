
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  studentDepartment?: string;
  studentYear?: number;
  courseId: string;
  courseName: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  method: 'QR Code' | 'Face Recognition' | 'GPS' | 'Manual';
  location?: string;
  lecturerName?: string;
  score?: number;
  scoreDate?: string;
  scoreTime?: string;
  scoredBy?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  department: string;
  year: number;
}

interface AttendanceState {
  attendanceRecords: AttendanceRecord[];
  students: Student[];
  activeSession: {
    courseId: string;
    courseName: string;
    startTime: string;
    qrCode: string;
    isActive: boolean;
  } | null;
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
  }>;
}

type AttendanceAction = 
  | { type: 'MARK_ATTENDANCE'; payload: Omit<AttendanceRecord, 'id'> }
  | { type: 'SCORE_STUDENT'; payload: { studentId: string; score: number; scoredBy: string; date: string } }
  | { type: 'START_SESSION'; payload: { courseId: string; courseName: string; qrCode: string } }
  | { type: 'END_SESSION' }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string; type: 'info' | 'success' | 'warning' | 'error' } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const initialState: AttendanceState = {
  attendanceRecords: [
    {
      id: '1',
      studentId: '20230001',
      studentName: 'Kwame Asante',
      courseId: 'CS301',
      courseName: 'Data Structures',
      date: '2024-01-15',
      time: '9:00 AM',
      status: 'present',
      method: 'QR Code',
      location: 'Room 205',
      lecturerName: 'Dr. John Smith'
    },
    {
      id: '2',
      studentId: '20230002',
      studentName: 'Ama Osei',
      courseId: 'CS350',
      courseName: 'Web Development',
      date: '2024-01-15',
      time: '11:00 AM',
      status: 'present',
      method: 'Face Recognition',
      location: 'Lab 3',
      lecturerName: 'Prof. Sarah Johnson'
    }
  ],
  students: [
    {
      id: '20230001',
      name: 'Kwame Asante',
      email: 'kwame.asante@ug.edu.gh',
      department: 'Computer Science',
      year: 3
    },
    {
      id: '20230002',
      name: 'Ama Osei',
      email: 'ama.osei@ug.edu.gh',
      department: 'Computer Science',
      year: 2
    },
    {
      id: '20230003',
      name: 'Kojo Mensah',
      email: 'kojo.mensah@ug.edu.gh',
      department: 'Computer Science',
      year: 4
    }
  ],
  activeSession: null,
  notifications: []
};

function attendanceReducer(state: AttendanceState, action: AttendanceAction): AttendanceState {
  switch (action.type) {
    case 'MARK_ATTENDANCE':
      const newRecord: AttendanceRecord = {
        ...action.payload,
        id: Date.now().toString()
      };
      return {
        ...state,
        attendanceRecords: [newRecord, ...state.attendanceRecords]
      };
    case 'SCORE_STUDENT':
      const updatedRecords = state.attendanceRecords.map(record => {
        if (record.studentId === action.payload.studentId && 
            record.date === action.payload.date) {
          return {
            ...record,
            score: action.payload.score,
            scoreDate: action.payload.date,
            scoreTime: new Date().toLocaleTimeString(),
            scoredBy: action.payload.scoredBy
          };
        }
        return record;
      });
      return {
        ...state,
        attendanceRecords: updatedRecords
      };
    case 'START_SESSION':
      return {
        ...state,
        activeSession: {
          ...action.payload,
          startTime: new Date().toLocaleTimeString(),
          isActive: true
        }
      };
    case 'END_SESSION':
      return {
        ...state,
        activeSession: null
      };
    case 'ADD_NOTIFICATION':
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date().toLocaleTimeString()
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications.slice(0, 4)]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    default:
      return state;
  }
}

const AttendanceContext = createContext<{
  state: AttendanceState;
  dispatch: React.Dispatch<AttendanceAction>;
} | null>(null);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);

  // Dynamic notifications
  useEffect(() => {
    const notifications = [
      "New attendance policy update: GPS verification now required",
      "System maintenance scheduled for tonight 2:00 AM - 4:00 AM",
      "Face recognition accuracy improved to 99.2%",
      "New feature: Bulk attendance export now available",
      "Weather alert: Classes may be affected by heavy rainfall",
      "Library hours extended until 10 PM this week"
    ];

    const interval = setInterval(() => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          message: randomNotification,
          type: Math.random() > 0.7 ? 'warning' : 'info'
        }
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <AttendanceContext.Provider value={{ state, dispatch }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }
  return context;
};
