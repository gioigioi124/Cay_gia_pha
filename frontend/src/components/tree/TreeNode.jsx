import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TreeNode = memo(({ data }) => {
  const { member } = data;

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const genderBorder = {
    male: "border-blue-400",
    female: "border-pink-400",
    other: "border-purple-400",
  };

  const genderBg = {
    male: "from-blue-500 to-indigo-500",
    female: "from-pink-500 to-rose-500",
    other: "from-purple-500 to-violet-500",
  };

  return (
    <div
      className={`relative bg-card border-2 ${genderBorder[member.gender]} rounded-xl px-4 py-3 shadow-md min-w-[140px] text-center transition-all hover:shadow-xl hover:scale-105 cursor-pointer`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="bg-emerald-500! w-3! h-3!"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="bg-emerald-500! w-3! h-3!"
      />

      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-10 w-10">
          <AvatarFallback
            className={`bg-linear-to-br ${genderBg[member.gender]} text-white text-xs font-bold`}
          >
            {getInitials(member.fullName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold leading-tight">
            {member.fullName}
          </p>
          {member.dateOfBirth && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(member.dateOfBirth).getFullYear()}
              {member.dateOfDeath &&
                ` - ${new Date(member.dateOfDeath).getFullYear()}`}
            </p>
          )}
        </div>
        {!member.isAlive && (
          <span className="text-[9px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
            Đã mất
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="bg-emerald-500! w-3! h-3!"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="bg-emerald-500! w-3! h-3!"
      />
    </div>
  );
});

TreeNode.displayName = "TreeNode";

export default TreeNode;
