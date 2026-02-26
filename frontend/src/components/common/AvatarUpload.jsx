import { useRef, useState } from "react";
import { Camera, Loader2, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleFileChange = (e) => {
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
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);

    // Reset input để có thể chọn lại cùng file nếu cần hủy
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      toast.success("Cập nhật ảnh thành công!");
      setSelectedFile(null);
      // Giữ preview để hiển thị ảnh mới (khi refresh avatar mới sẽ lấy từ auth store)
    } catch {
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
      setPreview(null);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setPreview(null);
    setSelectedFile(null);
  };

  const displaySrc = preview || currentAvatar;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative group inline-block cursor-pointer"
        onClick={() => !isUploading && inputRef.current?.click()}
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
        <div
          className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity ${
            isUploading
              ? "bg-black/40 opacity-100"
              : "bg-black/40 opacity-0 group-hover:opacity-100"
          }`}
        >
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

      {/* Buttons */}
      {selectedFile && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isUploading}
            className="h-8 bg-emerald-600 hover:bg-emerald-700"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <Check className="h-3.5 w-3.5 mr-1" />
            )}
            Lưu
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
            className="h-8"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Hủy
          </Button>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
