export interface Student {
  id: string;
  name: string;
  studentId: string;
  grade: string;
  gender?: string;
  status?: string;
  photo?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  timestamp: number;
}

export interface DatabaseExport {
  students: Student[];
  attendance: AttendanceRecord[];
  exportDate: string;
  version: string;
}
