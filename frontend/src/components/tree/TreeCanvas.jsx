import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ConnectionMode,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TreeNode from "./TreeNode";

const FamilyNode = () => (
  <div
    className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
    style={{ pointerEvents: "none" }}
  >
    <Handle
      id="top"
      type="target"
      position={Position.Top}
      className="opacity-0 w-0 h-0 min-w-0 min-h-0 border-0"
    />
    <Handle
      id="bottom"
      type="source"
      position={Position.Bottom}
      className="opacity-0 w-0 h-0 min-w-0 min-h-0 border-0"
    />
  </div>
);

const nodeTypes = { treeNode: TreeNode, familyNode: FamilyNode };

// Convert members data to React Flow nodes and edges
const buildTreeData = (originalMembers) => {
  const nodes = [];
  const edges = [];

  // Pre-process members to link co-parents as spouses for clustering and level calculation
  const membersMap = {};
  const members = originalMembers.map((m) => {
    const copy = { ...m, spouses: m.spouses ? [...m.spouses] : [] };
    membersMap[copy._id] = copy;
    return copy;
  });

  members.forEach((m) => {
    if (m.parents?.length === 2) {
      const p1Id =
        typeof m.parents[0] === "object" ? m.parents[0]._id : m.parents[0];
      const p2Id =
        typeof m.parents[1] === "object" ? m.parents[1]._id : m.parents[1];

      const p1 = membersMap[p1Id];
      const p2 = membersMap[p2Id];

      if (p1 && p2) {
        const hasP2 = p1.spouses.some(
          (s) =>
            (typeof s.memberId === "object" ? s.memberId._id : s.memberId) ===
            p2Id,
        );
        if (!hasP2) p1.spouses.push({ memberId: p2Id, implicit: true });

        const hasP1 = p2.spouses.some(
          (s) =>
            (typeof s.memberId === "object" ? s.memberId._id : s.memberId) ===
            p1Id,
        );
        if (!hasP1) p2.spouses.push({ memberId: p1Id, implicit: true });
      }
    }
  });

  // 1. Calculate generation levels iteratively to handle complex spouse/parent connections
  const levels = {};
  members.forEach((m) => {
    levels[m._id] = 0;
  });

  let changed = true;
  let iters = 0;
  while (changed && iters < 100) {
    changed = false;
    iters++;

    members.forEach((m) => {
      let currentLevel = levels[m._id];
      let newLevel = currentLevel;

      // Children must be 1 level below their lowest parent
      if (m.parents && m.parents.length > 0) {
        let maxParentLvl = -1;
        m.parents.forEach((p) => {
          const pId = typeof p === "object" ? p._id : p;
          if (levels[pId] !== undefined && levels[pId] > maxParentLvl) {
            maxParentLvl = levels[pId];
          }
        });
        if (maxParentLvl >= 0 && newLevel <= maxParentLvl) {
          newLevel = maxParentLvl + 1;
        }
      }

      // Spouses must be on the same level
      if (m.spouses && m.spouses.length > 0) {
        m.spouses.forEach((s) => {
          const sId =
            typeof s.memberId === "object" ? s.memberId._id : s.memberId;
          if (levels[sId] !== undefined && levels[sId] > newLevel) {
            newLevel = levels[sId]; // pull this member down to spouse's level
          }
        });
      }

      if (newLevel !== currentLevel) {
        levels[m._id] = newLevel;
        changed = true;
      }

      // Parents must be at least 1 level above this child (pull parents down if needed)
      if (m.parents && m.parents.length > 0) {
        m.parents.forEach((p) => {
          const pId = typeof p === "object" ? p._id : p;
          if (levels[pId] !== undefined && levels[pId] < levels[m._id] - 1) {
            levels[pId] = levels[m._id] - 1;
            changed = true;
          }
        });
      }

      // Also propagate spouse levels immediately to avoid delayed iterations
      if (m.spouses && m.spouses.length > 0) {
        m.spouses.forEach((s) => {
          const sId =
            typeof s.memberId === "object" ? s.memberId._id : s.memberId;
          if (levels[sId] !== undefined && levels[sId] < levels[m._id]) {
            levels[sId] = levels[m._id];
            changed = true;
          }
        });
      }
    });
  }

  // Normalize levels to start at 0
  let minLevel = Infinity;
  Object.values(levels).forEach((l) => {
    if (l < minLevel) minLevel = l;
  });
  if (minLevel !== 0 && minLevel !== Infinity) {
    Object.keys(levels).forEach((id) => {
      levels[id] -= minLevel;
    });
  }

  // 2. Group members by level
  const levelMap = {};
  members.forEach((m) => {
    const lvl = levels[m._id];
    if (!levelMap[lvl]) levelMap[lvl] = [];
    levelMap[lvl].push(m);
  });

  // 3. Create nodes with structured X and Y positions
  const posMap = {};
  const spacing = 220; // Khoảng cách giữa các thành viên

  const maxLevelNum = Math.max(...Object.keys(levelMap).map(Number));
  const levelClusters = {};

  Object.keys(levelMap).forEach((lvlStr) => {
    const levelMembers = levelMap[lvlStr];
    const clusters = [];
    const added = new Set();

    levelMembers.forEach((m) => {
      if (added.has(m._id)) return;
      const cluster = [];
      const queue = [m];
      added.add(m._id);

      while (queue.length > 0) {
        const curr = queue.shift();
        cluster.push(curr);
        curr.spouses?.forEach((s) => {
          const sId =
            typeof s.memberId === "object" ? s.memberId._id : s.memberId;
          if (!added.has(sId)) {
            const spouseObj = levelMembers.find((x) => x._id === sId);
            if (spouseObj) {
              added.add(sId);
              queue.push(spouseObj);
            }
          }
        });
      }
      clusters.push(cluster);
    });
    levelClusters[lvlStr] = clusters;
  });

  // TÍNH TOẠ ĐỘ: TỪ DƯỚI LÊN (Bottom-Up) để cha mẹ ở thẳng trên con cái
  for (let lvl = maxLevelNum; lvl >= 0; lvl--) {
    if (!levelClusters[lvl]) continue;
    const clusters = levelClusters[lvl];

    // Tính tâm lý tưởng dựa theo nhánh con
    clusters.forEach((cluster) => {
      let childSum = 0;
      let childCount = 0;
      cluster.forEach((m) => {
        m.children?.forEach((c) => {
          const cId = typeof c === "object" ? c._id : c;
          if (posMap[cId]) {
            childSum += posMap[cId].x;
            childCount++;
          }
        });
      });
      cluster.desiredCenter = childCount > 0 ? childSum / childCount : null;
    });

    // Sắp xếp các cụm: ưu tiên cụm có con xếp trước theo chiều x để bảo toàn đường chéo tối ưu
    clusters.sort((a, b) => {
      if (a.desiredCenter !== null && b.desiredCenter !== null)
        return a.desiredCenter - b.desiredCenter;
      if (a.desiredCenter !== null) return -1;
      if (b.desiredCenter !== null) return 1;
      return 0;
    });

    let currentX = 0;
    clusters.forEach((cluster, i) => {
      const width = (cluster.length - 1) * spacing;
      let startX = 0;

      if (cluster.desiredCenter !== null) {
        startX = cluster.desiredCenter - width / 2;
      } else {
        startX = i === 0 ? 0 : currentX;
      }

      // Chống chồng lấp cụm trước
      if (startX < currentX) {
        startX = currentX;
      }

      cluster.startX = startX;
      currentX = startX + cluster.length * spacing + 60; // Thêm 60px đệm giữa các gia đình
    });

    // Cập nhật posMap
    clusters.forEach((cluster) => {
      cluster.forEach((m, index) => {
        posMap[m._id] = { x: cluster.startX + index * spacing, y: lvl * 300 };
      });
    });
  }

  // Tái căn chỉnh trục trung tâm của đồ thị về chính giữa màn hình
  let cx = 0,
    cCount = 0;
  Object.values(posMap).forEach((p) => {
    cx += p.x;
    cCount++;
  });
  const bx = cCount > 0 ? cx / cCount : 0;

  // Add dứt điểm nodes vào mảng Flow
  Object.keys(levelClusters).forEach((lvlStr) => {
    levelClusters[lvlStr].forEach((cluster) => {
      cluster.forEach((member) => {
        const finalX = posMap[member._id].x - bx;
        posMap[member._id].x = finalX; // Lưu ngược lại cho FamilyNode vẽ mũi tên
        nodes.push({
          id: member._id,
          type: "treeNode",
          position: { x: finalX, y: parseInt(lvlStr) * 300 },
          data: { member },
        });
      });
    });
  });

  // Identify parent pairs
  const familyPairs = {};
  members.forEach((m) => {
    if (m.parents?.length === 2) {
      const p1 =
        typeof m.parents[0] === "object" ? m.parents[0]._id : m.parents[0];
      const p2 =
        typeof m.parents[1] === "object" ? m.parents[1]._id : m.parents[1];
      const sorted = [p1, p2].sort();
      const key = `${sorted[0]}-${sorted[1]}`;
      if (!familyPairs[key]) {
        familyPairs[key] = {
          parent1: sorted[0],
          parent2: sorted[1],
          children: [],
        };
      }
      familyPairs[key].children.push(m._id);
    }
  });

  const processedChildren = new Set();

  Object.values(familyPairs).forEach((family) => {
    const p1Pos = posMap[family.parent1];
    const p2Pos = posMap[family.parent2];

    if (p1Pos && p2Pos) {
      const familyId = `family-${family.parent1}-${family.parent2}`;
      const fx = (p1Pos.x + p2Pos.x) / 2 + 70 - 3; // +70 offset to reach visual center, -3 half object width
      const fy = Math.max(p1Pos.y, p2Pos.y) + 150;

      nodes.push({
        id: familyId,
        type: "familyNode",
        position: { x: fx, y: fy },
        data: {},
        selectable: true,
        draggable: true,
      });

      edges.push({
        id: `fedge-p1-${familyId}`,
        source: family.parent1,
        target: familyId,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "bezier",
        animated: false,
        style: { stroke: "#10b981", strokeWidth: 2 },
      });

      edges.push({
        id: `fedge-p2-${familyId}`,
        source: family.parent2,
        target: familyId,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "bezier",
        animated: false,
        style: { stroke: "#10b981", strokeWidth: 2 },
      });

      family.children.forEach((childId) => {
        edges.push({
          id: `fedge-child-${familyId}-${childId}`,
          source: familyId,
          target: childId,
          sourceHandle: "bottom",
          targetHandle: "top",
          type: "bezier",
          animated: false,
          style: { stroke: "#10b981", strokeWidth: 2 },
        });
        processedChildren.add(childId);
      });
    }
  });

  // Create edges from parent-child relationships
  members.forEach((member) => {
    member.parents?.forEach((parent) => {
      if (member.parents.length === 2 && processedChildren.has(member._id)) {
        return;
      }

      const parentId = typeof parent === "object" ? parent._id : parent;
      edges.push({
        id: `${parentId}-${member._id}`,
        source: parentId,
        target: member._id,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "bezier",
        animated: false,
        style: { stroke: "#10b981", strokeWidth: 2 },
      });
    });

    // Spouse edges
    member.spouses?.forEach((spouse) => {
      const spouseId =
        typeof spouse.memberId === "object"
          ? spouse.memberId._id
          : spouse.memberId;
      // Only create one edge per spouse pair, skipping implicitly inferred ones
      if (member._id < spouseId && !spouse.implicit) {
        edges.push({
          id: `spouse-${member._id}-${spouseId}`,
          source: member._id,
          target: spouseId,
          sourceHandle: "right",
          targetHandle: "left",
          type: "bezier",
          style: { stroke: "#f43f5e", strokeWidth: 2, strokeDasharray: "5,5" },
          label: "❤️",
        });
      }
    });
  });

  return { nodes, edges };
};

const TreeCanvas = ({ members, onNodeClick, onConnectNodes }) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildTreeData(members),
    [members],
  );

  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, _setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClickHandler = useCallback(
    (event, node) => {
      onNodeClick?.(node.data.member);
    },
    [onNodeClick],
  );

  const onConnectHandler = useCallback(
    (connection) => {
      onConnectNodes?.(connection);
    },
    [onConnectNodes],
  );

  return (
    <div id="tree-canvas-export" className="w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        onConnect={onConnectHandler}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Controls className="bg-background! border-border/40! shadow-md!" />
        <MiniMap
          className="bg-background! border-border/40!"
          nodeColor="#10b981"
          maskColor="rgba(0,0,0,0.1)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
        />
      </ReactFlow>
    </div>
  );
};

export default TreeCanvas;
