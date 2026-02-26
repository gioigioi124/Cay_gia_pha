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
const buildTreeData = (members) => {
  const nodes = [];
  const edges = [];

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
  const sortedLevels = Object.entries(levelMap).sort(
    (a, b) => Number(a[0]) - Number(b[0]),
  );

  sortedLevels.forEach(([levelStr, levelMembers]) => {
    const level = parseInt(levelStr);
    const spacing = 320; // more spacing for wider views

    // Calculate desired X for each member based on parents' X
    const getDesiredX = (m) => {
      if (!m.parents || m.parents.length === 0) return null;
      let sum = 0;
      let count = 0;
      m.parents.forEach((p) => {
        const pId = typeof p === "object" ? p._id : p;
        if (posMap[pId]) {
          sum += posMap[pId].x + 70; // Node width compensation
          count++;
        }
      });
      return count > 0 ? sum / count - 70 : null;
    };

    // Group spouses together into clusters
    const clusters = [];
    const addedToCluster = new Set();

    levelMembers.forEach((m) => {
      if (addedToCluster.has(m._id)) return;

      const cluster = [];
      const queue = [m];
      addedToCluster.add(m._id);

      while (queue.length > 0) {
        const curr = queue.shift();
        cluster.push(curr);

        curr.spouses?.forEach((s) => {
          const sId =
            typeof s.memberId === "object" ? s.memberId._id : s.memberId;
          if (!addedToCluster.has(sId)) {
            const spouseObj = levelMembers.find((x) => x._id === sId);
            if (spouseObj) {
              addedToCluster.add(sId);
              queue.push(spouseObj);
            }
          }
        });
      }

      // Calculate desiredX for the cluster
      let sum = 0;
      let count = 0;
      cluster.forEach((cm) => {
        const dx = getDesiredX(cm);
        if (dx !== null) {
          sum += dx;
          count++;
        }
      });
      cluster.desiredX = count > 0 ? sum / count : 0;
      clusters.push(cluster);
    });

    // Sort clusters by desiredX
    clusters.sort((a, b) => a.desiredX - b.desiredX);

    // Flatten clusters to sortedMembers, sorting inside each cluster
    const sortedMembers = [];
    clusters.forEach((cluster) => {
      cluster.sort((a, b) => {
        const dxA = getDesiredX(a);
        const dxB = getDesiredX(b);
        if (dxA !== null && dxB !== null) return dxA - dxB;
        if (dxA !== null) return -1; // Members with parents come first within cluster
        if (dxB !== null) return 1;
        return a._id.localeCompare(b._id); // Stable fallback
      });
      sortedMembers.push(...cluster);
    });

    let sumX = 0;
    let countX = 0;
    sortedMembers.forEach((m) => {
      const dx = getDesiredX(m);
      if (dx !== null) {
        sumX += dx;
        countX++;
      }
    });

    const avgX = countX > 0 ? sumX / countX : 0;
    const startX = avgX - ((sortedMembers.length - 1) * spacing) / 2;

    sortedMembers.forEach((member, index) => {
      const pos = { x: startX + index * spacing, y: level * 300 };
      posMap[member._id] = pos;
      nodes.push({
        id: member._id,
        type: "treeNode",
        position: pos,
        data: { member },
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
      // Only create one edge per spouse pair
      if (member._id < spouseId) {
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
