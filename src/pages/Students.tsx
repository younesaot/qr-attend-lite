import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, QrCode, Users as UsersIcon, Printer, Check, X } from "lucide-react";
import { getStudents, deleteStudent, addAttendanceRecord, checkIfMarkedToday, getAttendanceRecords, saveAttendanceRecords } from "@/lib/storage";
import { Student } from "@/types/student";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    setStudents(getStudents());
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setStudentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete);
      loadStudents();
      toast.success("تم حذف التلميذ بنجاح");
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleMarkPresent = (student: Student) => {
    if (checkIfMarkedToday(student.studentId)) {
      toast.info("التلميذ مسجل حضوره اليوم بالفعل");
      return;
    }

    const now = new Date();
    const record = {
      id: `attendance-${Date.now()}`,
      studentId: student.studentId,
      studentName: student.name,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      timestamp: now.getTime(),
    };

    addAttendanceRecord(record);
    toast.success(`تم تسجيل حضور ${student.name}`);
  };

  const handleMarkAbsent = (student: Student) => {
    const records = getAttendanceRecords();
    const today = new Date().toISOString().split("T")[0];
    
    const filteredRecords = records.filter(
      record => !(record.studentId === student.studentId && record.date === today)
    );

    if (filteredRecords.length === records.length) {
      toast.info("التلميذ غير مسجل حضوره اليوم");
      return;
    }

    saveAttendanceRecords(filteredRecords);
    toast.success(`تم تسجيل غياب ${student.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">إدارة التلاميذ</h2>
          <p className="text-muted-foreground">إضافة وتعديل وحذف بيانات التلاميذ</p>
        </div>
        <div className="flex gap-2">
          {students.length > 0 && (
            <Button 
              onClick={() => navigate("/students/print-all")} 
              size="lg" 
              variant="outline"
            >
              <Printer className="w-5 h-5 ml-2" />
              طباعة جميع البطاقات
            </Button>
          )}
          <Button onClick={() => navigate("/students/add")} size="lg" className="gradient-primary">
            <Plus className="w-5 h-5 ml-2" />
            إضافة تلميذ جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم، الرقم التعريفي، أو الصف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
      </Card>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">الصف: {student.grade}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الرقم التعريفي:</span>
                    <span className="font-medium text-foreground">{student.studentId}</span>
                  </div>
                  {student.gender && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الجنس:</span>
                      <span className="font-medium text-foreground">{student.gender}</span>
                    </div>
                  )}
                  {student.status && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الصفة:</span>
                      <span className="font-medium text-foreground">{student.status}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMarkPresent(student)}
                    >
                      <Check className="w-4 h-4 ml-1 text-green-600" />
                      حضور
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMarkAbsent(student)}
                    >
                      <X className="w-4 h-4 ml-1 text-red-600" />
                      غياب
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/students/card/${student.id}`)}
                    >
                      <QrCode className="w-4 h-4 ml-1" />
                      البطاقة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/students/edit/${student.id}`)}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(student.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <UsersIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              {searchQuery ? (
                <>
                  <p className="text-lg font-medium mb-2">لا توجد نتائج</p>
                  <p className="text-sm">جرّب البحث بكلمات مختلفة</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">لا يوجد تلاميذ مسجلون</p>
                  <p className="text-sm mb-4">ابدأ بإضافة تلاميذ جدد إلى النظام</p>
                  <Button onClick={() => navigate("/students/add")} className="gradient-primary">
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة أول تلميذ
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف بيانات التلميذ نهائياً. لن يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Students;
