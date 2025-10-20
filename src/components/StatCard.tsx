import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success";
}

const StatCard = ({ title, value, icon: Icon, variant = "default" }: StatCardProps) => {
  const variantStyles = {
    default: "bg-card",
    primary: "gradient-primary text-primary-foreground",
    success: "gradient-success text-success-foreground",
  };

  return (
    <Card className={cn("p-6 transition-all hover:shadow-lg", variantStyles[variant])}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn("text-sm font-medium", variant === "default" ? "text-muted-foreground" : "opacity-90")}>
            {title}
          </p>
          <h3 className={cn("text-3xl font-bold mt-2", variant === "default" ? "text-foreground" : "")}>
            {value}
          </h3>
        </div>
        <div
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            variant === "default" ? "bg-primary/10 text-primary" : "bg-white/20"
          )}
        >
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
