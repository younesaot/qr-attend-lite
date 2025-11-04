import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Save } from "lucide-react";
import { addStudent, updateStudent, getStudentById } from "@/lib/storage";
import { Student } from "@/types/student";
import { toast } from "sonner";

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    grade: "",
    gender: "",
    status: "",
  });

  useEffect(() => {
    if (isEdit && id) {
      const student = getStudentById(id);
      if (student) {
        setFormData({
          name: student.name,
          studentId: student.studentId,
          grade: student.grade,
          gender: student.gender || "",
          status: student.status || "",
        });
      }
    }
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.studentId || !formData.grade) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (isEdit && id) {
      updateStudent(id, formData);
      toast.success("تم تحديث بيانات التلميذ بنجاح");
    } else {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
      };
      addStudent(newStudent);
      toast.success("تم إضافة التلميذ بنجاح");
    }

    navigate("/students");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/students")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {isEdit ? "تعديل بيانات التلميذ" : "إضافة تلميذ جديد"}
          </h2>
          <p className="text-muted-foreground">{isEdit ? "قم بتحديث المعلومات" : "أدخل بيانات التلميذ"}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البيانات الأساسية</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                اسم التلميذ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل الاسم الكامل"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">
                الرقم التعريفي <span className="text-destructive">*</span>
              </Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="مثال: 12345"
                required
              />
              <p className="text-xs text-muted-foreground">سيتم استخدام هذا الرقم في رمز QR</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">
                الصف الدراسي <span className="text-destructive">*</span>
              </Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="مثال: الصف الثالث"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">
                الجنس <span className="text-destructive">*</span>
              </Label>
              <Input
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                placeholder="ذكر أو أنثى"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                الصفة <span className="text-destructive">*</span>
              </Label>
              <Input
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="مثال: داخلي، نصف داخلي، خارجي"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 gradient-primary" size="lg">
                <Save className="w-5 h-5 ml-2" />
                {isEdit ? "حفظ التعديلات" : "إضافة التلميذ"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/students")} size="lg">
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentForm;
