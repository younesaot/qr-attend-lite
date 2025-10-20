import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, Calendar, CheckCircle, FileSpreadsheet } from "lucide-react";
import { getAttendanceRecords } from "@/lib/storage";
import { AttendanceRecord } from "@/types/student";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const Attendance = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const allRecords = getAttendanceRecords();
    setRecords(allRecords.reverse());
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || record.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const groupedByDate = filteredRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  const handleExportExcel = () => {
    if (filteredRecords.length === 0) {
      toast.error("لا توجد سجلات لتصديرها");
      return;
    }

    const data = filteredRecords.map((record) => ({
      "اسم التلميذ": record.studentName,
      "الرقم التعريفي": record.studentId,
      التاريخ: format(new Date(record.date), "dd/MM/yyyy", { locale: ar }),
      الوقت: record.time,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "سجل الحضور");

    const fileName = selectedDate
      ? `حضور-${selectedDate}.xlsx`
      : `حضور-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    XLSX.writeFile(wb, fileName);
    toast.success("تم تصدير الملف بنجاح");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">سجل الحضور</h2>
          <p className="text-muted-foreground">عرض وتصدير سجلات الحضور</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="print:hidden">
            <Download className="w-4 h-4 ml-2" />
            طباعة
          </Button>
          <Button onClick={handleExportExcel} className="gradient-success print:hidden">
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم أو الرقم التعريفي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <p className="text-sm text-muted-foreground">
            عدد السجلات: <span className="font-bold text-foreground">{filteredRecords.length}</span>
          </p>
          {selectedDate && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate("")}>
              إلغاء الفلتر
            </Button>
          )}
        </div>

        {Object.keys(groupedByDate).length > 0 ? (
          Object.entries(groupedByDate).map(([date, dateRecords]) => (
            <Card key={date}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {format(new Date(date), "EEEE، dd MMMM yyyy", { locale: ar })}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground bg-success-light px-3 py-1 rounded-full">
                    {dateRecords.length} حضور
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dateRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <div>
                          <p className="font-medium text-foreground">{record.studentName}</p>
                          <p className="text-sm text-muted-foreground">رقم: {record.studentId}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{record.time}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(record.timestamp), "hh:mm a", { locale: ar })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">لا توجد سجلات</p>
                <p className="text-sm">
                  {searchQuery || selectedDate ? "جرّب تغيير معايير البحث" : "لم يتم تسجيل أي حضور بعد"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Attendance;
