
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

  // SIMPLE HIERARCHICAL POSITIONING ALGORITHM
  const positionedNodes: { id: string; position: { x: number; y: number } }[] = [];
  const nodePositionMap: Record<string, { x: number; y: number }> = {};
  
  // Pre-process to find all DNN, RRP, cell-area, S-NSSAI, and 5QI nodes and their levels
  const allDnnNodes: string[] = [];
  const allRrpNodes: string[] = [];
  const allCellAreaNodes: string[] = [];
  const allSNssaiNodes: string[] = [];
  const allFiveQiNodes: string[] = [];
  let dnnLevel = -1;
  let rrpLevel = -1;
  let cellAreaLevel = -1;
  let sNssaiLevel = -1;
  let fiveQiLevel = -1;
  Object.entries(nodesByLevel).forEach(([levelStr, nodesInLevel]) => {
    const dnnNodesInLevel = nodesInLevel.filter(nodeId => nodeId.includes('dnn-'));
    const rrpNodesInLevel = nodesInLevel.filter(nodeId => nodeId.includes('rrp-') && !nodeId.includes('rrpmember'));
    const cellAreaNodesInLevel = nodesInLevel.filter(nodeId => nodeId.includes('cell-area-'));
    const sNssaiNodesInLevel = nodesInLevel.filter(nodeId => nodeId.includes('s-nssai-'));
    const fiveQiNodesInLevel = nodesInLevel.filter(nodeId => nodeId.includes('fiveqi-'));
    
    if (dnnNodesInLevel.length > 0) {
      allDnnNodes.push(...dnnNodesInLevel);
      dnnLevel = parseInt(levelStr);
    }
    if (rrpNodesInLevel.length > 0) {
      allRrpNodes.push(...rrpNodesInLevel);
      rrpLevel = parseInt(levelStr);
    }
    if (cellAreaNodesInLevel.length > 0) {
      allCellAreaNodes.push(...cellAreaNodesInLevel);
      cellAreaLevel = parseInt(levelStr);
    }
    if (sNssaiNodesInLevel.length > 0) {
      allSNssaiNodes.push(...sNssaiNodesInLevel);
      sNssaiLevel = parseInt(levelStr);
    }
    if (fiveQiNodesInLevel.length > 0) {
      allFiveQiNodes.push(...fiveQiNodesInLevel);
      fiveQiLevel = parseInt(levelStr);
    }
  });
  
  // Node collections initialized for layout processing
  
  // Simplified node counting for performance
  
  // Process levels in order
  const sortedLevels = Object.keys(nodesByLevel).map(l => parseInt(l)).sort((a, b) => a - b);
  
  sortedLevels.forEach(level => {
    const nodesInLevel = nodesByLevel[level];
    
    // Calculate dynamic Y position based on previous level's node heights
    let y = 100; // Start position
    if (level > 0) {
      // Find the maximum height of nodes in the previous level
      const prevLevelNodes = nodesByLevel[level - 1] || [];
      let maxPrevLevelHeight = 120; // Default node height
      
      // For RRP nodes with lots of content, estimate larger height
      prevLevelNodes.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.data.type === 'rrp') {
          // Estimate height based on content - RRP nodes with bands can be much taller
          const hasContent = node.data.extraData || node.data.bands || false;
          maxPrevLevelHeight = Math.max(maxPrevLevelHeight, hasContent ? 280 : 120);
        }
      });
      
      // Use dynamic spacing: base spacing + max height of previous level + buffer  
      y = 100 + (level - 1) * 200 + maxPrevLevelHeight + 80; // Reduced spacing for more compact layout
    }
    
    // Level positioning for performance
    
    if (level === 0) {
      // Root level: center everything at x=0
      nodesInLevel.forEach(nodeId => {
        const position = { x: 0, y };
        positionedNodes.push({ id: nodeId, position });
        nodePositionMap[nodeId] = position;
        // Root positioned
      });
    } else {
      // Position based on parents
      nodesInLevel.forEach(nodeId => {
        const parents = allParentsMap[nodeId] || [];
        if (parents.length === 0) {
          // No parents: center at x=0
          const position = { x: 0, y };
          positionedNodes.push({ id: nodeId, position });
          nodePositionMap[nodeId] = position;
        } else {
          // Position based on first parent for simplicity
          const parentPos = nodePositionMap[parents[0]];
          if (parentPos) {
            // Check how many siblings this node has
            const siblings = (childrenMap[parents[0]] || []).filter(child => 
              nodesByLevel[level] && nodesByLevel[level].includes(child)
            );
            
            // Check for special node types first, regardless of sibling count
            const isDnnNode = nodeId.includes('dnn-');
            const isRrpNode = nodeId.includes('rrp-') && !nodeId.includes('rrpmember');
            const isCellAreaNode = nodeId.includes('cell-area-');
            const isSNssaiNode = nodeId.includes('s-nssai-');
            const isFiveQiNode = nodeId.includes('fiveqi-');
            
            if (isDnnNode && level === dnnLevel) {
              // DNN nodes with width-aware positioning to prevent overlap
              const parentIds = allParentsMap[nodeId] || [];
              const parentId = parentIds[0]; // Get first parent (S-NSSAI node)
              
              if (parentId && nodePositionMap[parentId]) {
                const parentPos = nodePositionMap[parentId];
                
                // Get all DNN siblings that share the same parent
                const typedSiblings = allDnnNodes.filter(dnnId => {
                  const dnnParents = allParentsMap[dnnId] || [];
                  return dnnParents.includes(parentId);
                });
                
                // Get parent center for proper alignment using subtree width
                const parentCenterX = getParentCenterX(parentPos, parentId, subtreeWidths);
                
                if (typedSiblings.length === 1) {
                  // Single DNN child: center under parent using subtree width
                  const nodeWidth = subtreeWidths.get(nodeId) || getNodeWidth(nodeId, 'dnn');
                  const x = parentCenterX - nodeWidth / 2;
                  
                  const position = { x, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ Single DNN ${nodeId} centered under parent at (${x}, ${y})`);
                } else {
                  // Multiple DNN siblings: distribute with actual widths
                  const nodeIndex = typedSiblings.indexOf(nodeId);
                  const gutter = 60; // Spacing between nodes
                  
                  // Calculate total width needed for all siblings using subtree widths
                  const totalSiblingWidth = typedSiblings.reduce((sum, sibId) => {
                    return sum + (subtreeWidths.get(sibId) || getNodeWidth(sibId, 'dnn'));
                  }, 0);
                  const totalGutterWidth = (typedSiblings.length - 1) * gutter;
                  const totalWidth = totalSiblingWidth + totalGutterWidth;
                  
                  // Start from left edge of the group, centered under parent
                  const startX = parentCenterX - totalWidth / 2;
                  
                  // Calculate cumulative position for this specific node using subtree widths
                  let cumulativeX = startX;
                  for (let i = 0; i < nodeIndex; i++) {
                    cumulativeX += (subtreeWidths.get(typedSiblings[i]) || getNodeWidth(typedSiblings[i], 'dnn')) + gutter;
                  }
                  
                  const position = { x: cumulativeX, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ DNN ${nodeId} positioned with width-aware spacing at (${cumulativeX}, ${y})`);
                }
              } else {
                // Fallback: position using standard width
                const nodeWidth = getNodeWidth(nodeId, 'dnn');
                const x = 0 - nodeWidth / 2; // Center at origin
                const position = { x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ DNN ${nodeId} fallback positioned at (${x}, ${y})`);
              }
              // DNN node positioned with width-aware spacing
            } else if (isRrpNode && level === rrpLevel) {
              // Position RRP nodes per-parent for organized layout
              const parentIds = allParentsMap[nodeId] || [];
              const parentId = parentIds[0];
              
              if (parentId && nodePositionMap[parentId]) {
                const parentPos = nodePositionMap[parentId];
                
                // Get all RRP siblings under same parent (cell-area)
                const typedSiblings = (childrenMap[parentId] || []).filter(id => id.includes('rrp'));
                
                // Get parent center for proper alignment
                const parentCenterX = getParentCenterX(parentPos, parentId, subtreeWidths);
                
                if (typedSiblings.length === 1) {
                  // Single RRP child: center under parent
                  const nodeWidth = getNodeWidth(nodeId);
                  const x = parentCenterX - nodeWidth / 2;
                  
                  const position = { x, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ Single RRP ${nodeId} centered under parent at (${x}, ${y})`);
                } else {
                  // Multiple RRP siblings: distribute compactly under parent
                  const nodeIndex = typedSiblings.indexOf(nodeId);
                  const gutter = 50; // Compact spacing for clean layout
                  
                  // Use node widths + small margin for compact upper level
                  const totalSiblingWidth = typedSiblings.reduce((sum, sibId) => {
                    return sum + getNodeWidth(sibId);
                  }, 0);
                  const totalGutterWidth = (typedSiblings.length - 1) * gutter;
                  const totalWidth = totalSiblingWidth + totalGutterWidth;
                  
                  // Start from left edge of the group, centered under parent
                  const startX = parentCenterX - totalWidth / 2;
                  
                  // Calculate cumulative position for this specific node
                  let cumulativeX = startX;
                  for (let i = 0; i < nodeIndex; i++) {
                    cumulativeX += getNodeWidth(typedSiblings[i]) + gutter;
                  }
                  
                  const position = { x: cumulativeX, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ RRP ${nodeId} positioned under parent at (${cumulativeX}, ${y})`);
                }
              } else {
                // Fallback: position using node width
                const nodeWidth = getNodeWidth(nodeId);
                const x = 0 - nodeWidth / 2;
                const position = { x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ RRP ${nodeId} fallback positioned at (${x}, ${y})`);
              }
            } else if (isCellAreaNode && level === cellAreaLevel) {
              // Position cell-area nodes per-parent for organized layout
              const parentIds = allParentsMap[nodeId] || [];
              const parentId = parentIds[0];
              
              if (parentId && nodePositionMap[parentId]) {
                const parentPos = nodePositionMap[parentId];
                
                // Get all cell-area siblings under same parent (network)
                const typedSiblings = (childrenMap[parentId] || []).filter(id => id.includes('cell-area'));
                
                // Get parent center for proper alignment
                const parentCenterX = getParentCenterX(parentPos, parentId, subtreeWidths);
                
                if (typedSiblings.length === 1) {
                  // Single cell-area child: center under parent
                  const nodeWidth = getNodeWidth(nodeId);
                  const x = parentCenterX - nodeWidth / 2;
                  
                  const position = { x, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ Single Cell-area ${nodeId} centered under parent at (${x}, ${y})`);
                } else {
                  // Multiple cell-area siblings: distribute with moderate spacing
                  const nodeIndex = typedSiblings.indexOf(nodeId);
                  const gutter = 80; // Moderate spacing for upper level
                  
                  // Use node widths + small subtree allowance for balanced layout
                  const totalSiblingWidth = typedSiblings.reduce((sum, sibId) => {
                    const nodeWidth = getNodeWidth(sibId);
                    const subtreeWidth = subtreeWidths.get(sibId) || nodeWidth;
                    // Limited subtree influence: 30% for less spread
                    return sum + (nodeWidth + (subtreeWidth - nodeWidth) * 0.3);
                  }, 0);
                  const totalGutterWidth = (typedSiblings.length - 1) * gutter;
                  const totalWidth = totalSiblingWidth + totalGutterWidth;
                  
                  // Start from left edge of the group, centered under parent
                  const startX = parentCenterX - totalWidth / 2;
                  
                  // Calculate cumulative position for this specific node
                  let cumulativeX = startX;
                  for (let i = 0; i < nodeIndex; i++) {
                    const sibNodeWidth = getNodeWidth(typedSiblings[i]);
                    const sibSubtreeWidth = subtreeWidths.get(typedSiblings[i]) || sibNodeWidth;
                    cumulativeX += (sibNodeWidth + (sibSubtreeWidth - sibNodeWidth) * 0.3) + gutter;
                  }
                  
                  const position = { x: cumulativeX, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ Cell-area ${nodeId} positioned under parent at (${cumulativeX}, ${y})`);
                }
              } else {
                // Fallback: position using node width
                const nodeWidth = getNodeWidth(nodeId);
                const x = 0 - nodeWidth / 2;
                const position = { x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ Cell-area ${nodeId} fallback positioned at (${x}, ${y})`);
              }
              // Cell area positioned
            } else if (isSNssaiNode && level === sNssaiLevel) {
              // Multi-parent support for S-NSSAI nodes with width-aware positioning
              const parentIds = allParentsMap[nodeId] || [];
              const parentId = parentIds[0];
              
              if (parentId && nodePositionMap[parentId]) {
                const parentPos = nodePositionMap[parentId];
                
                // Get all S-NSSAI siblings that share the same parent
                const typedSiblings = allSNssaiNodes.filter(sNssaiId => {
                  const sNssaiParents = allParentsMap[sNssaiId] || [];
                  return sNssaiParents.includes(parentId);
                });
                
                // Get parent center for proper alignment using subtree width
                const parentCenterX = getParentCenterX(parentPos, parentId, subtreeWidths);
                
                if (typedSiblings.length === 1) {
                  // Single S-NSSAI child: center under parent using subtree width
                  const nodeWidth = subtreeWidths.get(nodeId) || getNodeWidth(nodeId, 's-nssai');
                  const x = parentCenterX - nodeWidth / 2;
                  
                  const position = { x, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ Single S-NSSAI ${nodeId} centered under parent at (${x}, ${y})`);
                } else {
                  // Multiple S-NSSAI siblings: distribute with actual widths
                  const nodeIndex = typedSiblings.indexOf(nodeId);
                  const gutter = 60; // Spacing between nodes
                  
                  // Calculate total width needed for all siblings using subtree widths
                  const totalSiblingWidth = typedSiblings.reduce((sum, sibId) => {
                    return sum + (subtreeWidths.get(sibId) || getNodeWidth(sibId, 's-nssai'));
                  }, 0);
                  const totalGutterWidth = (typedSiblings.length - 1) * gutter;
                  const totalWidth = totalSiblingWidth + totalGutterWidth;
                  
                  // Start from left edge of the group, centered under parent
                  const startX = parentCenterX - totalWidth / 2;
                  
                  // Calculate cumulative position for this specific node using subtree widths
                  let cumulativeX = startX;
                  for (let i = 0; i < nodeIndex; i++) {
                    cumulativeX += (subtreeWidths.get(typedSiblings[i]) || getNodeWidth(typedSiblings[i], 's-nssai')) + gutter;
                  }
                  
                  const position = { x: cumulativeX, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ S-NSSAI ${nodeId} positioned with width-aware spacing at (${cumulativeX}, ${y})`);
                }
              } else {
                // Fallback: position using standard width
                const nodeWidth = getNodeWidth(nodeId, 's-nssai');
                const x = 0 - nodeWidth / 2; // Center at origin
                const position = { x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ S-NSSAI ${nodeId} fallback positioned at (${x}, ${y})`);
              }
            } else if (nodeId.includes('qosflow')) {
              // QoS Flow nodes with width-aware positioning to prevent overlap
              const parentIds = allParentsMap[nodeId] || [];
              const parentId = parentIds[0];
              
              if (parentId && nodePositionMap[parentId]) {
                const parentPos = nodePositionMap[parentId];
                
                // Get all QoS Flow siblings that share the same parent
                const typedSiblings = Object.keys(allParentsMap)
                  .filter(id => id.includes('qosflow'))
                  .filter(qosId => {
                    const qosParents = allParentsMap[qosId] || [];
                    return qosParents.includes(parentId);
                  });
                
                // Get parent center for proper alignment using subtree width
                const parentCenterX = getParentCenterX(parentPos, parentId, subtreeWidths);
                
                if (typedSiblings.length === 1) {
                  // Single QoS Flow child: center under parent using subtree width
                  const nodeWidth = subtreeWidths.get(nodeId) || getNodeWidth(nodeId, 'qosflow');
                  const x = parentCenterX - nodeWidth / 2;
                  
                  const position = { x, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ Single QoS Flow ${nodeId} centered under parent at (${x}, ${y})`);
                } else {
                  // Multiple QoS Flow siblings: distribute with subtree widths
                  const nodeIndex = typedSiblings.indexOf(nodeId);
                  const gutter = 60;
                  
                  // Calculate total width needed for all siblings using subtree widths
                  const totalSiblingWidth = typedSiblings.reduce((sum, sibId) => {
                    return sum + (subtreeWidths.get(sibId) || getNodeWidth(sibId, 'qosflow'));
                  }, 0);
                  const totalGutterWidth = (typedSiblings.length - 1) * gutter;
                  const totalWidth = totalSiblingWidth + totalGutterWidth;
                  
                  // Start from left edge of the group, centered under parent
                  const startX = parentCenterX - totalWidth / 2;
                  
                  // Calculate cumulative position for this specific node using subtree widths
                  let cumulativeX = startX;
                  for (let i = 0; i < nodeIndex; i++) {
                    cumulativeX += (subtreeWidths.get(typedSiblings[i]) || getNodeWidth(typedSiblings[i], 'qosflow')) + gutter;
                  }
                  
                  const position = { x: cumulativeX, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ QoS Flow ${nodeId} positioned with subtree width spacing at (${cumulativeX}, ${y})`);
                }
              } else {
                // Fallback: position using subtree width
                const nodeWidth = subtreeWidths.get(nodeId) || getNodeWidth(nodeId, 'qosflow');
                const x = 0 - nodeWidth / 2;
                const position = { x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ QoS Flow ${nodeId} fallback positioned at (${x}, ${y})`);
              }
            } else if (isFiveQiNode && level === fiveQiLevel) {
              // 5QI nodes with width-aware positioning  
              const parentIds = allParentsMap[nodeId] || [];
              const parentId = parentIds[0];
              
              if (parentId && nodePositionMap[parentId]) {
                const parentPos = nodePositionMap[parentId];
                
                // Get all 5QI siblings that share the same parent
                const typedSiblings = allFiveQiNodes.filter(fiveQiId => {
                  const fiveQiParents = allParentsMap[fiveQiId] || [];
                  return fiveQiParents.includes(parentId);
                });
                
                // Get parent center for proper alignment using subtree width
                const parentCenterX = getParentCenterX(parentPos, parentId, subtreeWidths);
                
                if (typedSiblings.length === 1) {
                  // Single 5QI child: center under parent using subtree width
                  const nodeWidth = subtreeWidths.get(nodeId) || getNodeWidth(nodeId, 'fiveqi');
                  const x = parentCenterX - nodeWidth / 2;
                  
                  const position = { x, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ Single 5QI ${nodeId} centered under parent at (${x}, ${y})`);
                } else {
                  // Multiple 5QI siblings: distribute with subtree widths
                  const nodeIndex = typedSiblings.indexOf(nodeId);
                  const gutter = 60;
                  
                  // Calculate total width needed for all siblings using subtree widths
                  const totalSiblingWidth = typedSiblings.reduce((sum, sibId) => {
                    return sum + (subtreeWidths.get(sibId) || getNodeWidth(sibId, 'fiveqi'));
                  }, 0);
                  const totalGutterWidth = (typedSiblings.length - 1) * gutter;
                  const totalWidth = totalSiblingWidth + totalGutterWidth;
                  
                  // Start from left edge of the group, centered under parent
                  const startX = parentCenterX - totalWidth / 2;
                  
                  // Calculate cumulative position for this specific node using subtree widths
                  let cumulativeX = startX;
                  for (let i = 0; i < nodeIndex; i++) {
                    cumulativeX += (subtreeWidths.get(typedSiblings[i]) || getNodeWidth(typedSiblings[i], 'fiveqi')) + gutter;
                  }
                  
                  const position = { x: cumulativeX, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`✓ 5QI ${nodeId} positioned with subtree width spacing at (${cumulativeX}, ${y})`);
                }
              } else {
                // Fallback: position using subtree width
                const nodeWidth = subtreeWidths.get(nodeId) || getNodeWidth(nodeId, 'fiveqi');
                const x = 0 - nodeWidth / 2;
                const position = { x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ 5QI ${nodeId} fallback positioned at (${x}, ${y})`);
              }
              // 5QI node positioned with subtree width spacing
            } else {
              // Check for RRP-member nodes first (both single and multiple)
              const isRrpMember = nodeId.includes('rrpmember');
              
              if (isRrpMember) {
                // RRP-member nodes: Position symmetrically BELOW parent (not at same level)
                // Handle both single and multiple RRP members consistently
                const rrpMemberY = parentPos.y + 550; // Much larger vertical spacing since RRP nodes are very tall
                
                if (siblings.length === 1) {
                  // Single RRP member: position directly below parent
                  const position = { x: parentPos.x, y: rrpMemberY };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  // Single RRP member positioned below parent
                } else {
                  // Multiple RRP members: spread symmetrically below parent
                  const nodeIndex = siblings.indexOf(nodeId);
                  const tightSpacing = 200; // Spacing between RRP-member nodes
                  
                  // Center children around parent center with correct calculation
                  const parentCenterX = parentPos.x + 120; // Parent's visual center (try wider offset)
                  
                  let x: number;
                  let childCenterX: number;
                  
                  // For symmetric positioning around parent center
                  if (siblings.length === 2) {
                    // For 2 children: position them equally spaced around parent center
                    const halfSpacing = tightSpacing / 2; // 100px each side of center
                    childCenterX = nodeIndex === 0 
                      ? parentCenterX - halfSpacing  // First child to the left
                      : parentCenterX + halfSpacing; // Second child to the right
                    
                    // Convert to top-left positioning
                    x = childCenterX - 90; // Subtract half node width
                    // Children positioned symmetrically around parent center
                  } else {
                    // For other counts, use the original logic
                    const totalWidth = (siblings.length - 1) * tightSpacing;
                    const startX = parentCenterX - totalWidth / 2;
                    childCenterX = startX + nodeIndex * tightSpacing;
                    x = childCenterX - 90;
                  }
                  
                  const position = { x, y: rrpMemberY };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  // RRP member positioned below parent
                }
              } else if (siblings.length === 1) {
                // Single child: directly under parent (for non-RRP member nodes)
                const position = { x: parentPos.x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ Single child ${nodeId} under parent at (${parentPos.x}, ${y})`);
              } else {
                // Multiple siblings: spread them around parent with proper spacing
                const nodeIndex = siblings.indexOf(nodeId);
                const spacing = 350; // Default spacing
                
                const totalWidth = (siblings.length - 1) * spacing;
                const startX = parentPos.x - totalWidth / 2;
                const x = startX + nodeIndex * spacing;
                
                const position = { x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ Sibling ${nodeId} (${nodeIndex + 1}/${siblings.length}) at (${x}, ${y}) - spacing: ${spacing}px, totalWidth: ${totalWidth}px`);
              }
            }
          } else {
            // Parent not positioned yet, use center
            const position = { x: 0, y };
            positionedNodes.push({ id: nodeId, position });
            nodePositionMap[nodeId] = position;
            console.log(`✓ Fallback ${nodeId} at (0, ${y})`);
          }
        }
      });
    }
  });

  // Calculate the bounds of all positioned nodes to center the entire graph
  const allXPositions = positionedNodes.map(p => p.position.x);
  const minX = Math.min(...allXPositions);
  const maxX = Math.max(...allXPositions);
  const graphWidth = maxX - minX;
  const graphCenterX = (minX + maxX) / 2;
  
  // Shift all nodes so the graph center is at X=0
  const centeredNodes = positionedNodes.map(p => ({
    ...p,
    position: {
      x: p.position.x - graphCenterX,
      y: p.position.y
    }
  }));
  
  console.log(`🎯 Graph centering: minX=${minX}, maxX=${maxX}, width=${graphWidth}, centerOffset=${graphCenterX}`);

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
