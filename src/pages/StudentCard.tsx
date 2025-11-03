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
          className="w-full max-w-md bg-white border-[6px] border-black shadow-2xl print:shadow-none"
        >
          {/* Header Section */}
          <div className="border-b-4 border-black px-4 py-3">
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-black">الجمهورية الجزائرية الديمقراطية الشعبية</p>
              <p className="text-sm font-bold text-black">وزارة التربية الوطنية</p>
              <p className="text-base font-bold text-black mt-2">ثانوية مالك بن نبي</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Student Info */}
            <div className="space-y-4 text-right">
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="font-bold text-black text-lg">{student.name}</span>
                <span className="text-base text-black font-semibold">:اللقب والاسم</span>
              </div>
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="font-bold text-black text-lg">{student.grade}</span>
                <span className="text-base text-black font-semibold">:القسم</span>
              </div>
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="font-bold text-black text-lg">{student.studentId}</span>
                <span className="text-base text-black font-semibold">:رقم التعريف الوطني</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex justify-center pt-4">
              <div className="p-3 bg-white border-4 border-black">
                <QRCodeSVG value={student.studentId} size={150} level="H" includeMargin={false} />
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
