import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Printer } from "lucide-react";
import { getStudents } from "@/lib/storage";
import { Student } from "@/types/student";
import { QRCodeSVG } from "qrcode.react";

const AllStudentCards = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/students")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">بطاقات جميع التلاميذ</h2>
            <p className="text-muted-foreground">لا يوجد تلاميذ لطباعة بطاقاتهم</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 print:hidden">
        <Button variant="outline" size="icon" onClick={() => navigate("/students")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground">بطاقات جميع التلاميذ</h2>
          <p className="text-muted-foreground">طباعة {students.length} بطاقة</p>
        </div>
        <Button onClick={handlePrint} className="gradient-primary">
          <Printer className="w-4 h-4 ml-2" />
          طباعة جميع البطاقات
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 print:grid-cols-1 print:gap-6">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white border-[6px] border-black shadow-lg print:shadow-none print:break-inside-avoid print:mb-8"
            style={{ maxWidth: "600px", aspectRatio: "1.6/1", margin: "0 auto" }}
          >
            {/* Header Section */}
            <div className="border-b-4 border-black px-4 py-2">
              <div className="text-center space-y-0.5">
                <p className="text-[10px] font-bold text-black">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <p className="text-[10px] font-bold text-black">وزارة التربية الوطنية</p>
                <p className="text-xs font-bold text-black mt-1">ثانوية مالك بن نبي</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100%-70px)]">
              {/* QR Code Section - Left */}
              <div className="w-1/4 border-l-4 border-black flex flex-col items-center justify-center p-3 space-y-2">
                <div className="p-2 bg-white border-2 border-black">
                  <QRCodeSVG value={student.studentId} size={80} level="H" includeMargin={false} />
                </div>
                <p className="text-[10px] font-bold text-black text-center">2025/2026</p>
              </div>

              {/* Info Section - Right */}
              <div className="w-3/4 flex flex-col justify-center p-4 space-y-2">
                <div className="flex justify-between items-center border-b-2 border-black pb-1">
                  <span className="font-bold text-black text-base">{student.name}</span>
                  <span className="text-sm text-black font-semibold">:اللقب والاسم</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-black pb-1">
                  <span className="font-bold text-black text-base">{student.grade}</span>
                  <span className="text-sm text-black font-semibold">:القسم</span>
                </div>
                <div className="flex justify-between items-center border-b-2 border-black pb-1">
                  <span className="font-bold text-black text-base">{student.studentId}</span>
                  <span className="text-sm text-black font-semibold">:رقم التعريف الوطني</span>
                </div>
                {student.gender && (
                  <div className="flex justify-between items-center border-b-2 border-black pb-1">
                    <span className="font-bold text-black text-sm">{student.gender}</span>
                    <span className="text-xs text-black font-semibold">:الجنس</span>
                  </div>
                )}
                {student.status && (
                  <div className="flex justify-between items-center border-b-2 border-black pb-1">
                    <span className="font-bold text-black text-sm">{student.status}</span>
                    <span className="text-xs text-black font-semibold">:الصفة</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .grid, .grid * {
            visibility: visible;
          }
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print\\:gap-6 {
            gap: 1.5cm;
          }
          .print\\:mb-8 {
            margin-bottom: 1.5cm;
          }
          /* تحسين جودة الطباعة */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AllStudentCards;
