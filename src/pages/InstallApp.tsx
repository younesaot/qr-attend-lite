import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error("التطبيق مثبت بالفعل أو المتصفح لا يدعم التثبيت");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success("تم تثبيت التطبيق بنجاح!");
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      toast.info("تم إلغاء التثبيت");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Smartphone className="h-6 w-6" />
                  تثبيت التطبيق
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  استخدم التطبيق على هاتفك مثل التطبيقات العادية
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-orange-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {isOnline ? "متصل" : "غير متصل"}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6">
          {/* Install Button Card */}
          <Card>
            <CardHeader>
              <CardTitle>تثبيت سريع</CardTitle>
            </CardHeader>
            <CardContent>
              {isInstallable ? (
                <Button
                  onClick={handleInstallClick}
                  size="lg"
                  className="w-full"
                >
                  <Download className="ml-2 h-5 w-5" />
                  تثبيت التطبيق الآن
                </Button>
              ) : (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-medium">التطبيق مثبت بالفعل</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    يمكنك الوصول إليه من شاشة هاتفك الرئيسية
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle>مميزات التطبيق</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">يعمل بدون إنترنت</p>
                    <p className="text-sm text-muted-foreground">
                      جميع البيانات محفوظة على جهازك ولا تحتاج اتصال بالإنترنت
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">أيقونة على الشاشة الرئيسية</p>
                    <p className="text-sm text-muted-foreground">
                      افتح التطبيق مباشرة من هاتفك مثل أي تطبيق آخر
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">سريع وموثوق</p>
                    <p className="text-sm text-muted-foreground">
                      يعمل بسرعة عالية ويحفظ بياناتك بشكل آمن
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">تحديثات تلقائية</p>
                    <p className="text-sm text-muted-foreground">
                      يتحدث التطبيق تلقائياً عند توفر نسخة جديدة
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Manual Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>طريقة التثبيت اليدوية</CardTitle>
              <CardDescription>
                إذا لم يعمل زر التثبيت التلقائي، اتبع هذه الخطوات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">📱 Android (Chrome):</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground mr-4">
                    <li>افتح قائمة المتصفح (⋮)</li>
                    <li>اختر "إضافة إلى الشاشة الرئيسية"</li>
                    <li>اضغط "إضافة" أو "تثبيت"</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium mb-2">📱 iPhone (Safari):</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground mr-4">
                    <li>اضغط على زر المشاركة (□↑)</li>
                    <li>اسحب لأسفل واختر "إضافة إلى الشاشة الرئيسية"</li>
                    <li>اضغط "إضافة"</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default InstallApp;
