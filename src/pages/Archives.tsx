import { useState, useEffect } from "react";
import { Archive, Download, Trash2, RotateCcw, Database, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getArchives, createArchive, restoreFromArchive, deleteArchive, Archive as ArchiveType } from "@/lib/storage";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Archives() {
  const [archives, setArchives] = useState<ArchiveType[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<ArchiveType | null>(null);

  const loadArchives = () => {
    const loadedArchives = getArchives().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setArchives(loadedArchives);
  };

  useEffect(() => {
    loadArchives();
  }, []);

  const handleCreateArchive = () => {
    try {
      const archive = createArchive();
      loadArchives();
      toast.success("تم إنشاء نسخة احتياطية بنجاح");
    } catch (error) {
      toast.error("حدث خطأ في إنشاء النسخة الاحتياطية");
    }
  };

  const handleRestore = () => {
    if (!selectedArchive) return;
    
    try {
      const success = restoreFromArchive(selectedArchive.id);
      if (success) {
        toast.success("تم استرجاع البيانات بنجاح");
        setRestoreDialogOpen(false);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("فشل استرجاع البيانات");
      }
    } catch (error) {
      toast.error("حدث خطأ في استرجاع البيانات");
    }
  };

  const handleDelete = () => {
    if (!selectedArchive) return;
    
    try {
      deleteArchive(selectedArchive.id);
      loadArchives();
      toast.success("تم حذف النسخة الاحتياطية");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("حدث خطأ في حذف النسخة الاحتياطية");
    }
  };

  const handleDownload = (archive: ArchiveType) => {
    try {
      const dataStr = JSON.stringify(archive.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `archive-${archive.date}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("تم تنزيل النسخة الاحتياطية");
    } catch (error) {
      toast.error("حدث خطأ في التنزيل");
    }
  };

  const handleShare = async (archive: ArchiveType) => {
    try {
      const dataStr = JSON.stringify(archive.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const file = new File([blob], `archive-${archive.date}.json`, {
        type: "application/json",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `نسخة احتياطية - ${archive.date}`,
          text: "نسخة احتياطية من قاعدة بيانات الحضور",
        });
        toast.success("تم مشاركة النسخة الاحتياطية");
      } else {
        toast.error("متصفحك لا يدعم مشاركة الملفات");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("حدث خطأ في المشاركة");
      }
    }
  };

  const formatDateTime = (timestamp: string) => {
    return format(new Date(timestamp), "PPpp", { locale: ar });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Archive className="h-8 w-8" />
            أرشيف النسخ الاحتياطية
          </h1>
          <p className="text-muted-foreground mt-2">
            يتم إنشاء نسخة احتياطية تلقائيًا كل يوم في الساعة 10 صباحًا
          </p>
        </div>
        <Button onClick={handleCreateArchive} className="gap-2">
          <Database className="h-4 w-4" />
          إنشاء نسخة احتياطية الآن
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>النسخ الاحتياطية المحفوظة</CardTitle>
          <CardDescription>
            آخر 30 نسخة احتياطية محفوظة محليًا على جهازك
          </CardDescription>
        </CardHeader>
        <CardContent>
          {archives.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>لا توجد نسخ احتياطية محفوظة بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {archives.map((archive) => (
                <div
                  key={archive.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{archive.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateTime(archive.timestamp)}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2 flex gap-4">
                      <span>الطلاب: {archive.data.students.length}</span>
                      <span>سجلات الحضور: {archive.data.attendance.length}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(archive)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      تنزيل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(archive)}
                      className="gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      مشاركة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedArchive(archive);
                        setRestoreDialogOpen(true);
                      }}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      استرجاع
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedArchive(archive);
                        setDeleteDialogOpen(true);
                      }}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">ملاحظات هامة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• يتم إنشاء نسخة احتياطية تلقائيًا كل يوم في الساعة 10 صباحًا عند فتح التطبيق</p>
          <p>• يتم الاحتفاظ بآخر 30 نسخة احتياطية فقط</p>
          <p>• النسخ الاحتياطية محفوظة محليًا على جهازك</p>
          <p>• يمكنك إنشاء نسخة احتياطية يدويًا في أي وقت</p>
          <p>• عند استرجاع نسخة احتياطية، سيتم استبدال البيانات الحالية بالكامل</p>
          <p className="text-destructive font-medium">⚠️ تأكد من تنزيل نسخة احتياطية قبل مسح بيانات المتصفح</p>
        </CardContent>
      </Card>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>استرجاع النسخة الاحتياطية</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من استرجاع هذه النسخة الاحتياطية؟
              <br />
              سيتم استبدال جميع البيانات الحالية بالبيانات من تاريخ{" "}
              <strong>{selectedArchive?.date}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              استرجاع
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف النسخة الاحتياطية</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف النسخة الاحتياطية من تاريخ{" "}
              <strong>{selectedArchive?.date}</strong>؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
