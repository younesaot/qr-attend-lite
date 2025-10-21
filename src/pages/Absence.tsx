import { useState, useEffect } from "react";
import { FileX, Download, Printer, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStudents, getTodayAttendance } from "@/lib/storage";
import { Student } from "@/types/student";
import * as XLSX from "xlsx";

const Absence = () => {
  const [absentStudents, setAbsentStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadAbsentStudents();
  }, [selectedDate]);

  const loadAbsentStudents = () => {
    const allStudents = getStudents();
    const attendanceRecords = getTodayAttendance();
    
    // Find students who haven't attended
    const attendedIds = new Set(attendanceRecords.map(record => record.studentId));
    const absent = allStudents.filter(student => !attendedIds.has(student.studentId));
    
    setAbsentStudents(absent);
  };

  const filteredAbsent = absentStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    const data = filteredAbsent.map((student) => ({
      "الاسم": student.name,
      "الرقم التعريفي": student.studentId,
      "الصف": student.grade,
      "الهاتف": student.phone || "",
      "هاتف ولي الأمر": student.parentPhone || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الغياب");
    XLSX.writeFile(wb, `سجل_الغياب_${selectedDate}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold text-foreground">سجل الغياب</h1>
          <p className="text-muted-foreground mt-1">
            التلاميذ الغائبون اليوم ({filteredAbsent.length})
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileX className="w-5 h-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">
                البحث
              </label>
              <Input
                placeholder="ابحث بالاسم، الرقم التعريفي، أو الصف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">
                التاريخ
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredAbsent.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileX className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "لا توجد نتائج" : "لا يوجد غياب اليوم"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "حاول تغيير معايير البحث"
                : "جميع التلاميذ حضروا اليوم"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              التلاميذ الغائبون - {new Date(selectedDate).toLocaleDateString("ar-EG")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAbsent.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{student.name}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>الرقم: {student.studentId}</span>
                        <span>الصف: {student.grade}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    {student.phone && (
                      <p className="text-sm text-muted-foreground">
                        الهاتف: {student.phone}
                      </p>
                    )}
                    {student.parentPhone && (
                      <p className="text-sm text-muted-foreground">
                        ولي الأمر: {student.parentPhone}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: white;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Absence;
