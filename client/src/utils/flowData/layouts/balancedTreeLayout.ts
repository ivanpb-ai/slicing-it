
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
    horizontalSpacing = 250,
    verticalSpacing = 180,
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
    const y = marginY + level * verticalSpacing;
    
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
      // Non-root levels: group by parent and position siblings symmetrically
      const siblingGroups: Record<string, string[]> = {};
      
      // Group nodes by their primary parent (for single parent) or by 'multiParent' key (for multiple parents)
      nodesInLevel.forEach(nodeId => {
        const parents = allParentsMap[nodeId] || [];
        let groupKey;
        
        if (parents.length === 0) {
          groupKey = 'orphan';
        } else if (parents.length === 1) {
          groupKey = parents[0]; // Single parent - group by parent
        } else {
          groupKey = 'multiParent'; // Multiple parents - separate group for individual positioning
        }
        
        if (!siblingGroups[groupKey]) {
          siblingGroups[groupKey] = [];
        }
        siblingGroups[groupKey].push(nodeId);
      });
      
      console.log(`Level ${level} sibling groups:`, siblingGroups);
      
      const nodePositions: { nodeId: string; x: number }[] = [];
      
      // Position each sibling group
      Object.entries(siblingGroups).forEach(([groupKey, siblings]) => {
        if (groupKey === 'orphan') {
          // Orphan nodes: place at origin
          siblings.forEach(nodeId => {
            console.log(`Orphan node ${nodeId} -> x=0`);
            nodePositions.push({ nodeId, x: 0 });
          });
        } else if (groupKey === 'multiParent') {
          // Multiple-parent nodes: position each individually, but spread if they overlap
          const calculatedPositions: Array<{ nodeId: string; x: number }> = [];
          
          siblings.forEach(nodeId => {
            const parents = allParentsMap[nodeId] || [];
            const parentPositions = parents
              .map(parentId => nodePositionMap[parentId])
              .filter(pos => pos);
            
            if (parentPositions.length > 0) {
              const avgX = parentPositions.reduce((sum, pos) => sum + pos.x, 0) / parentPositions.length;
              console.log(`Multi-parent child ${nodeId} with parents at:`, parentPositions.map(p => p.x), `-> avgX=${avgX}`);
              calculatedPositions.push({ nodeId, x: avgX });
            } else {
              console.log(`Multi-parent child ${nodeId} with no valid parents -> x=0`);
              calculatedPositions.push({ nodeId, x: 0 });
            }
          });
          
          // Check for overlapping positions and spread them if needed
          if (calculatedPositions.length > 1) {
            const uniqueXValues = Array.from(new Set(calculatedPositions.map(p => p.x)));
            if (uniqueXValues.length < calculatedPositions.length) {
              // Some nodes have the same x position - spread them around the center
              const centerX = calculatedPositions.reduce((sum, p) => sum + p.x, 0) / calculatedPositions.length;
              const siblingCount = calculatedPositions.length;
              const spacing = horizontalSpacing * 0.6; // Smaller spacing to keep them close
              const totalWidth = (siblingCount - 1) * spacing;
              const startX = centerX - totalWidth / 2;
              
              console.log(`Spreading ${siblingCount} overlapping multi-parent nodes around center x=${centerX}`);
              calculatedPositions.forEach((item, index) => {
                const spreadX = startX + index * spacing;
                console.log(`  Spread multi-parent ${item.nodeId}: ${item.x} -> ${spreadX}`);
                nodePositions.push({ nodeId: item.nodeId, x: spreadX });
              });
            } else {
              // No overlaps, use calculated positions
              nodePositions.push(...calculatedPositions);
            }
          } else {
            // Single node, use calculated position
            nodePositions.push(...calculatedPositions);
          }
        } else if (siblings.length === 1) {
          // Single child: handle based on its parents
          const nodeId = siblings[0];
          const parents = allParentsMap[nodeId] || [];
          
          if (parents.length === 1) {
            // Single parent: align under parent
            const parentPos = nodePositionMap[parents[0]];
            const x = parentPos ? parentPos.x : 0;
            console.log(`Single child ${nodeId} under parent ${parents[0]} -> x=${x}`);
            nodePositions.push({ nodeId, x });
          } else {
            // Multiple parents: center between them
            const parentPositions = parents
              .map(parentId => nodePositionMap[parentId])
              .filter(pos => pos);
            
            if (parentPositions.length > 0) {
              const avgX = parentPositions.reduce((sum, pos) => sum + pos.x, 0) / parentPositions.length;
              console.log(`Single child ${nodeId} with multiple parents:`, parentPositions.map(p => p.x), `-> avgX=${avgX}`);
              nodePositions.push({ nodeId, x: avgX });
            } else {
              console.log(`Single child ${nodeId} with no valid parent positions -> x=0`);
              nodePositions.push({ nodeId, x: 0 });
            }
          }
        } else {
          // Multiple siblings with same single parent: spread around parent position
          const parentPos = nodePositionMap[groupKey];
          const centerX = parentPos ? parentPos.x : 0;
          
          // Calculate symmetric positions
          const siblingCount = siblings.length;
          const totalWidth = (siblingCount - 1) * horizontalSpacing;
          const startX = centerX - totalWidth / 2;
          
          console.log(`Spreading ${siblingCount} siblings around parent ${groupKey} at x=${centerX}`);
          
          siblings.forEach((nodeId, index) => {
            const x = startX + index * horizontalSpacing;
            console.log(`  Sibling ${nodeId} -> x=${x}`);
            nodePositions.push({ nodeId, x });
          });
        }
      });
      
      // Sort by X position for consistent ordering
      nodePositions.sort((a, b) => a.x - b.x);
      
      // Add to positioned nodes
      nodePositions.forEach(({ nodeId, x }) => {
        const position = { x, y };
        positionedNodes.push({ id: nodeId, position });
        nodePositionMap[nodeId] = position;
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

  console.log('Balanced tree layout completed. Positioned', positionedNodes.length, 'nodes');
  console.log('Final calculated positions before returning:', updatedNodes.map(n => ({ id: n.id, x: n.position.x, y: n.position.y })));

  return updatedNodes;
};
