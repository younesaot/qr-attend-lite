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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
        {students.map((student) => (
          <Card
            key={student.id}
            className="overflow-hidden shadow-lg print:shadow-none border-2 border-primary/20 print:break-inside-avoid"
          >
            <div className="h-24 gradient-primary relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 right-2 w-20 h-20 bg-white/20 rounded-full" />
                <div className="absolute bottom-2 left-2 w-16 h-16 bg-white/20 rounded-full" />
              </div>
              <div className="relative h-full flex flex-col items-center justify-center gap-0.5">
                <h3 className="text-lg font-bold text-primary-foreground">ثانوية مالك بن نبي</h3>
                <p className="text-xs text-primary-foreground/90">بطاقة مطعم</p>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
                <p className="text-base text-muted-foreground">{student.grade}</p>
              </div>

              <div className="space-y-2 border-y border-border py-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الرقم التعريفي:</span>
                  <span className="font-bold text-primary">{student.studentId}</span>
                </div>
                {student.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الهاتف:</span>
                    <span className="font-medium text-foreground">{student.phone}</span>
                  </div>
                )}
                {student.parentPhone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">هاتف ولي الأمر:</span>
                    <span className="font-medium text-foreground">{student.parentPhone}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-white rounded-lg border-2 border-primary/20">
                  <QRCodeSVG value={student.studentId} size={140} level="H" includeMargin={false} />
                </div>
                <p className="text-xs text-muted-foreground text-center">امسح هذا الرمز لتسجيل الحضور</p>
              </div>

              <div className="pt-3 border-t border-border text-center text-xs text-muted-foreground">
                <p>صالح للعام الدراسي 2024-2025</p>
              </div>
            </CardContent>
          </Card>
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
