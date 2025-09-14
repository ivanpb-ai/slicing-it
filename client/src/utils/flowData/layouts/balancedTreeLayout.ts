
import { Node, Edge } from '@xyflow/react';

interface BalancedTreeOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  marginX?: number;
  marginY?: number;
}

// Helper function to get actual node width based on type (matching real rendered widths)
const getNodeWidth = (nodeId: string, nodeType?: string): number => {
  // Use node type if provided, otherwise infer from ID
  const type = nodeType || (
    nodeId.includes('s-nssai') ? 's-nssai' :
    nodeId.includes('dnn') ? 'dnn' :
    nodeId.includes('rrp') ? 'rrp' :
    nodeId.includes('qosflow') ? 'qosflow' :
    nodeId.includes('fiveqi') ? 'fiveqi' :
    'default'
  );
  
  // Real rendered widths based on CSS and content
  switch (type) {
    case 's-nssai': return 360; // S-NSSAI nodes are wider due to content
    case 'dnn': return 320; // DNN nodes are medium width
    case 'rrp': return 240; // RRP nodes
    case 'qosflow': return 300; // QoS Flow nodes
    case 'fiveqi': return 280; // 5QI nodes
    default: return 180; // Default fallback
  }
};

// Helper function to get parent center X position
const getParentCenterX = (parentPos: { x: number; y: number }, parentId: string, subtreeWidths?: Map<string, number>): number => {
  const parentWidth = subtreeWidths?.get(parentId) || getNodeWidth(parentId);
  return parentPos.x + parentWidth / 2;
};

// Calculate subtree widths (required width including all descendants)
const calculateSubtreeWidths = (
  childrenMap: Record<string, string[]>,
  allParentsMap: Record<string, string[]>,
  nodesByLevel: Map<number, string[]>,
  maxLevel: number
): Map<string, number> => {
  const subtreeWidths = new Map<string, number>();
  const gutter = 60; // Standard spacing between siblings
  
  // Process levels bottom-up to calculate subtree widths
  for (let level = maxLevel; level >= 0; level--) {
    const nodesAtLevel = nodesByLevel.get(level) || [];
    
    nodesAtLevel.forEach(nodeId => {
      const children = childrenMap[nodeId] || [];
      const nodeWidth = getNodeWidth(nodeId);
      
      if (children.length === 0) {
        // Leaf node: subtree width = own width
        subtreeWidths.set(nodeId, nodeWidth);
      } else {
        // Group children by type and calculate required width for each group
        const childGroups = new Map<string, string[]>();
        children.forEach(childId => {
          const childType = getNodeType(childId);
          if (!childGroups.has(childType)) {
            childGroups.set(childType, []);
          }
          childGroups.get(childType)!.push(childId);
        });
        
        let maxChildGroupWidth = 0;
        childGroups.forEach(typeChildren => {
          // Calculate total width for this type group
          const totalChildWidth = typeChildren.reduce((sum, childId) => {
            return sum + (subtreeWidths.get(childId) || getNodeWidth(childId));
          }, 0);
          const totalGutterWidth = (typeChildren.length - 1) * gutter;
          const groupWidth = totalChildWidth + totalGutterWidth;
          maxChildGroupWidth = Math.max(maxChildGroupWidth, groupWidth);
        });
        
        // Subtree width = max(own width, widest child group)
        const requiredWidth = Math.max(nodeWidth, maxChildGroupWidth);
        subtreeWidths.set(nodeId, requiredWidth);
      }
    });
  }
  
  return subtreeWidths;
};

