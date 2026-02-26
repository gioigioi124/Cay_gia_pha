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

  // Create a position map - simple tree layout
  const levelMap = {};
  const visited = new Set();

  // Find root members (those with no parents)
  const roots = members.filter((m) => !m.parents || m.parents.length === 0);

  // BFS to assign levels
  const queue = roots.map((r) => ({ member: r, level: 0 }));
  while (queue.length > 0) {
    const { member, level } = queue.shift();
    if (visited.has(member._id)) continue;
    visited.add(member._id);

    if (!levelMap[level]) levelMap[level] = [];
    levelMap[level].push(member);

    // Add children to queue
    const children = members.filter((m) =>
      m.parents?.some((p) => {
        const parentId = typeof p === "object" ? p._id : p;
        return parentId === member._id;
      }),
    );
    children.forEach((child) => {
      if (!visited.has(child._id)) {
        queue.push({ member: child, level: level + 1 });
      }
    });
  }

  // Add remaining members not in hierarchy
  members.forEach((m) => {
    if (!visited.has(m._id)) {
      const maxLevel = Math.max(...Object.keys(levelMap).map(Number), 0);
      if (!levelMap[maxLevel + 1]) levelMap[maxLevel + 1] = [];
      levelMap[maxLevel + 1].push(m);
    }
  });

  // Create nodes with positions
  const posMap = {};
  Object.entries(levelMap).forEach(([level, levelMembers]) => {
    const spacing = 200;
    const startX = (-(levelMembers.length - 1) * spacing) / 2;

    levelMembers.forEach((member, index) => {
      const pos = { x: startX + index * spacing, y: parseInt(level) * 240 };
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
      const fy = Math.max(p1Pos.y, p2Pos.y) + 160;

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
