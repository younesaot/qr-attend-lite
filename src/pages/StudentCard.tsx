import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Printer, Download } from "lucide-react";
import { getStudentById } from "@/lib/storage";
import { Student } from "@/types/student";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const StudentCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const foundStudent = getStudentById(id);
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        toast.error("التلميذ غير موجود");
        navigate("/students");
      }
    }
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const svg = cardRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${student?.studentId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast.success("تم تحميل رمز QR");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!student) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 print:hidden">
        <Button variant="outline" size="icon" onClick={() => navigate("/students")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground">بطاقة التلميذ</h2>
          <p className="text-muted-foreground">بطاقة {student.name} مع رمز QR</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadQR}>
            <Download className="w-4 h-4 ml-2" />
            تحميل QR
          </Button>
          <Button onClick={handlePrint} className="gradient-primary">
            <Printer className="w-4 h-4 ml-2" />
            طباعة البطاقة
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <Card
          ref={cardRef}
          className="w-full max-w-md overflow-hidden shadow-2xl print:shadow-none border-2 border-primary/20"
        >
          <div className="h-32 gradient-primary relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full" />
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/20 rounded-full" />
            </div>
            <div className="relative h-full flex flex-col items-center justify-center gap-1">
              <h3 className="text-2xl font-bold text-primary-foreground">ثانوية مالك بن نبي</h3>
              <p className="text-sm text-primary-foreground/90">بطاقة مطعم</p>
            </div>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-bold text-foreground">{student.name}</h2>
              <p className="text-lg text-muted-foreground">{student.grade}</p>
            </div>

            <div className="space-y-3 border-y border-border py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرقم التعريفي:</span>
                <span className="font-bold text-primary text-lg">{student.studentId}</span>
              </div>
              {student.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الهاتف:</span>
                  <span className="font-medium text-foreground">{student.phone}</span>
                </div>
              )}
              {student.parentPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">هاتف ولي الأمر:</span>
                  <span className="font-medium text-foreground">{student.parentPhone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-white rounded-lg border-2 border-primary/20">
                <QRCodeSVG value={student.studentId} size={180} level="H" includeMargin={false} />
              </div>
              <p className="text-sm text-muted-foreground text-center">امسح هذا الرمز لتسجيل الحضور</p>
            </div>

            <div className="pt-4 border-t border-border text-center text-xs text-muted-foreground">
              <p>صالح للعام الدراسي 2024-2025</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${cardRef.current ? `#${cardRef.current.id}` : ""}, 
          ${cardRef.current ? `#${cardRef.current.id}` : ""} * {
            visibility: visible;
          }
          @page {
            size: A4 portrait;
            margin: 2cm;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentCard;
