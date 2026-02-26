import { useState } from "react";
import { GitBranchPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getGenderLabel } from "@/utils/helpers";

const RELATIONSHIP_TYPES = [
  {
    value: "parent",
    label: "⬆️ Là cha/mẹ của",
    desc: "Thành viên A là cha/mẹ của thành viên B",
  },
  {
    value: "child",
    label: "⬇️ Là con của",
    desc: "Thành viên A là con của thành viên B",
  },
  {
    value: "spouse",
    label: "❤️ Là vợ/chồng của",
    desc: "Thành viên A kết hôn với thành viên B",
  },
];

const RelationshipForm = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  isLoading,
}) => {
  const [memberId, setMemberId] = useState("");
  const [relatedMemberId, setRelatedMemberId] = useState("");
  const [type, setType] = useState("parent");
  const [marriageDate, setMarriageDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!memberId || !relatedMemberId || memberId === relatedMemberId) return;
    onSubmit({
      memberId,
      relatedMemberId,
      type,
      marriageDate: marriageDate || undefined,
    });
    // reset
    setMemberId("");
    setRelatedMemberId("");
    setType("parent");
    setMarriageDate("");
  };

  const memberA = members.find((m) => m._id === memberId);
  const memberB = members.find((m) => m._id === relatedMemberId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranchPlus className="h-5 w-5 text-emerald-500" />
            Thêm Quan Hệ
          </DialogTitle>
          <DialogDescription>
            Kết nối quan hệ giữa hai thành viên trong cây gia phả
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Member A */}
          <div className="space-y-2">
            <Label>Thành viên A</Label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">-- Chọn thành viên --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.fullName} ({getGenderLabel(m.gender)})
                </option>
              ))}
            </select>
          </div>

          {/* Relationship type */}
          <div className="space-y-2">
            <Label>Loại quan hệ</Label>
            <div className="space-y-2">
              {RELATIONSHIP_TYPES.map((rel) => (
                <label
                  key={rel.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    type === rel.value
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border/40 hover:border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="relType"
                    value={rel.value}
                    checked={type === rel.value}
                    onChange={() => setType(rel.value)}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div>
                    <p className="text-sm font-medium">{rel.label}</p>
                    <p className="text-xs text-muted-foreground">{rel.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Member B */}
          <div className="space-y-2">
            <Label>Thành viên B</Label>
            <select
              value={relatedMemberId}
              onChange={(e) => setRelatedMemberId(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">-- Chọn thành viên --</option>
              {members
                .filter((m) => m._id !== memberId)
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.fullName} ({getGenderLabel(m.gender)})
                  </option>
                ))}
            </select>
          </div>

          {/* Preview */}
          {memberA && memberB && (
            <div className="p-3 rounded-lg bg-muted text-sm text-center text-muted-foreground">
              <span className="font-medium text-foreground">
                {memberA.fullName}
              </span>{" "}
              <span className="text-emerald-500 font-medium">
                {type === "parent" && "là cha/mẹ của"}
                {type === "child" && "là con của"}
                {type === "spouse" && "là vợ/chồng của"}
              </span>{" "}
              <span className="font-medium text-foreground">
                {memberB.fullName}
              </span>
            </div>
          )}

          {/* Marriage date (only for spouse) */}
          {type === "spouse" && (
            <div className="space-y-2">
              <Label htmlFor="marriageDate">Ngày kết hôn (tùy chọn)</Label>
              <input
                id="marriageDate"
                type="date"
                value={marriageDate}
                onChange={(e) => setMarriageDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          {/* Error */}
          {memberId && relatedMemberId && memberId === relatedMemberId && (
            <p className="text-sm text-red-500">
              Không thể thêm quan hệ với chính mình
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={
                isLoading ||
                !memberId ||
                !relatedMemberId ||
                memberId === relatedMemberId
              }
            >
              {isLoading ? "Đang lưu..." : "Thêm Quan Hệ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RelationshipForm;
