import { Link, useLocation } from "react-router-dom";
import { Home, QrCode, Users, FileText, FileX, Database, Archive, Share2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "الرئيسية" },
    { path: "/scan", icon: QrCode, label: "مسح QR" },
    { path: "/students", icon: Users, label: "التلاميذ" },
    { path: "/attendance", icon: FileText, label: "سجل الحضور" },
    { path: "/absence", icon: FileX, label: "سجل الغياب" },
    { path: "/database", icon: Database, label: "قاعدة البيانات" },
    { path: "/archives", icon: Archive, label: "الأرشيف" },
    { path: "/share", icon: Share2, label: "مشاركة" },
    { path: "/about", icon: Info, label: "من نحن" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg gradient-primary flex items-center justify-center">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-foreground">نظام الحضور</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">تسجيل الحضور بالـ QR Code</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card overflow-x-auto scrollbar-hide">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex gap-0.5 sm:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                    "border-b-2 min-w-fit",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xs:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6">{children}</main>

      <footer className="border-t border-border bg-card py-3 sm:py-4 mt-auto">
        <div className="container mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 نظام تسجيل الحضور - جميع الحقوق محفوظة</p>
          <p className="mt-1">
            تم التطوير بواسطة{" "}
            <Link to="/about" className="text-primary hover:underline font-medium">
              حاج جيلاني يونس
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
