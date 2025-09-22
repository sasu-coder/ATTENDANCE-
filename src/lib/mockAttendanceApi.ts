export interface AttendanceRecord {
  id: number;
  studentName: string;
  studentId: string;
  method: string;
  time: string;
  status: 'verified' | 'pending';
  confidence: string | null;
}

const students = [
  'Kwame Asante', 'Ama Osei', 'Kojo Mensah', 'Akosua Adjei', 'Yaw Boateng',
  'Efua Darko', 'Kofi Appiah', 'Abena Sarpong', 'Kwaku Owusu', 'Adwoa Bekoe'
];

const methods = ['QR Code', 'Face Recognition', 'GPS'];

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function generateAttendance(id: number): AttendanceRecord {
  return {
    id,
    studentName: students[randomInt(students.length)],
    studentId: `20230${randomInt(999).toString().padStart(3, '0')}`,
    method: methods[randomInt(methods.length)],
    time: new Date(Date.now() - randomInt(3600 * 1000)).toLocaleTimeString(),
    status: Math.random() > 0.1 ? 'verified' : 'pending',
    confidence: Math.random() > 0.5 ? (85 + Math.random() * 15).toFixed(1) + '%' : null
  };
}

const TOTAL_RECORDS = 50;
const allAttendance: AttendanceRecord[] = Array.from({ length: TOTAL_RECORDS }, (_, i) => generateAttendance(i + 1));

export interface FetchAttendanceParams {
  page: number;
  pageSize: number;
}

export interface FetchAttendanceResult {
  records: AttendanceRecord[];
  total: number;
}

export function fetchAttendance(params: FetchAttendanceParams): Promise<FetchAttendanceResult> {
  return new Promise((resolve) => {
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageRecords = allAttendance.slice(start, end);

    setTimeout(() => {
      resolve({
        records: pageRecords,
        total: allAttendance.length
      });
    }, 500); // simulate network delay
  });
}
