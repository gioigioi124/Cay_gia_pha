import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

/**
 * Component upload avatar với preview
 * Props:
 *   currentAvatar: string | null — URL ảnh hiện tại
 *   name: string — tên thành viên/user (để lấy initials)
 *   onUpload: async (file: File) => void — callback khi user chọn file
 *   size?: 'sm' | 'md' | 'lg'
 *   colorClass?: string — gradient class cho AvatarFallback
 */
const AvatarUpload = ({
  currentAvatar,
  name = "",
  onUpload,
  size = "lg",
  colorClass = "from-emerald-500 to-teal-500",
}) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const sizeMap = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  const getInitials = (n) =>
    n
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh phải nhỏ hơn 5MB");
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      await onUpload(file);
      toast.success("Cập nhật ảnh thành công!");
    } catch {
      toast.error("Không thể tải ảnh lên. Kiểm tra Cloudinary credentials.");
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Reset input để chọn lại cùng file
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const displaySrc = preview || currentAvatar;

  return (
    <div
      className="relative group inline-block cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <Avatar className={sizeMap[size]}>
        {displaySrc && (
          <AvatarImage src={displaySrc} alt={name} className="object-cover" />
        )}
        <AvatarFallback
          className={`bg-linear-to-br ${colorClass} text-white text-lg font-bold`}
        >
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {/* Overlay */}
      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {isUploading ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <Camera className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
};

export default AvatarUpload;
