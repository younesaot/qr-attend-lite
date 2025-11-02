import { useEffect, useState } from "react";
import { Users, CheckCircle, Calendar, TrendingUp, QrCode, Smartphone } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStudents, getTodayAttendance, getAttendanceRecords } from "@/lib/storage";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const students = getStudents();
    const today = getTodayAttendance();
    const allRecords = getAttendanceRecords();

    setTotalStudents(students.length);
    setTodayAttendance(today.length);
    setTotalRecords(allRecords.length);
    setRecentAttendance(allRecords.slice(-5).reverse());
  };

  const attendanceRate = totalStudents > 0 ? Math.round((todayAttendance / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">لوحة التحكم</h2>
        <p className="text-muted-foreground">نظرة عامة على نظام تسجيل الحضور</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي التلاميذ" value={totalStudents} icon={Users} variant="primary" />
        <StatCard title="حضور اليوم" value={todayAttendance} icon={CheckCircle} variant="success" />
        <StatCard title="نسبة الحضور" value={`${attendanceRate}%`} icon={TrendingUp} />
        <StatCard title="إجمالي السجلات" value={totalRecords} icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              ثبّت التطبيق على هاتفك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              استخدم التطبيق بدون إنترنت واحصل على تجربة أفضل مع التثبيت على هاتفك
            </p>
            <Link to="/install">
              <Button className="w-full" size="lg">
                <Smartphone className="ml-2 h-5 w-5" />
                تثبيت التطبيق الآن
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>آخر عمليات التسجيل</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-success-light border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{record.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.timestamp), "dd MMM yyyy - hh:mm a", { locale: ar })}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد سجلات حضور بعد</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">امسح رمز QR</p>
                  <p className="text-sm text-muted-foreground">لتسجيل حضور التلميذ بسرعة</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">إدارة التلاميذ</p>
                  <p className="text-sm text-muted-foreground">أضف وعدّل بيانات التلاميذ</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">تقارير مفصلة</p>
                  <p className="text-sm text-muted-foreground">اطلع على سجل الحضور الكامل</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
