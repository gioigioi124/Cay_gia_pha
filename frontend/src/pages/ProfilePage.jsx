import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/common/Navbar";
import useAuthStore from "@/store/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import { changePassword, updateProfile } from "@/services/authService";
import { toast } from "sonner";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Mật khẩu hiện tại tối thiểu 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu mới không khớp",
    path: ["confirmPassword"],
  });

const ProfilePage = () => {
  const { user, fetchUser } = useAuth();
  const { user: storeUser } = useAuthStore();
  const currentUser = user || storeUser;

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPwd, setIsSavingPwd] = useState(false);

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleStartEditName = () => {
    setNewName(currentUser?.displayName || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setIsSavingName(true);
    try {
      await updateProfile({ displayName: newName.trim() });
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, displayName: newName.trim() }),
      );
      await fetchUser?.();
      toast.success("Đã cập nhật tên hiển thị!");
      setIsEditingName(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể cập nhật tên");
    } finally {
      setIsSavingName(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmitPassword = async (data) => {
    setIsSavingPwd(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsSavingPwd(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Hồ Sơ Cá Nhân</h1>

        {/* Avatar + Name section */}
        <Card className="mb-6 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-500" />
              Thông Tin Cá Nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-xl font-bold">
                  {getInitials(currentUser?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {currentUser?.displayName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.email}
                </p>
              </div>
            </div>

            <Separator />

            {/* Display Name editable */}
            <div className="space-y-2">
              <Label>Tên hiển thị</Label>
              {isEditingName ? (
                <div className="flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nhập tên mới..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setIsEditingName(false);
                    }}
                  />
                  <Button
                    size="icon"
                    className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                    onClick={handleSaveName}
                    disabled={isSavingName || !newName.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setIsEditingName(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
                  <span className="text-sm">{currentUser?.displayName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-muted-foreground hover:text-foreground"
                    onClick={handleStartEditName}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Sửa
                  </Button>
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/40 bg-muted/30">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {currentUser?.email}
                </span>
                <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-muted-foreground">
                  Không thể đổi
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-500" />
              Đổi Mật Khẩu
            </CardTitle>
            <CardDescription>
              Cập nhật mật khẩu để bảo mật tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmitPassword)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••"
                  {...register("currentPassword")}
                  className={errors.currentPassword ? "border-red-500" : ""}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-red-500">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••"
                  {...register("newPassword")}
                  className={errors.newPassword ? "border-red-500" : ""}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-500">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  {...register("confirmPassword")}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSavingPwd}
              >
                {isSavingPwd ? "Đang xử lý..." : "Đổi Mật Khẩu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;
