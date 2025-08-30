
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
): { nodes: Node[], cleanedEdges: Edge[] } => {
  if (nodes.length === 0) return { nodes, cleanedEdges: edges };

  const {
    nodeWidth = 180,
    nodeHeight = 120,
    horizontalSpacing = 800,
    verticalSpacing = 200,  // Increased for better visual separation
    marginX = 400,
    marginY = 100
  } = options;

  console.log('✅ BALANCED TREE LAYOUT: Starting balanced hierarchical arrangement with', nodes.length, 'nodes');

  // Create node ID set for validation
  const nodeIds = new Set(nodes.map(node => node.id));
  console.log('Available node IDs:', Array.from(nodeIds));

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
  
  // DEBUG: Log specific RRP-member relationships
  Object.keys(allParentsMap).forEach(nodeId => {
    if (nodeId.includes('rrpmember')) {
      console.log(`🔍 RRP-member ${nodeId} has parents:`, allParentsMap[nodeId]);
    }
  });
  Object.keys(childrenMap).forEach(nodeId => {
    if (nodeId.includes('rrp-') && !nodeId.includes('rrpmember')) {
      console.log(`🔍 RRP ${nodeId} has children:`, childrenMap[nodeId]);
    }
  });

  // No need for subtree width calculation in DAG layout

  // SIMPLE HIERARCHICAL POSITIONING ALGORITHM
  const positionedNodes: { id: string; position: { x: number; y: number } }[] = [];
  const nodePositionMap: Record<string, { x: number; y: number }> = {};
  
  // Pre-process to find all DNN, RRP, cell-area, and S-NSSAI nodes and their levels
  const allDnnNodes: string[] = [];
  const allRrpNodes: string[] = [];
  const allCellAreaNodes: string[] = [];
  const allSNssaiNodes: string[] = [];
  let dnnLevel = -1;
  let rrpLevel = -1;
  let cellAreaLevel = -1;
  let sNssaiLevel = -1;
  Object.entries(nodesByLevel).forEach(([levelStr, nodesInLevel]) => {
    const dnnNodesInLevel = nodesInLevel.filter(nodeId => nodeId.includes('dnn-'));
    const rrpNodesInLevel = nodesInLevel.filter(nodeId => nodeId.includes('rrp-') && !nodeId.includes('rrpmember'));
    const cellAreaNodesInLevel = nodesInLevel.filter(nodeId => nodeId.includes('cell-area-'));
    const sNssaiNodesInLevel = nodesInLevel.filter(nodeId => nodeId.includes('s-nssai-'));
    
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
  });
  console.log(`🎯 Found ${allDnnNodes.length} DNN nodes at level ${dnnLevel}: ${allDnnNodes.join(', ')}`);
  console.log(`🎯 Found ${allRrpNodes.length} RRP nodes at level ${rrpLevel}: ${allRrpNodes.join(', ')}`);
  console.log(`🎯 Found ${allCellAreaNodes.length} cell-area nodes at level ${cellAreaLevel}: ${allCellAreaNodes.join(', ')}`);
  console.log(`🎯 Found ${allSNssaiNodes.length} S-NSSAI nodes at level ${sNssaiLevel}: ${allSNssaiNodes.join(', ')}`);
  
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
      y = 100 + (level - 1) * 350 + maxPrevLevelHeight + 100; // 100px buffer for clear separation
    }
    
    console.log(`\n=== LEVEL ${level} (Y=${y}) ===`);
    console.log(`Nodes to position: ${nodesInLevel.join(', ')}`);
    
    if (level === 0) {
      // Root level: center everything at x=0
      nodesInLevel.forEach(nodeId => {
        const position = { x: 0, y };
        positionedNodes.push({ id: nodeId, position });
        nodePositionMap[nodeId] = position;
        console.log(`✓ Root ${nodeId} at (0, ${y})`);
      });
    } else {
      // Position based on parents
      nodesInLevel.forEach(nodeId => {
        const parents = allParentsMap[nodeId] || [];
        console.log(`\nPositioning ${nodeId} - Parents: ${parents.join(', ')}`);
        
        if (parents.length === 0) {
          // No parents: center at x=0
          const position = { x: 0, y };
          positionedNodes.push({ id: nodeId, position });
          nodePositionMap[nodeId] = position;
          console.log(`✓ Orphan ${nodeId} at (0, ${y})`);
        } else {
          // Position based on first parent for simplicity
          const parentPos = nodePositionMap[parents[0]];
          if (parentPos) {
            // Check how many siblings this node has
            const siblings = (childrenMap[parents[0]] || []).filter(child => 
              nodesByLevel[level] && nodesByLevel[level].includes(child)
            );
            
            if (siblings.length === 1) {
              // Single child: directly under parent
              const position = { x: parentPos.x, y };
              positionedNodes.push({ id: nodeId, position });
              nodePositionMap[nodeId] = position;
              console.log(`✓ Single child ${nodeId} under parent at (${parentPos.x}, ${y})`);
            } else {
              // Multiple siblings: SPECIAL CASE for RRP-member nodes
              const isRrpMember = nodeId.includes('rrpmember');
              
              if (isRrpMember) {
                // RRP-member nodes: Position symmetrically below parent centered around parent's VISUAL center
                const nodeIndex = siblings.indexOf(nodeId);
                const tightSpacing = 150; // Spacing between RRP-member nodes
                
                // Calculate parent's VISUAL center (position + half of node width)
                // React Flow positions nodes by their top-left corner, so we need to offset to get visual center
                const parentVisualCenterX = parentPos.x + nodeWidth / 2;
                console.log(`🔍 VISUAL CENTER: Parent ${parents[0]} visual center at ${parentVisualCenterX} (position: ${parentPos.x} + nodeWidth/2: ${nodeWidth/2})`);
                
                // Center children symmetrically around parent's VISUAL center, then offset back to top-left positioning
                const totalWidth = (siblings.length - 1) * tightSpacing;
                const childrenCenterX = parentVisualCenterX;  // Center children around parent's visual center
                const startX = childrenCenterX - totalWidth / 2;
                const childX = startX + nodeIndex * tightSpacing;
                
                // Convert back to top-left positioning for React Flow
                const x = childX - nodeWidth / 2;
                
                const position = { x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ RRP-member ${nodeId} positioned symmetrically at (${x}, ${y}) - visual center under parent visual center at ${parentVisualCenterX}`);
                console.log(`🔍 CALCULATION: childrenCenterX=${childrenCenterX}, startX=${startX}, childX=${childX}, final x=${x}`);
              } else {
                const isDnnNode = nodeId.includes('dnn-');
                
                if (isDnnNode && level === dnnLevel) {
                  // SPECIAL CASE: Position ALL DNN nodes as one unified horizontal group
                  const nodeIndex = allDnnNodes.indexOf(nodeId);
                  const dnnSpacing = 400; // Balanced spacing for all DNN nodes - not too wide, not overlapping
                  const totalDnnWidth = (allDnnNodes.length - 1) * dnnSpacing;
                  const startX = 0 - totalDnnWidth / 2; // Center around X=0
                  const x = startX + nodeIndex * dnnSpacing;
                  
                  const position = { x, y };
                  positionedNodes.push({ id: nodeId, position });
                  nodePositionMap[nodeId] = position;
                  console.log(`🎯 DNN ${nodeId} (${nodeIndex + 1}/${allDnnNodes.length}) unified at (${x}, ${y}) - spacing: ${dnnSpacing}px`);
                } else {
                  const isRrpNode = nodeId.includes('rrp-') && !nodeId.includes('rrpmember');
                  
                  if (isRrpNode && level === rrpLevel) {
                    // SPECIAL CASE: Position ALL RRP nodes with consistent spacing for uniform edge lengths
                    const nodeIndex = allRrpNodes.indexOf(nodeId);
                    const rrpSpacing = 400; // Consistent spacing for RRP nodes
                    const totalRrpWidth = (allRrpNodes.length - 1) * rrpSpacing;
                    const startX = 0 - totalRrpWidth / 2; // Center around X=0
                    const x = startX + nodeIndex * rrpSpacing;
                    
                    const position = { x, y };
                    positionedNodes.push({ id: nodeId, position });
                    nodePositionMap[nodeId] = position;
                    console.log(`🎯 RRP ${nodeId} (${nodeIndex + 1}/${allRrpNodes.length}) unified at (${x}, ${y}) - spacing: ${rrpSpacing}px`);
                  } else {
                    const isCellAreaNode = nodeId.includes('cell-area-');
                    
                    if (isCellAreaNode && level === cellAreaLevel) {
                      // SPECIAL CASE: Position ALL cell-area nodes with consistent spacing for uniform edge lengths
                      const nodeIndex = allCellAreaNodes.indexOf(nodeId);
                      const cellAreaSpacing = 400; // Consistent spacing for cell-area nodes
                      const totalCellAreaWidth = (allCellAreaNodes.length - 1) * cellAreaSpacing;
                      const startX = 0 - totalCellAreaWidth / 2; // Center around X=0
                      const x = startX + nodeIndex * cellAreaSpacing;
                      
                      const position = { x, y };
                      positionedNodes.push({ id: nodeId, position });
                      nodePositionMap[nodeId] = position;
                      console.log(`🎯 CELL-AREA ${nodeId} (${nodeIndex + 1}/${allCellAreaNodes.length}) unified at (${x}, ${y}) - spacing: ${cellAreaSpacing}px`);
                    } else {
                      const isSNssaiNode = nodeId.includes('s-nssai-');
                      
                      if (isSNssaiNode && level === sNssaiLevel) {
                        // SPECIAL CASE: Position ALL S-NSSAI nodes with consistent spacing for uniform layout
                        const nodeIndex = allSNssaiNodes.indexOf(nodeId);
                        const sNssaiSpacing = 400; // Consistent spacing for S-NSSAI nodes to prevent overlaps
                        const totalSNssaiWidth = (allSNssaiNodes.length - 1) * sNssaiSpacing;
                        const startX = 0 - totalSNssaiWidth / 2; // Center around X=0
                        const x = startX + nodeIndex * sNssaiSpacing;
                        
                        const position = { x, y };
                        positionedNodes.push({ id: nodeId, position });
                        nodePositionMap[nodeId] = position;
                        console.log(`🎯 S-NSSAI ${nodeId} (${nodeIndex + 1}/${allSNssaiNodes.length}) unified at (${x}, ${y}) - spacing: ${sNssaiSpacing}px`);
                      } else {
                        // Other siblings: spread them around parent with proper spacing
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
                  }
                }
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
