import { useMemo } from "react";
import {
  Users,
  Heart,
  Baby,
  GitBranch,
  Skull,
  Star,
  BarChart2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge } from "@/utils/helpers";

const STAT_ITEMS = [
  { key: "total", label: "Thành viên", color: "text-emerald-500", Icon: Users },
  { key: "alive", label: "Đang sống", color: "text-blue-500", Icon: Star },
  { key: "deceased", label: "Đã mất", color: "text-gray-400", Icon: Skull },
  {
    key: "spouses",
    label: "Cặp vợ chồng",
    color: "text-pink-500",
    Icon: Heart,
  },
  {
    key: "generations",
    label: "Thế hệ",
    color: "text-purple-500",
    Icon: GitBranch,
  },
  { key: "avgAge", label: "Tuổi TB", color: "text-orange-500", Icon: Baby },
];

/**
 * TreeStats — two usage modes:
 *
 * 1. Controlled (button lives outside, e.g. in header):
 *    Pass `open` + `onToggle` → renders ONLY the collapsible panel (no button).
 *
 * 2. Toggle button (standalone, for the header trigger):
 *    Pass `triggerOnly={true}` → renders ONLY the toggle button.
 *
 * 3. Self-contained (legacy):
 *    Omit `open`/`onToggle` → renders button + panel together (uncontrolled).
 */
const TreeStats = ({ members, open, onToggle, triggerOnly = false }) => {
  const stats = useMemo(() => {
    const total = members.length;
    const alive = members.filter((m) => m.isAlive).length;
    const deceased = total - alive;

    const spousePairs = new Set();
    members.forEach((m) => {
      m.spouses?.forEach((s) => {
        const sid =
          typeof s.memberId === "object" ? s.memberId._id : s.memberId;
        spousePairs.add([m._id, sid].sort().join("-"));
      });
    });

    const getDepth = (memberId, visited = new Set()) => {
      if (visited.has(memberId)) return 0;
      visited.add(memberId);
      const member = members.find((m) => m._id === memberId);
      if (!member?.children?.length) return 1;
      return (
        1 +
        Math.max(
          ...member.children.map((c) => {
            const cId = typeof c === "object" ? c._id : c;
            return getDepth(cId, new Set(visited));
          }),
          0,
        )
      );
    };

    const roots = members.filter((m) => !m.parents?.length);
    const generations =
      roots.length > 0 ? Math.max(...roots.map((r) => getDepth(r._id))) : 1;

    const living = members.filter((m) => m.isAlive && m.dateOfBirth);
    const avgAge =
      living.length > 0
        ? Math.round(
            living.reduce((s, m) => s + (calculateAge(m.dateOfBirth) || 0), 0) /
              living.length,
          )
        : null;

    return {
      total,
      alive,
      deceased,
      spouses: spousePairs.size,
      generations,
      avgAge: avgAge !== null ? avgAge : "—",
    };
  }, [members]);

  if (members.length === 0) return null;

  // ── Trigger-only mode: just render the button ──────────────────────────────
  if (triggerOnly) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 text-xs px-2.5 text-muted-foreground hover:text-foreground border-border/60"
        onClick={onToggle}
      >
        <BarChart2 className="h-3.5 w-3.5" />
        Thống kê
        <Badge
          variant="secondary"
          className="h-4 px-1 text-[10px] font-medium ml-0.5"
        >
          {stats.total}
        </Badge>
        {open ? (
          <ChevronUp className="h-3 w-3 ml-0.5" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-0.5" />
        )}
      </Button>
    );
  }

  // ── Panel-only mode: render just the collapsible stats strip ───────────────
  if (open !== undefined && onToggle !== undefined) {
    return open ? (
      <div className="flex flex-wrap gap-2 py-2 px-3 rounded-lg border border-border/40 bg-muted/20 animate-in fade-in slide-in-from-top-1 duration-150">
        {STAT_ITEMS.map(({ key, label, color, Icon }) => (
          <div
            key={key}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background border border-border/40 text-xs"
          >
            <Icon className={`h-3.5 w-3.5 ${color} shrink-0`} />
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-semibold">{stats[key]}</span>
          </div>
        ))}
      </div>
    ) : null;
  }

  // ── Legacy self-contained mode ─────────────────────────────────────────────
  // (kept for backwards-compat; TreePage no longer uses this path)
  return (
    <div className="mb-2">
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 text-xs px-2.5 text-muted-foreground hover:text-foreground border-border/60"
        onClick={onToggle}
      >
        <BarChart2 className="h-3.5 w-3.5" />
        Thống kê
        <Badge
          variant="secondary"
          className="h-4 px-1 text-[10px] font-medium ml-0.5"
        >
          {stats.total}
        </Badge>
      </Button>
    </div>
  );
};

export default TreeStats;
