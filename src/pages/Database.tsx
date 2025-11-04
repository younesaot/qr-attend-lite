import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, Database as DatabaseIcon, AlertCircle, FileSpreadsheet } from "lucide-react";
import { exportDatabase, importDatabase, clearAllData, getStudents, getAttendanceRecords, importStudentsFromExcel } from "@/lib/storage";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Database = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير قاعدة البيانات بنجاح");
    } catch (error) {
      toast.error("فشل تصدير قاعدة البيانات");
      console.error(error);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importDatabase(data);
        toast.success("تم استيراد قاعدة البيانات بنجاح");
        window.location.reload();
      } catch (error) {
        toast.error("فشل استيراد البيانات - تأكد من صحة الملف");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    clearAllData();
    toast.success("تم حذف جميع البيانات");
    window.location.reload();
  };

  const handleImportExcel = () => {
    excelInputRef.current?.click();
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const students = jsonData.map((row: any) => ({
          name: row["الاسم"] || row["name"] || row["Name"],
          studentId: String(row["الرقم التعريفي"] || row["studentId"] || row["StudentID"] || row["ID"]),
          grade: row["الصف"] || row["grade"] || row["Grade"],
          gender: row["الجنس"] || row["gender"] || row["Gender"] || "",
          status: row["الصفة"] || row["status"] || row["Status"] || "",
        }));

        const importedCount = importStudentsFromExcel(students);
        
        if (importedCount > 0) {
          toast.success(`تم استيراد ${importedCount} تلميذ بنجاح`);
          window.location.reload();
        } else {
          toast.info("جميع التلاميذ موجودون مسبقاً");
        }
      } catch (error) {
        toast.error("فشل استيراد ملف Excel - تأكد من صحة البيانات");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const students = getStudents();
  const records = getAttendanceRecords();
  
  // حساب عدد الغائبين اليوم
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter(record => record.date === today);
  const presentStudentIds = new Set(todayRecords.map(record => record.studentId));
  const absentCount = students.length - presentStudentIds.size;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">إدارة قاعدة البيانات</h2>
        <p className="text-muted-foreground">نقل البيانات وإدارة النسخ الاحتياطية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <DatabaseIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{students.length}</h3>
            <p className="text-sm text-muted-foreground">تلميذ مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <DatabaseIcon className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{records.length}</h3>
            <p className="text-sm text-muted-foreground">سجل حضور</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{absentCount}</h3>
            <p className="text-sm text-muted-foreground">تلميذ غائب اليوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <DatabaseIcon className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{((students.length + records.length) * 0.5).toFixed(1)} KB</h3>
            <p className="text-sm text-muted-foreground">حجم البيانات التقريبي</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تصدير واستيراد البيانات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 border-2 border-primary/20 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">تصدير البيانات</h4>
                  <p className="text-sm text-muted-foreground">احفظ نسخة احتياطية</p>
                </div>
              </div>
              <Button onClick={handleExport} className="w-full gradient-primary" size="lg">
                <Download className="w-5 h-5 ml-2" />
                تصدير قاعدة البيانات
              </Button>
              <p className="text-xs text-muted-foreground">سيتم حفظ ملف JSON يحتوي على جميع البيانات</p>
            </div>

            <div className="p-6 border-2 border-success/20 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">استيراد البيانات</h4>
                  <p className="text-sm text-muted-foreground">استعد نسخة احتياطية</p>
                </div>
              </div>
              <Button onClick={handleImport} variant="outline" className="w-full" size="lg">
                <Upload className="w-5 h-5 ml-2" />
                استيراد قاعدة البيانات
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">اختر ملف JSON من نسخة احتياطية سابقة</p>
            </div>

            <div className="p-6 border-2 border-accent/20 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">استيراد من Excel</h4>
                  <p className="text-sm text-muted-foreground">أضف تلاميذ من ملف Excel</p>
                </div>
              </div>
              <Button onClick={handleImportExcel} variant="outline" className="w-full" size="lg">
                <FileSpreadsheet className="w-5 h-5 ml-2" />
                استيراد تلاميذ من Excel
              </Button>
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelFileChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                الأعمدة المطلوبة: الاسم، الرقم التعريفي، الصف، الجنس، الصفة
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            المنطقة الخطرة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            احذر! حذف جميع البيانات سيؤدي إلى فقدان جميع معلومات التلاميذ وسجلات الحضور بشكل نهائي.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto">
                <Trash2 className="w-4 h-4 ml-2" />
                حذف جميع البيانات
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف جميع بيانات التلاميذ وسجلات الحضور نهائياً. هذا الإجراء لا يمكن التراجع عنه!
                  <br />
                  <br />
                  تأكد من تصدير نسخة احتياطية قبل المتابعة.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">
                  نعم، احذف كل شيء
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h4 className="font-bold text-foreground">نصائح هامة:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• احتفظ بنسخ احتياطية دورية من البيانات في مكان آمن</li>
                <li>• يمكنك نقل ملف JSON إلى أي جهاز آخر واستيراده</li>
                <li>• البيانات محفوظة محلياً في المتصفح فقط</li>
                <li>• مسح بيانات المتصفح سيؤدي إلى فقدان البيانات</li>
                <li>• شارك ملف النسخة الاحتياطية عبر البريد أو التخزين السحابي للوصول من أجهزة أخرى</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Database;
