import { Student, AttendanceRecord, DatabaseExport } from "@/types/student";

const STUDENTS_KEY = "attendance_students";
const ATTENDANCE_KEY = "attendance_records";
const DB_VERSION = "1.0.0";

// Students operations
export const getStudents = (): Student[] => {
  try {
    const data = localStorage.getItem(STUDENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading students:", error);
    return [];
  }
};

export const saveStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Error saving students:", error);
  }
};

export const addStudent = (student: Student): void => {
  const students = getStudents();
  students.push(student);
  saveStudents(students);
};

export const updateStudent = (id: string, updatedStudent: Partial<Student>): void => {
  const students = getStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...updatedStudent };
    saveStudents(students);
  }
};

export const deleteStudent = (id: string): void => {
  const students = getStudents().filter((s) => s.id !== id);
  saveStudents(students);
};

export const getStudentById = (id: string): Student | undefined => {
  return getStudents().find((s) => s.id === id);
};

export const getStudentByStudentId = (studentId: string): Student | undefined => {
  return getStudents().find((s) => s.studentId === studentId);
};

// Attendance operations
export const getAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading attendance:", error);
    return [];
  }
};

export const saveAttendanceRecords = (records: AttendanceRecord[]): void => {
  try {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Error saving attendance:", error);
  }
};

export const addAttendanceRecord = (record: AttendanceRecord): void => {
  const records = getAttendanceRecords();
  records.push(record);
  saveAttendanceRecords(records);
};

export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  return getAttendanceRecords().filter((r) => r.date === date);
};

export const getTodayAttendance = (): AttendanceRecord[] => {
  const today = new Date().toISOString().split("T")[0];
  return getAttendanceByDate(today);
};

export const checkIfMarkedToday = (studentId: string): boolean => {
  const todayRecords = getTodayAttendance();
  return todayRecords.some((r) => r.studentId === studentId);
};

// Database export/import
export const exportDatabase = (): DatabaseExport => {
  return {
    students: getStudents(),
    attendance: getAttendanceRecords(),
    exportDate: new Date().toISOString(),
    version: DB_VERSION,
  };
};

export const importDatabase = (data: DatabaseExport): void => {
  try {
    if (data.students) {
      saveStudents(data.students);
    }
    if (data.attendance) {
      saveAttendanceRecords(data.attendance);
    }
  } catch (error) {
    console.error("Error importing database:", error);
    throw error;
  }
};

export const clearAllData = (): void => {
  localStorage.removeItem(STUDENTS_KEY);
  localStorage.removeItem(ATTENDANCE_KEY);
};
