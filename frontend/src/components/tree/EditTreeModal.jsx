import { useState } from "react";
import { TreePine } from "lucide-react";
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

const EditTreeModal = ({ isOpen, onClose, tree, onSave, isLoading }) => {
  const [name, setName] = useState(tree?.name || "");
  const [description, setDescription] = useState(tree?.description || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-emerald-500" />
            Chỉnh Sửa Cây Gia Phả
          </DialogTitle>
          <DialogDescription>
            Cập nhật tên và mô tả cho cây gia phả
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="editTreeName">Tên cây gia phả *</Label>
            <Input
              id="editTreeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ví dụ: "Gia phả họ Nguyễn"'
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editTreeDesc">Mô tả (tùy chọn)</Label>
            <textarea
              id="editTreeDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về gia tộc..."
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTreeModal;