// Helper function to get node type from ID
const getNodeType = (nodeId: string): string => {
  if (nodeId.includes('s-nssai')) return 's-nssai';
  if (nodeId.includes('dnn')) return 'dnn';
  if (nodeId.includes('rrpmember')) return 'rrpmember';
  if (nodeId.includes('rrp-')) return 'rrp';
  if (nodeId.includes('cell-area')) return 'cell-area';
  if (nodeId.includes('network')) return 'network';
  if (nodeId.includes('qosflow')) return 'qosflow';
  if (nodeId.includes('fiveqi')) return 'fiveqi';
  return 'default';
};

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
): { nodes: Node[], cleanedEdges: Edge[] } => {
  if (nodes.length === 0) return { nodes, cleanedEdges: edges || [] };
  
  // Safety check: ensure edges is defined
  if (!edges) {
    console.warn('arrangeNodesInBalancedTree: edges parameter is undefined, using empty array');
    edges = [];
  }

  const {
    nodeWidth = 180,
    nodeHeight = 120,
    horizontalSpacing = 300,  // Reduced to prevent excessive spreading
    verticalSpacing = 250,   // Increased for better vertical separation
    marginX = 400,
    marginY = 100
  } = options;

  // Starting balanced hierarchical arrangement

  // Create node ID set for validation
  const nodeIds = new Set(nodes.map(node => node.id));

  // Filter edges to only include those with valid nodes and clean up invalid ones
  const validEdges = edges.filter(edge => {
    const sourceExists = nodeIds.has(edge.source);
    const targetExists = nodeIds.has(edge.target);
    
    if (!sourceExists || !targetExists) {
      console.log(`🧹 CLEANED: Removing invalid edge ${edge.source} -> ${edge.target} (source: ${sourceExists}, target: ${targetExists})`);
      return false;
    }
    
    return true;
  });


  // Build parent-child relationships with multiple parent support using only valid edges
  const childrenMap: Record<string, string[]> = {};
  const allParentsMap: Record<string, string[]> = {};
  const primaryParentMap: Record<string, string> = {};
  
  console.log('🔍 Processing edges for layout:', validEdges.length, 'valid edges');
  
  validEdges.forEach(edge => {
    console.log(`🔗 Processing edge: ${edge.source} -> ${edge.target}`);
    
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
  
  // FALLBACK: Use parentId from node data for nodes without edges (handles timing issues)
  nodes.forEach(node => {
    if (node.data?.parentId && typeof node.data.parentId === 'string' && !allParentsMap[node.id]) {
      const parentId = node.data.parentId as string;
      console.log(`🔗 Using parentId fallback for ${node.id} -> parent: ${parentId}`);
      
      // Add to children map
      if (!childrenMap[parentId]) {
        childrenMap[parentId] = [];
      }
      if (!childrenMap[parentId].includes(node.id)) {
        childrenMap[parentId].push(node.id);
      }
      
      // Add to parents map
      if (!allParentsMap[node.id]) {
        allParentsMap[node.id] = [];
      }
      if (!allParentsMap[node.id].includes(parentId)) {
        allParentsMap[node.id].push(parentId);
      }
      
      // Set primary parent
      if (!primaryParentMap[node.id]) {
        primaryParentMap[node.id] = parentId;
      }
    }
  });

  // Find root nodes (nodes with no parents)
  const rootNodes = nodes.filter(node => !allParentsMap[node.id] || allParentsMap[node.id].length === 0);
  
  // If no root nodes found, treat the first node as root
  if (rootNodes.length === 0 && nodes.length > 0) {
    rootNodes.push(nodes[0]);
  }


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
  
  // Calculate subtree widths for proper spacing to prevent overlaps
  const maxLevel = Math.max(...Object.keys(nodesByLevel).map(k => parseInt(k)));
  const nodesByLevelMap = new Map<number, string[]>();
  Object.keys(nodesByLevel).forEach(levelStr => {
    const level = parseInt(levelStr);
    nodesByLevelMap.set(level, nodesByLevel[level]);
  });
  
  console.log('🔧 Calculating subtree widths for overlap prevention...');
  const subtreeWidths = calculateSubtreeWidths(childrenMap, allParentsMap, nodesByLevelMap, maxLevel);
  console.log('🔧 Subtree widths calculated:', Object.fromEntries(Array.from(subtreeWidths.entries()).slice(0, 5)));
  
  // Removed excessive debug logging for performance

  // Using subtree width calculation for proper spacing to prevent overlaps

  // BOTTOM-UP BALANCED TREE LAYOUT for true symmetry
  console.log('🎯 Starting bottom-up balanced positioning...');
  
  // Position nodes using bottom-up approach for balanced layout
  const nodePositionMap: Record<string, { x: number; y: number }> = {};
  
  // Function to recursively position subtrees from leaves up to parents
  const positionSubtreeBottomUp = (nodeId: string, level: number): { leftX: number; rightX: number; centerX: number } => {
    const children = childrenMap[nodeId] || [];
    
    // Calculate Y position with dynamic spacing
    let y = 100; // Start position
    if (level > 0) {
      const prevLevelNodes = nodesByLevel[level - 1] || [];
      let maxPrevLevelHeight = 120; // Default node height
      
      // For RRP nodes with content, estimate larger height
      prevLevelNodes.forEach(prevNodeId => {
        const node = nodes.find(n => n.id === prevNodeId);
        if (node && node.data.type === 'rrp') {
          const hasContent = node.data.extraData || node.data.bands || false;
          maxPrevLevelHeight = Math.max(maxPrevLevelHeight, hasContent ? 280 : 120);
        }
      });
      
      // Dynamic spacing: base + max height + buffer
      y = 100 + (level - 1) * 200 + maxPrevLevelHeight + 80;
    }
    
    if (children.length === 0) {
      // Leaf node: position using its width
      const nodeWidth = getNodeWidth(nodeId);
      const centerX = 0; // Will be normalized later
      const leftX = centerX - nodeWidth / 2;
      const rightX = centerX + nodeWidth / 2;
      
      nodePositionMap[nodeId] = { x: leftX, y };
      console.log(`✓ Leaf ${nodeId} positioned at (${leftX}, ${y})`);
      
      return { leftX, rightX, centerX };
    } else {
      // Internal node: position children first, then center parent over them
      let currentX = 0;
      const childBounds: { leftX: number; rightX: number; centerX: number }[] = [];
      
      // Adaptive spacing: upper levels need more space due to wider subtrees
      // Base spacing increases for upper levels, plus dynamic adjustment based on subtree width
      const baseGutter = level <= 2 ? 120 : level <= 4 ? 90 : 60;
      
      // Calculate average subtree width of children to adjust spacing dynamically
      const childSubtreeWidths = children.map(childId => {
        const subtreeWidth = subtreeWidths.get(childId) || getNodeWidth(childId);
        return subtreeWidth;
      });
      const avgChildSubtreeWidth = childSubtreeWidths.length > 0 
        ? childSubtreeWidths.reduce((sum, w) => sum + w, 0) / childSubtreeWidths.length 
        : 200;
      
      // Adaptive gutter: more spacing for wider subtrees
      const subtreeWidthFactor = Math.min(avgChildSubtreeWidth / 300, 2); // Cap at 2x
      const gutter = Math.floor(baseGutter * subtreeWidthFactor);
      
      console.log(`✓ Level ${level} spacing: base=${baseGutter}, factor=${subtreeWidthFactor.toFixed(2)}, final=${gutter}`);
      
      // Position all children from left to right
      children.forEach((childId, index) => {
        const childLevel = level + 1;
        const bounds = positionSubtreeBottomUp(childId, childLevel);
        
        // Adjust child position based on current cursor
        const childShift = currentX - bounds.leftX;
        const currentChildPos = nodePositionMap[childId];
        nodePositionMap[childId] = { 
          x: currentChildPos.x + childShift, 
          y: currentChildPos.y 
        };
        
        // Update bounds with shifted position
        const shiftedBounds = {
          leftX: bounds.leftX + childShift,
          rightX: bounds.rightX + childShift,
          centerX: bounds.centerX + childShift
        };
        
        childBounds.push(shiftedBounds);
        
        // Move cursor for next child
        currentX = shiftedBounds.rightX + gutter;
      });
      
      // Calculate parent bounds based on children
      const leftmostChild = childBounds[0];
      const rightmostChild = childBounds[childBounds.length - 1];
      const subtreeLeftX = leftmostChild.leftX;
      const subtreeRightX = rightmostChild.rightX;
      const subtreeCenterX = (subtreeLeftX + subtreeRightX) / 2;
      
      // Position parent centered over children
      const nodeWidth = getNodeWidth(nodeId);
      const parentX = subtreeCenterX - nodeWidth / 2;
      
      nodePositionMap[nodeId] = { x: parentX, y };
      console.log(`✓ Parent ${nodeId} centered over children at (${parentX}, ${y})`);
      
      return { 
        leftX: Math.min(subtreeLeftX, parentX), 
        rightX: Math.max(subtreeRightX, parentX + nodeWidth), 
        centerX: subtreeCenterX 
      };
    }
  };

  // Find root nodes and position their subtrees using bottom-up approach
  const rootNodeIds = nodesByLevel[0] || [];
  
  rootNodeIds.forEach(rootId => {
    positionSubtreeBottomUp(rootId, 0);
  });

  // Normalize positions: shift so leftmost node starts at marginX
  const allXPositions = Object.values(nodePositionMap).map(pos => pos.x);
  const minX = Math.min(...allXPositions);
  const normalizeShift = marginX - minX;
  
  // Apply normalization shift to all nodes
  Object.keys(nodePositionMap).forEach(nodeId => {
    nodePositionMap[nodeId].x += normalizeShift;
  });

  console.log(`🎯 Layout normalized: shifted all nodes by ${normalizeShift} to start at marginX=${marginX}`);

  // Convert to positioned nodes format
  const positionedNodes = Object.entries(nodePositionMap).map(([id, position]) => ({
    id,
    position
  }));

  console.log('🎯 Bottom-up balanced layout completed');

  // Calculate the bounds of all positioned nodes to center the entire graph
  const allPositionX = positionedNodes.map(p => p.position.x);
  const minXPos = Math.min(...allPositionX);
  const maxXPos = Math.max(...allPositionX);
  const graphWidth = maxXPos - minXPos;
  const graphCenterX = (minXPos + maxXPos) / 2;
  
  // Shift all nodes so the graph center is at X=0
  const centeredNodes = positionedNodes.map(p => ({
    ...p,
    position: {
      x: p.position.x - graphCenterX,
      y: p.position.y
    }
  }));
  
  console.log(`🎯 Graph centering: minX=${minXPos}, maxX=${maxXPos}, width=${graphWidth}, centerOffset=${graphCenterX}`);

  // Update original nodes with centered positions
  const updatedNodes = nodes.map(node => {
    const positioned = centeredNodes.find(p => p.id === node.id);
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
  console.log(`🧹 Cleaned ${edges.length - validEdges.length} invalid edges`);

  return { nodes: updatedNodes, cleanedEdges: validEdges };
};
