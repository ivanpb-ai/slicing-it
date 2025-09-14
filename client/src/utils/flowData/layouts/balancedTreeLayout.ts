
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
  // Use node type if provided, otherwise infer from ID (check rrpmember before rrp to avoid misclassification)
  const type = nodeType || (
    nodeId.includes('s-nssai') ? 's-nssai' :
    nodeId.includes('dnn') ? 'dnn' :
    nodeId.includes('rrpmember') ? 'rrpmember' :
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
    case 'rrpmember': return 120; // RRP Member nodes are compact
    case 'qosflow': return 300; // QoS Flow nodes
    case 'fiveqi': return 280; // 5QI nodes
    default: return 180; // Default fallback
  }
};

// Helper function to get actual node height based on type (matching real rendered heights)
const getNodeHeight = (nodeId: string, nodeType?: string): number => {
  // Use node type if provided, otherwise infer from ID
  const type = nodeType || (
    nodeId.includes('s-nssai') ? 's-nssai' :
    nodeId.includes('dnn') ? 'dnn' :
    nodeId.includes('rrpmember') ? 'rrpmember' :
    nodeId.includes('rrp') ? 'rrp' :
    nodeId.includes('qosflow') ? 'qosflow' :
    nodeId.includes('fiveqi') ? 'fiveqi' :
    'default'
  );
  
  // Real rendered heights based on CSS and content - RRP nodes are notably taller
  switch (type) {
    case 'rrp': return 340; // RRP nodes are significantly taller due to complex content
    case 's-nssai': return 150; // S-NSSAI nodes have medium height
    case 'dnn': return 140; // DNN nodes have medium height
    case 'qosflow': return 130; // QoS Flow nodes
    case 'rrpmember': return 120; // RRP Member nodes are shorter
    case 'fiveqi': return 120; // 5QI nodes are compact
    default: return 120; // Default fallback
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
  maxLevel: number,
  horizontalSpacing: number
): Map<string, number> => {
  const subtreeWidths = new Map<string, number>();
  const gutter = horizontalSpacing; // Use provided horizontal spacing
  
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
  console.log('🚀 arrangeNodesInBalancedTree CALLED! This confirms we are running the correct algorithm');
  console.log('🔧 Received options:', options);
  console.log('🔧 Input nodes count:', nodes.length, 'edges count:', edges?.length || 0);
  
  if (nodes.length === 0) return { nodes, cleanedEdges: edges || [] };
  
  // Safety check: ensure edges is defined
  if (!edges) {
    console.warn('arrangeNodesInBalancedTree: edges parameter is undefined, using empty array');
    edges = [];
  }

  const {
    nodeWidth = 180,
    nodeHeight = 120,
    horizontalSpacing = 140,  // Compact default for better overview
    verticalSpacing = 160,   // Adequate vertical separation
    marginX = 96,            // Compact margin for better viewport usage
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
  const subtreeWidths = calculateSubtreeWidths(childrenMap, allParentsMap, nodesByLevelMap, maxLevel, horizontalSpacing);
  console.log('🔧 Subtree widths calculated:', Object.fromEntries(Array.from(subtreeWidths.entries()).slice(0, 5)));
  
  // Calculate height-aware level Y positions to prevent overlaps
  console.log('🔧 Calculating height-aware Y positions for each level...');
  const levelHeights = new Map<number, number>();
  const levelY = new Map<number, number>();
  
  // Calculate maximum height for each level
  for (let level = 0; level <= maxLevel; level++) {
    const nodesAtLevel = nodesByLevel[level] || [];
    const maxHeightAtLevel = Math.max(
      ...nodesAtLevel.map(nodeId => getNodeHeight(nodeId)),
      120 // minimum height fallback
    );
    levelHeights.set(level, maxHeightAtLevel);
    console.log(`🔧 Level ${level}: max height = ${maxHeightAtLevel}px`);
  }
  
  // Calculate cumulative Y positions with adequate gaps
  const minGap = 160; // Minimum gap between levels, especially important for RRP → RRP Member
  levelY.set(0, marginY); // Root level starts at marginY
  
  for (let level = 1; level <= maxLevel; level++) {
    const prevLevelY = levelY.get(level - 1) || marginY;
    const prevLevelHeight = levelHeights.get(level - 1) || 120;
    const newY = prevLevelY + prevLevelHeight + minGap;
    levelY.set(level, newY);
    console.log(`🔧 Level ${level}: Y position = ${newY} (prev Y: ${prevLevelY} + prev height: ${prevLevelHeight} + gap: ${minGap})`);
  }
  
  // BOTTOM-UP BALANCED TREE LAYOUT for true symmetry
  console.log('🎯 Starting bottom-up balanced positioning with height-aware spacing...');
  
  // Position nodes using bottom-up approach for balanced layout
  const nodePositionMap: Record<string, { x: number; y: number }> = {};
  
  // Function to recursively position subtrees from leaves up to parents
  const positionSubtreeBottomUp = (nodeId: string, level: number): { leftX: number; rightX: number; centerX: number } => {
    const children = childrenMap[nodeId] || [];
    
    // FIXED: Use height-aware Y positioning based on actual level heights
    const y = levelY.get(level) || marginY;
    console.log(`📍 Level ${level} Y position: ${y} (height-aware positioning)`);
    
    if (children.length === 0) {
      // Leaf node: return bounds centered at 0 (fixed for bottom-up algorithm)
      const nodeWidth = getNodeWidth(nodeId);
      
      // CRITICAL FIX: Return relative bounds centered at 0 for proper bottom-up positioning
      // Position will be finalized when parent applies shift
      const centerX = 0;
      const leftX = centerX - nodeWidth / 2;
      const rightX = centerX + nodeWidth / 2;
      
      nodePositionMap[nodeId] = { x: leftX, y };
      console.log(`✓ Leaf ${nodeId} positioned at (${leftX}, ${y}) - will be adjusted by parent`);
      
      return { leftX, rightX, centerX };
    } else {
      // Internal node: position children first, then center parent over them
      let currentX = 0;
      const childBounds: { leftX: number; rightX: number; centerX: number }[] = [];
      
      // Level-scaled baseline from horizontalSpacing option for better compactness
      const scaleByLevel = level <= 0 ? 1.1 : level <= 1 ? 1.0 : level <= 2 ? 0.9 : 0.8;
      const baseGutter = horizontalSpacing * scaleByLevel;
      
      // Calculate average subtree width of children to adjust spacing dynamically
      const childSubtreeWidths = children.map(childId => {
        const subtreeWidth = subtreeWidths.get(childId) || getNodeWidth(childId);
        return subtreeWidth;
      });
      const avgChildSubtreeWidth = childSubtreeWidths.length > 0 
        ? childSubtreeWidths.reduce((sum, w) => sum + w, 0) / childSubtreeWidths.length 
        : 200;
      
      // Gentle modulation factor for spacing (much more conservative)
      const subtreeWidthFactor = Math.max(0.9, Math.min(1.05, Math.sqrt(avgChildSubtreeWidth / 400)));
      const gutter = Math.round(baseGutter * subtreeWidthFactor);
      
      console.log(`✓ Level ${level} spacing: base=${baseGutter}, factor=${subtreeWidthFactor.toFixed(2)}, final=${gutter}`);
      
      // Position all children from left to right
      children.forEach((childId, index) => {
        const childLevel = level + 1;
        const bounds = positionSubtreeBottomUp(childId, childLevel);
        
        // CRITICAL FIX: Adjust child position AND ALL DESCENDANTS in the subtree
        const childShift = currentX - bounds.leftX;
        
        // Apply shift to ALL nodes that were positioned in this child's subtree
        if (childShift !== 0) {
          console.log(`🔧 Shifting child ${childId} subtree by ${childShift}px`);
          
          // Find all descendants of this child
          const findAllDescendants = (parentId: string): string[] => {
            const directChildren = childrenMap[parentId] || [];
            const allDescendants = [...directChildren];
            directChildren.forEach(childId => {
              allDescendants.push(...findAllDescendants(childId));
            });
            return allDescendants;
          };
          
          // Shift the child and all its descendants
          const nodesToShift = [childId, ...findAllDescendants(childId)];
          nodesToShift.forEach(nodeId => {
            if (nodePositionMap[nodeId]) {
              nodePositionMap[nodeId].x += childShift;
            }
          });
        }
        
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
      
      // Position parent centered over children with improved alignment
      const nodeWidth = getNodeWidth(nodeId);
      const parentX = subtreeCenterX - nodeWidth / 2;
      
      nodePositionMap[nodeId] = { x: parentX, y };
      console.log(`✓ Parent ${nodeId} centered over children at (${Math.round(parentX)}, ${y})`);
      
      return { 
        leftX: Math.min(subtreeLeftX, parentX), 
        rightX: Math.max(subtreeRightX, parentX + nodeWidth), 
        centerX: subtreeCenterX 
      };
    }
  };

  // FIXED: Use virtual super-root to unify all roots and avoid overlap issues
  const rootNodeIds = nodesByLevel[0] || [];
  
  if (rootNodeIds.length === 0) {
    console.warn('⚠️ No root nodes found for layout');
    return { nodes, cleanedEdges: validEdges };
  }
  
  // Create a virtual super-root that contains all actual roots as children
  const VIRTUAL_ROOT = '__virtual_super_root__';
  childrenMap[VIRTUAL_ROOT] = rootNodeIds;
  
  // Position the entire graph starting from the virtual super-root
  console.log(`🌟 Positioning graph with virtual super-root containing ${rootNodeIds.length} actual roots`);
  positionSubtreeBottomUp(VIRTUAL_ROOT, -1); // Start at level -1 so actual roots are at level 0

  // Normalize positions: shift so leftmost node starts at marginX
  const allXPositions = Object.values(nodePositionMap).map(pos => pos.x);
  const minX = Math.min(...allXPositions);
  const normalizeShift = marginX - minX;
  
  // Apply normalization shift to all nodes
  Object.keys(nodePositionMap).forEach(nodeId => {
    nodePositionMap[nodeId].x += normalizeShift;
  });

  console.log(`🎯 Layout normalized: shifted all nodes by ${normalizeShift} to start at marginX=${marginX}`);

  // FIXED: Ensure all nodes get positioned and validate completeness
  const positionedCount = Object.keys(nodePositionMap).length;
  const expectedCount = nodes.length;
  
  console.log(`📊 Positioned ${positionedCount} out of ${expectedCount} nodes`);
  
  // Handle any unpositioned nodes (isolated/disconnected)
  let fallbackX = marginX;
  nodes.forEach(node => {
    if (!nodePositionMap[node.id]) {
      console.warn(`⚠️ Node ${node.id} was not positioned by layout, placing as fallback`);
      nodePositionMap[node.id] = { x: fallbackX, y: marginY };
      fallbackX += 200; // Space them out horizontally
    }
  });

  // Update original nodes with normalized positions (NO DOUBLE CENTERING)
  const updatedNodes = nodes.map(node => {
    const position = nodePositionMap[node.id];
    if (position) {
      return {
        ...node,
        position: position
      };
    }
    return node;
  });

  console.log('🎯 BALANCED TREE LAYOUT COMPLETED. Positioned', updatedNodes.length, 'nodes');
  console.log('🎯 Height-aware Y positioning used with minimum gap:', minGap, 'px');
  console.log('🎯 Level heights:', Object.fromEntries(Array.from(levelHeights.entries())));
  console.log('🎯 Level Y positions:', Object.fromEntries(Array.from(levelY.entries())));
  console.log('🎯 Final calculated positions:', updatedNodes.slice(0, 5).map(n => ({ id: n.id, x: n.position.x, y: n.position.y })));
  console.log(`🧹 Cleaned ${edges.length - validEdges.length} invalid edges`);

  return { nodes: updatedNodes, cleanedEdges: validEdges };
};
