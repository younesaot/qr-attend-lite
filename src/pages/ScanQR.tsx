import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Camera, AlertCircle } from "lucide-react";
import { getStudentByStudentId, addAttendanceRecord, checkIfMarkedToday } from "@/lib/storage";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const ScanQR = () => {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<any>(null);

  const handleScan = (result: any) => {
    if (!result || !result[0]?.rawValue) return;

    const decodedText = result[0].rawValue;
    const student = getStudentByStudentId(decodedText);

    if (!student) {
      toast.error("التلميذ غير موجود في النظام");
      setLastScan({
        success: false,
        message: "التلميذ غير موجود",
        time: new Date(),
      });
      return;
    }

    const alreadyMarked = checkIfMarkedToday(student.studentId);
    if (alreadyMarked) {
      toast.error(`تم تسجيل حضور ${student.name} مسبقاً اليوم`);
      setLastScan({
        success: false,
        message: `تم تسجيل حضور ${student.name} مسبقاً`,
        studentName: student.name,
        time: new Date(),
      });
      return;
    }

    const now = new Date();
    const record = {
      id: `att-${Date.now()}`,
      studentId: student.studentId,
      studentName: student.name,
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm:ss"),
      timestamp: now.getTime(),
    };

    addAttendanceRecord(record);
    toast.success(`تم تسجيل حضور ${student.name} بنجاح`);
    setLastScan({
      success: true,
      studentName: student.name,
      time: now,
    });
  };

  const handleError = (error: any) => {
    console.error("Scanner error:", error);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">مسح رمز QR</h2>
        <p className="text-muted-foreground">استخدم الكاميرا لمسح رمز QR الخاص بالتلميذ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>الكاميرا</span>
              <Button
                variant={scanning ? "destructive" : "default"}
                size="sm"
                onClick={() => setScanning(!scanning)}
              >
                {scanning ? "إيقاف" : "تشغيل"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted min-h-[300px] flex items-center justify-center">
                {scanning ? (
                  <Scanner
                    onScan={handleScan}
                    onError={handleError}
                    constraints={{
                      facingMode: "environment",
                    }}
                    styles={{
                      container: {
                        width: "100%",
                        height: "300px",
                      },
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">اضغط على "تشغيل" لتشغيل الكاميرا</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخر عملية مسح</CardTitle>
          </CardHeader>
          <CardContent>
            {lastScan ? (
              <div
                className={`p-6 rounded-lg border-2 ${
                  lastScan.success ? "bg-success-light border-success" : "bg-destructive/10 border-destructive"
                }`}
              >
                <div className="flex items-start gap-4">
                  {lastScan.success ? (
                    <CheckCircle className="w-12 h-12 text-success flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-destructive flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold mb-2 ${lastScan.success ? "text-success" : "text-destructive"}`}>
                      {lastScan.success ? "تم التسجيل بنجاح" : "فشل التسجيل"}
                    </h3>
                    {lastScan.studentName && (
                      <p className="text-foreground font-medium text-xl mb-2">{lastScan.studentName}</p>
                    )}
                    {lastScan.message && <p className="text-foreground mb-2">{lastScan.message}</p>}
                    <p className="text-sm text-muted-foreground">
                      {format(lastScan.time, "dd MMM yyyy - hh:mm:ss a", { locale: ar })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>لم يتم المسح بعد</p>
                <p className="text-sm mt-2">ابدأ بمسح رمز QR لتسجيل الحضور</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-2">ملاحظات هامة:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• تأكد من السماح للمتصفح بالوصول إلى الكاميرا</li>
                <li>• اجعل رمز QR في منتصف الإطار وواضحاً</li>
                <li>• يمكنك تسجيل حضور كل تلميذ مرة واحدة فقط في اليوم</li>
                <li>• سيتم حفظ السجلات تلقائياً في جهازك</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanQR;
