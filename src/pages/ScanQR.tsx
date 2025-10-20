import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Camera, XCircle, AlertCircle } from "lucide-react";
import { getStudentByStudentId, addAttendanceRecord, checkIfMarkedToday } from "@/lib/storage";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const ScanQR = () => {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<any>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    try {
      if (!qrReaderRef.current) return;

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      );

      setScanning(true);
      toast.success("تم بدء المسح");
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast.error("فشل بدء المسح - تأكد من السماح بالوصول للكاميرا");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop().then(() => {
          if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
          }
          setScanning(false);
          toast.info("تم إيقاف المسح");
        }).catch((err) => {
          console.error("Error stopping scanner:", err);
          setScanning(false);
        });
      } catch (error) {
        console.error("Error in stop process:", error);
        setScanning(false);
      }
    }
  };

  const onScanSuccess = (decodedText: string) => {
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

    const alreadyMarked = checkIfMarkedToday(student.id);
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
      studentId: student.id,
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

  const onScanFailure = (error: string) => {
    // Suppress continuous scanning errors in console
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop()
          .then(() => {
            if (scannerRef.current) {
              scannerRef.current.clear();
              scannerRef.current = null;
            }
          })
          .catch((err) => {
            console.error("Cleanup error:", err);
          });
      }
    };
  }, [scanning]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">مسح رمز QR</h2>
        <p className="text-muted-foreground">استخدم الكاميرا لمسح رمز QR الخاص بالتلميذ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الكاميرا</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                id="qr-reader"
                ref={qrReaderRef}
                className="rounded-lg overflow-hidden bg-muted min-h-[300px] flex items-center justify-center"
              >
                {!scanning && (
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">اضغط على "بدء المسح" لتشغيل الكاميرا</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!scanning ? (
                  <Button onClick={startScanning} className="flex-1" size="lg">
                    <Camera className="w-5 h-5 ml-2" />
                    بدء المسح
                  </Button>
                ) : (
                  <Button onClick={stopScanning} variant="destructive" className="flex-1" size="lg">
                    <XCircle className="w-5 h-5 ml-2" />
                    إيقاف المسح
                  </Button>
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
