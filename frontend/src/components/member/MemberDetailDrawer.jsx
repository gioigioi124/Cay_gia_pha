import {
  X,
  Calendar,
  MapPin,
  Users,
  Heart,
  Edit,
  Trash2,
  UserCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, calculateAge, getGenderLabel } from "@/utils/helpers";
import AvatarUpload from "@/components/common/AvatarUpload";
import { uploadMemberAvatar } from "@/services/uploadService";

const MemberDetailDrawer = ({
  member,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onSelectMember,
  onAvatarUpdate,
}) => {
  if (!member) return null;

  const genderBg = {
    male: "from-blue-500 to-indigo-500",
    female: "from-pink-500 to-rose-500",
    other: "from-purple-500 to-violet-500",
  };

  const age = calculateAge(member.dateOfBirth, member.dateOfDeath);

  const getRelativeName = (rel) => {
    if (typeof rel === "object" && rel !== null) return rel.fullName;
    return "Không rõ";
  };

  const getRelativeId = (rel) => {
    if (typeof rel === "object" && rel !== null) return rel._id;
    return rel;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-0">
          <SheetTitle className="sr-only">Chi tiết thành viên</SheetTitle>
        </SheetHeader>

        {/* Header with avatar */}
        <div className="flex flex-col items-center gap-3 py-6 border-b border-border/40">
          <AvatarUpload
            key={member._id}
            currentAvatar={member.avatar}
            name={member.fullName}
            size="lg"
            colorClass={genderBg[member.gender]}
            onUpload={async (file) => {
              const res = await uploadMemberAvatar(member._id, file);
              if (
                res?.success &&
                res?.data &&
                typeof onAvatarUpdate === "function"
              ) {
                onAvatarUpdate(res.data.member);
              }
            }}
          />

          <div className="text-center">
            <h2 className="text-xl font-bold">{member.fullName}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {getGenderLabel(member.gender)}
              </span>
              {age !== null && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {age} tuổi
                  </span>
                </>
              )}
              {!member.isAlive && (
                <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  Đã mất
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => {
                onEdit(member);
                onClose();
              }}
            >
              <Edit className="h-3.5 w-3.5" />
              Sửa
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950"
              onClick={() => {
                onDelete(member._id);
                onClose();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa
            </Button>
          </div>
        </div>

        {/* Info section */}
        <div className="py-4 space-y-4">
          {/* Basic info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Thông tin cá nhân
            </h3>

            {member.dateOfBirth && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ngày sinh</p>
                  <p className="text-sm font-medium">
                    {formatDate(member.dateOfBirth)}
                  </p>
                </div>
              </div>
            )}

            {member.dateOfDeath && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500/10">
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ngày mất</p>
                  <p className="text-sm font-medium">
                    {formatDate(member.dateOfDeath)}
                  </p>
                </div>
              </div>
            )}

            {member.birthPlace && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <MapPin className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quê quán</p>
                  <p className="text-sm font-medium">{member.birthPlace}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          {member.bio && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Tiểu sử
                </h3>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {member.bio}
                </p>
              </div>
            </>
          )}

          {/* Parents */}
          {member.parents?.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Cha / Mẹ (
                  {member.parents.length})
                </h3>
                <div className="space-y-1.5">
                  {member.parents.map((parent, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => onSelectMember?.(getRelativeId(parent))}
                    >
                      <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">
                        {getRelativeName(parent)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Spouses */}
          {member.spouses?.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" /> Vợ / Chồng (
                  {member.spouses.length})
                </h3>
                <div className="space-y-1.5">
                  {member.spouses.map((spouse, i) => {
                    const spouseMember = spouse.memberId;
                    return (
                      <button
                        key={i}
                        className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                        onClick={() =>
                          onSelectMember?.(getRelativeId(spouseMember))
                        }
                      >
                        <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <span className="text-sm font-medium">
                            {getRelativeName(spouseMember)}
                          </span>
                          {spouse.marriageDate && (
                            <p className="text-xs text-muted-foreground">
                              Kết hôn: {formatDate(spouse.marriageDate)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Children */}
          {member.children?.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Con cái (
                  {member.children.length})
                </h3>
                <div className="space-y-1.5">
                  {member.children.map((child, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => onSelectMember?.(getRelativeId(child))}
                    >
                      <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">
                        {getRelativeName(child)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MemberDetailDrawer;
