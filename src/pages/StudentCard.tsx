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
        <div
          ref={cardRef}
          className="w-full max-w-2xl bg-white border-[6px] border-black shadow-2xl print:shadow-none"
          style={{ aspectRatio: "1.6/1" }}
        >
          {/* Header Section */}
          <div className="border-b-4 border-black px-6 py-3">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-black">الجمهورية الجزائرية الديمقراطية الشعبية</p>
              <p className="text-xs font-bold text-black">وزارة التربية الوطنية</p>
              <p className="text-xs font-semibold text-black">مديرية التربية لولاية ادرار</p>
              <p className="text-xs font-semibold text-black">ثانوية سيدي عبد الله 2</p>
              <p className="text-[10px] text-black mt-1">الموسم الدراسي: 2023-2024</p>
            </div>
          </div>

          {/* Card Title */}
          <div className="text-center py-3 border-b-2 border-black">
            <h2 className="text-2xl font-bold text-black">بطاقة الإطعام</h2>
          </div>

          {/* Main Content */}
          <div className="flex h-[calc(100%-140px)]">
            {/* Photo Section - Left */}
            <div className="w-1/3 border-l-4 border-black flex items-center justify-center p-4">
              <div className="w-32 h-40 border-2 border-black bg-gray-100"></div>
            </div>

            {/* Info and QR Section - Right */}
            <div className="w-2/3 flex flex-col justify-between p-6">
              {/* Student Info */}
              <div className="space-y-3 text-right">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-black text-lg">{student.name}</span>
                  <span className="text-sm text-black">:اللقب والاسم</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-black text-lg">{student.studentId}</span>
                  <span className="text-sm text-black">:رقم التعريف</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-black text-lg">{student.grade}</span>
                  <span className="text-sm text-black">:القسم</span>
                </div>
                {student.phone && (
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black">{student.phone}</span>
                    <span className="text-sm text-black">:رقم الهاتف</span>
                  </div>
                )}
              </div>

              {/* QR Code Section */}
              <div className="flex justify-center">
                <div className="p-2 bg-white border-2 border-black">
                  <QRCodeSVG value={student.studentId} size={120} level="H" includeMargin={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
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
