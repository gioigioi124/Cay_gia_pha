import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = "default", text = "Đang tải..." }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-emerald-500`}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
