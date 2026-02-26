import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateForInput } from "@/utils/helpers";

const memberSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Vui lòng chọn giới tính",
  }),
  dateOfBirth: z.string().optional(),
  dateOfDeath: z.string().optional(),
  birthPlace: z.string().optional(),
  bio: z.string().optional(),
  isAlive: z.boolean().default(true),
});

const MemberForm = ({
  isOpen,
  onClose,
  onSubmit,
  member = null,
  isLoading = false,
}) => {
  const isEditing = !!member;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          fullName: member.fullName,
          gender: member.gender,
          dateOfBirth: formatDateForInput(member.dateOfBirth),
          dateOfDeath: formatDateForInput(member.dateOfDeath),
          birthPlace: member.birthPlace || "",
          bio: member.bio || "",
          isAlive: member.isAlive,
        }
      : {
          fullName: "",
          gender: "male",
          dateOfBirth: "",
          dateOfDeath: "",
          birthPlace: "",
          bio: "",
          isAlive: true,
        },
  });

  const isAlive = watch("isAlive");

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Cập Nhật Thành Viên" : "Thêm Thành Viên Mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Chỉnh sửa thông tin thành viên gia đình"
              : "Điền thông tin để thêm thành viên mới vào gia phả"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên *</Label>
            <Input
              id="fullName"
              placeholder="Nguyễn Văn A"
              {...register("fullName")}
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Giới tính *</Label>
            <div className="flex gap-4">
              {[
                { value: "male", label: "Nam" },
                { value: "female", label: "Nữ" },
                { value: "other", label: "Khác" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register("gender")}
                    className="accent-emerald-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
            </div>

            {/* Is Alive */}
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  {...register("isAlive")}
                  className="accent-emerald-500"
                />
                <span className="text-sm">Còn sống</span>
              </label>
            </div>
          </div>

          {/* Date of Death (shown only if not alive) */}
          {!isAlive && (
            <div className="space-y-2">
              <Label htmlFor="dateOfDeath">Ngày mất</Label>
              <Input
                id="dateOfDeath"
                type="date"
                {...register("dateOfDeath")}
              />
            </div>
          )}

          {/* Birth Place */}
          <div className="space-y-2">
            <Label htmlFor="birthPlace">Quê quán</Label>
            <Input
              id="birthPlace"
              placeholder="Hà Nội, Việt Nam"
              {...register("birthPlace")}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Tiểu sử</Label>
            <textarea
              id="bio"
              placeholder="Ghi chú về thành viên..."
              {...register("bio")}
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberForm;
