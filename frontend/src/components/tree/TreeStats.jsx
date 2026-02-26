import { useMemo } from "react";
import { Users, Heart, Baby, GitBranch, Skull, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { calculateAge } from "@/utils/helpers";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card className="border-border/40">
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const TreeStats = ({ members }) => {
  const stats = useMemo(() => {
    const total = members.length;
    const alive = members.filter((m) => m.isAlive).length;
    const deceased = total - alive;
    const male = members.filter((m) => m.gender === "male").length;
    const female = members.filter((m) => m.gender === "female").length;

    // Count unique spouse pairs
    const spousePairs = new Set();
    members.forEach((m) => {
      m.spouses?.forEach((s) => {
        const spouseId =
          typeof s.memberId === "object" ? s.memberId._id : s.memberId;
        const pair = [m._id, spouseId].sort().join("-");
        spousePairs.add(pair);
      });
    });

    // Calculate generations (max depth from root)
    const getDepth = (memberId, visited = new Set()) => {
      if (visited.has(memberId)) return 0;
      visited.add(memberId);
      const member = members.find((m) => m._id === memberId);
      if (!member || !member.children?.length) return 1;
      const childDepths = member.children.map((c) => {
        const cId = typeof c === "object" ? c._id : c;
        return getDepth(cId, new Set(visited));
      });
      return 1 + Math.max(...childDepths, 0);
    };

    const roots = members.filter((m) => !m.parents || m.parents.length === 0);
    const generations =
      roots.length > 0 ? Math.max(...roots.map((r) => getDepth(r._id))) : 1;

    // Average age of living members
    const livingWithBirthdate = members.filter(
      (m) => m.isAlive && m.dateOfBirth,
    );
    const avgAge =
      livingWithBirthdate.length > 0
        ? Math.round(
            livingWithBirthdate.reduce(
              (sum, m) => sum + (calculateAge(m.dateOfBirth) || 0),
              0,
            ) / livingWithBirthdate.length,
          )
        : null;

    return {
      total,
      alive,
      deceased,
      male,
      female,
      spousePairs: spousePairs.size,
      generations,
      avgAge,
    };
  }, [members]);

  if (members.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <StatCard
        icon={Users}
        label="Tổng thành viên"
        value={stats.total}
        color="bg-emerald-500"
      />
      <StatCard
        icon={Star}
        label="Đang sống"
        value={stats.alive}
        color="bg-blue-500"
      />
      <StatCard
        icon={Skull}
        label="Đã mất"
        value={stats.deceased}
        color="bg-gray-500"
      />
      <StatCard
        icon={Heart}
        label="Cặp vợ chồng"
        value={stats.spousePairs}
        color="bg-pink-500"
      />
      <StatCard
        icon={GitBranch}
        label="Thế hệ"
        value={stats.generations}
        color="bg-purple-500"
      />
      <StatCard
        icon={Baby}
        label="Tuổi TB (sống)"
        value={stats.avgAge !== null ? `${stats.avgAge}` : "—"}
        color="bg-orange-500"
      />
    </div>
  );
};

export default TreeStats;
