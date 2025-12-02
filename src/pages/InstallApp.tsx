import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, CheckCircle, Wifi, WifiOff, Monitor, Apple, Chrome } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

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
      if (isIOS) {
        toast.info("على iPhone: اضغط زر المشاركة ثم 'إضافة إلى الشاشة الرئيسية'");
      } else {
        toast.error("التطبيق مثبت بالفعل أو المتصفح لا يدعم التثبيت");
      }
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
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Hero Section */}
      <Card className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
            <Smartphone className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">تحميل التطبيق</CardTitle>
          <CardDescription className="text-lg mt-2">
            ثبّت التطبيق على جهازك واستخدمه بدون إنترنت
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {isOnline ? "متصل بالإنترنت" : "غير متصل - التطبيق يعمل!"}
            </span>
          </div>

          {/* Main Install Button */}
          <Button
            onClick={handleInstallClick}
            size="lg"
            className="w-full max-w-md h-14 text-lg gap-3"
          >
            <Download className="h-6 w-6" />
            {isInstallable ? "تحميل التطبيق الآن" : isIOS ? "طريقة التثبيت على iPhone" : "تثبيت التطبيق"}
          </Button>

          {!isInstallable && !isIOS && (
            <p className="text-sm text-muted-foreground mt-3">
              ✓ التطبيق مثبت بالفعل أو جاهز للتثبيت من قائمة المتصفح
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Android Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Chrome className="h-5 w-5 text-green-600" />
              Android (Chrome)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">1</span>
                <span>افتح قائمة المتصفح (⋮) أعلى اليمين</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">2</span>
                <span>اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">3</span>
                <span>اضغط "تثبيت" في النافذة المنبثقة</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* iOS Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              iPhone / iPad (Safari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">1</span>
                <span>اضغط على زر المشاركة (□↑) أسفل الشاشة</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">2</span>
                <span>اسحب لأسفل واختر "إضافة إلى الشاشة الرئيسية"</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">3</span>
                <span>اضغط "إضافة" في أعلى اليمين</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* APK Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            تحويل إلى APK (للمطورين)
          </CardTitle>
          <CardDescription>
            لبناء تطبيق Android أصلي يحتاج Android Studio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2 overflow-x-auto">
            <p className="text-muted-foreground"># على جهاز الكمبيوتر:</p>
            <p>git clone [رابط المشروع من GitHub]</p>
            <p>npm install</p>
            <p>npx cap add android</p>
            <p>npm run build</p>
            <p>npx cap sync android</p>
            <p>npx cap open android</p>
            <p className="text-muted-foreground"># ثم من Android Studio: Build → Build APK</p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>مميزات التطبيق</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "يعمل بدون إنترنت", desc: "جميع البيانات محفوظة محلياً" },
              { title: "أيقونة على الشاشة", desc: "وصول سريع مثل أي تطبيق" },
              { title: "سريع وآمن", desc: "أداء عالي وحماية للبيانات" },
              { title: "تحديثات تلقائية", desc: "يتحدث عند توفر نسخة جديدة" },
            ].map((feature, i) => (
              <div key={i} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallApp;
