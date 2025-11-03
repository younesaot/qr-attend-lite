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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white border-[6px] border-black shadow-lg print:shadow-none print:break-inside-avoid print:mb-6"
            style={{ aspectRatio: "1.6/1", maxWidth: "600px", margin: "0 auto" }}
          >
            {/* Header Section */}
            <div className="border-b-4 border-black px-4 py-2">
              <div className="text-center space-y-0.5">
                <p className="text-[10px] font-bold text-black">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                <p className="text-[10px] font-bold text-black">وزارة التربية الوطنية</p>
                <p className="text-[10px] font-semibold text-black">مديرية التربية لولاية ادرار</p>
                <p className="text-[10px] font-semibold text-black">ثانوية سيدي عبد الله 2</p>
                <p className="text-[9px] text-black mt-1">الموسم الدراسي: 2023-2024</p>
              </div>
            </div>

            {/* Card Title */}
            <div className="text-center py-2 border-b-2 border-black">
              <h2 className="text-xl font-bold text-black">بطاقة الإطعام</h2>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100%-100px)]">
              {/* Photo Section - Left */}
              <div className="w-1/3 border-l-4 border-black flex items-center justify-center p-3">
                <div className="w-24 h-32 border-2 border-black bg-gray-100"></div>
              </div>

              {/* Info and QR Section - Right */}
              <div className="w-2/3 flex flex-col justify-between p-4">
                {/* Student Info */}
                <div className="space-y-2 text-right">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black text-base">{student.name}</span>
                    <span className="text-sm text-black">:اللقب والاسم</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black text-base">{student.studentId}</span>
                    <span className="text-sm text-black">:رقم التعريف</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black text-base">{student.grade}</span>
                    <span className="text-sm text-black">:القسم</span>
                  </div>
                  {student.phone && (
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-black text-sm">{student.phone}</span>
                      <span className="text-sm text-black">:رقم الهاتف</span>
                    </div>
                  )}
                </div>

                {/* QR Code Section */}
                <div className="flex justify-center">
                  <div className="p-2 bg-white border-2 border-black">
                    <QRCodeSVG value={student.studentId} size={100} level="H" includeMargin={false} />
                  </div>
                </div>
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
          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default AllStudentCards;
