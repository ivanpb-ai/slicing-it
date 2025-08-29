
import { Node, Edge } from '@xyflow/react';

interface BalancedTreeOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  marginX?: number;
  marginY?: number;
}

interface TreeNode {
  id: string;
  node: Node;
  children: TreeNode[];
  parent?: TreeNode;
  level: number;
  subtreeWidth: number;
  position: { x: number; y: number };
}

/**
 * Creates a perfectly balanced symmetrical hierarchical tree layout
 */
export const arrangeNodesInBalancedTree = (
  nodes: Node[],
  edges: Edge[],
  options: BalancedTreeOptions = {}
): Node[] => {
  if (nodes.length === 0) return nodes;

  const {
    nodeWidth = 180,
    nodeHeight = 120,
    horizontalSpacing = 800,
    verticalSpacing = 120,  // Compact edges - reduced further
    marginX = 400,
    marginY = 100
  } = options;

  console.log('✅ BALANCED TREE LAYOUT: Starting balanced hierarchical arrangement with', nodes.length, 'nodes');

  // Create node ID set for validation
  const nodeIds = new Set(nodes.map(node => node.id));
  console.log('Available node IDs:', Array.from(nodeIds));

  // Filter edges to only include those with valid nodes
  const validEdges = edges.filter(edge => {
    const sourceExists = nodeIds.has(edge.source);
    const targetExists = nodeIds.has(edge.target);
    
    if (!sourceExists || !targetExists) {
      console.warn(`Skipping invalid edge: ${edge.source} -> ${edge.target} (source exists: ${sourceExists}, target exists: ${targetExists})`);
    }
    
    return sourceExists && targetExists;
  });

  console.log(`Filtered edges: ${edges.length} -> ${validEdges.length} valid edges`);

  // Build parent-child relationships with multiple parent support using only valid edges
  const childrenMap: Record<string, string[]> = {};
  const allParentsMap: Record<string, string[]> = {};
  const primaryParentMap: Record<string, string> = {};
  
  validEdges.forEach(edge => {
    // Track all children
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = [];
    }
    childrenMap[edge.source].push(edge.target);
    
    // Track all parents
    if (!allParentsMap[edge.target]) {
      allParentsMap[edge.target] = [];
    }
    allParentsMap[edge.target].push(edge.source);
    
    // Set primary parent (first one encountered, or prefer based on node type)
    if (!primaryParentMap[edge.target]) {
      primaryParentMap[edge.target] = edge.source;
    }
  });

  // Find root nodes (nodes with no parents)
  const rootNodes = nodes.filter(node => !allParentsMap[node.id] || allParentsMap[node.id].length === 0);
  
  // If no root nodes found, treat the first node as root
  if (rootNodes.length === 0 && nodes.length > 0) {
    rootNodes.push(nodes[0]);
  }

  console.log('Found', rootNodes.length, 'root nodes');

  // Build hierarchical levels for DAG layout (handles multiple parents properly)
  const nodesByLevel: Record<number, string[]> = {};
  const nodePositions: Record<string, { level: number; orderInLevel: number }> = {};
  
  // Assign levels based on longest path from root
  const assignLevels = (nodeId: string, level: number, visited: Set<string> = new Set()) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    // Only assign level if it's deeper than current level (handles multiple parents)
    if (!nodePositions[nodeId] || nodePositions[nodeId].level < level) {
      // Remove from old level if reassigning
      if (nodePositions[nodeId]) {
        const oldLevel = nodePositions[nodeId].level;
        nodesByLevel[oldLevel] = nodesByLevel[oldLevel]?.filter(id => id !== nodeId) || [];
      }
      
      nodePositions[nodeId] = { level, orderInLevel: 0 };
      
      if (!nodesByLevel[level]) nodesByLevel[level] = [];
      if (!nodesByLevel[level].includes(nodeId)) {
        nodesByLevel[level].push(nodeId);
      }
    }
    
    // Process children
    const children = childrenMap[nodeId] || [];
    children.forEach(childId => assignLevels(childId, level + 1, visited));
  };
  
  // Start from root nodes
  rootNodes.forEach(rootNode => assignLevels(rootNode.id, 0));
  
  // Assign order within each level for symmetry
  Object.keys(nodesByLevel).forEach(levelStr => {
    const level = parseInt(levelStr);
    const nodesInLevel = nodesByLevel[level];
    nodesInLevel.forEach((nodeId, index) => {
      nodePositions[nodeId].orderInLevel = index;
    });
  });
  
  console.log('Level assignments:', nodePositions);
  console.log('Parent-child relationships:', allParentsMap);

  // No need for subtree width calculation in DAG layout

  // Position nodes by level with perfect symmetry and parent-child alignment
  const positionedNodes: { id: string; position: { x: number; y: number } }[] = [];
  const nodePositionMap: Record<string, { x: number; y: number }> = {};
  
  // Position each level, considering parent positions for alignment
  Object.keys(nodesByLevel).sort((a, b) => parseInt(a) - parseInt(b)).forEach(levelStr => {
    const level = parseInt(levelStr);
    const nodesInLevel = nodesByLevel[level];
    const nodeCount = nodesInLevel.length;
    
    // Calculate Y position for this level
    const y = 100 + level * 140;  // Better spacing: 100px start + 140px between levels
    
    if (level === 0) {
      // Root level: center at origin
      if (nodeCount === 1) {
        const position = { x: 0, y };
        positionedNodes.push({ id: nodesInLevel[0], position });
        nodePositionMap[nodesInLevel[0]] = position;
      } else {
        // Multiple roots: distribute symmetrically
        const totalWidth = (nodeCount - 1) * horizontalSpacing;
        const startX = -totalWidth / 2;
        
        nodesInLevel.forEach((nodeId, index) => {
          const position = { x: startX + index * horizontalSpacing, y };
          positionedNodes.push({ id: nodeId, position });
          nodePositionMap[nodeId] = position;
        });
      }
    } else {
      // Non-root levels: PARENT-CHILD ALIGNMENT WITH SPACING
      // Position nodes directly under their parents when possible
      nodesInLevel.forEach(nodeId => {
        const parents = allParentsMap[nodeId] || [];
        
        if (parents.length === 0) {
          // Orphan nodes go to center
          const position = { x: 0, y };
          positionedNodes.push({ id: nodeId, position });
          nodePositionMap[nodeId] = position;
          console.log(`  Orphan node ${nodeId} -> x=0`);
        } else if (parents.length === 1) {
          // Single parent: position directly below parent
          const parentPos = nodePositionMap[parents[0]];
          if (parentPos) {
            const position = { x: parentPos.x, y };
            positionedNodes.push({ id: nodeId, position });
            nodePositionMap[nodeId] = position;
            console.log(`  Node ${nodeId} aligned under parent at x=${parentPos.x}`);
          } else {
            const position = { x: 0, y };
            positionedNodes.push({ id: nodeId, position });
            nodePositionMap[nodeId] = position;
          }
        } else {
          // Multiple parents: position at average of parent positions
          const parentPositions = parents
            .map(parentId => nodePositionMap[parentId])
            .filter(pos => pos);
          
          if (parentPositions.length > 0) {
            const avgX = parentPositions.reduce((sum, pos) => sum + pos.x, 0) / parentPositions.length;
            const position = { x: avgX, y };
            positionedNodes.push({ id: nodeId, position });
            nodePositionMap[nodeId] = position;
            console.log(`  Node ${nodeId} positioned at average of parents x=${avgX}`);
          } else {
            const position = { x: 0, y };
            positionedNodes.push({ id: nodeId, position });
            nodePositionMap[nodeId] = position;
          }
        }
      });
    }
  });

  // Update original nodes with new positions
  const updatedNodes = nodes.map(node => {
    const positioned = positionedNodes.find(p => p.id === node.id);
    if (positioned) {
      return {
        ...node,
        position: positioned.position
      };
    }
    return node;
  });

  console.log('🎯 BALANCED TREE LAYOUT COMPLETED. Positioned', positionedNodes.length, 'nodes');
  console.log('🎯 Final Y spacing used:', verticalSpacing, 'px');
  console.log('🎯 Final calculated positions:', updatedNodes.slice(0, 5).map(n => ({ id: n.id, x: n.position.x, y: n.position.y })));

  return updatedNodes;
};
