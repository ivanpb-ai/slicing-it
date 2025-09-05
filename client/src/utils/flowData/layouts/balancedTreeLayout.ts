
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
  
  // Removed excessive debug logging for performance

  // No need for subtree width calculation in DAG layout

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
      y = 100 + (level - 1) * 450 + maxPrevLevelHeight + 150; // Increased spacing for better separation
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
              // SPECIAL CASE: Position ALL DNN nodes with consistent spacing across the entire level
              const nodeIndex = allDnnNodes.indexOf(nodeId);
              const dnnSpacing = 400; // Increased spacing for DNN nodes to prevent overlap
              const totalDnnWidth = (allDnnNodes.length - 1) * dnnSpacing;
              const startX = 0 - totalDnnWidth / 2; // Center around X=0
              const x = startX + nodeIndex * dnnSpacing;
              
              const position = { x, y };
              positionedNodes.push({ id: nodeId, position });
              nodePositionMap[nodeId] = position;
              // DNN node positioned with global spacing
            } else if (isRrpNode && level === rrpLevel) {
              // SPECIAL CASE: Position ALL RRP nodes with consistent spacing for uniform edge lengths
              const nodeIndex = allRrpNodes.indexOf(nodeId);
              const rrpSpacing = 400; // Consistent spacing for RRP nodes
              const totalRrpWidth = (allRrpNodes.length - 1) * rrpSpacing;
              const startX = 0 - totalRrpWidth / 2; // Center around X=0
              const x = startX + nodeIndex * rrpSpacing;
              
              const position = { x, y };
              positionedNodes.push({ id: nodeId, position });
              nodePositionMap[nodeId] = position;
              // RRP positioned
            } else if (isCellAreaNode && level === cellAreaLevel) {
              // SPECIAL CASE: Position ALL cell-area nodes with consistent spacing for uniform edge lengths
              const nodeIndex = allCellAreaNodes.indexOf(nodeId);
              const cellAreaSpacing = 400; // Consistent spacing for cell-area nodes
              const totalCellAreaWidth = (allCellAreaNodes.length - 1) * cellAreaSpacing;
              const startX = 0 - totalCellAreaWidth / 2; // Center around X=0
              const x = startX + nodeIndex * cellAreaSpacing;
              
              const position = { x, y };
              positionedNodes.push({ id: nodeId, position });
              nodePositionMap[nodeId] = position;
              // Cell area positioned
            } else if (isSNssaiNode && level === sNssaiLevel) {
              // Position S-NSSAI nodes close to their parent instead of unified horizontal group
              if (siblings.length === 1) {
                // Single S-NSSAI child: position directly under parent
                const position = { x: parentPos.x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ Single S-NSSAI ${nodeId} centered under parent at (${parentPos.x}, ${y})`);
              } else {
                // Multiple S-NSSAI siblings: spread around parent with close spacing
                const nodeIndex = siblings.indexOf(nodeId);
                const spacing = 250; // Closer spacing to keep near parent
                const totalWidth = (siblings.length - 1) * spacing;
                const startX = parentPos.x - totalWidth / 2;
                const x = startX + nodeIndex * spacing;
                
                const position = { x, y };
                positionedNodes.push({ id: nodeId, position });
                nodePositionMap[nodeId] = position;
                console.log(`✓ S-NSSAI ${nodeId} positioned near parent at (${x}, ${y})`);
              }
            } else if (isFiveQiNode && level === fiveQiLevel) {
              // SPECIAL CASE: Position ALL 5QI nodes with consistent spacing across the entire level
              const nodeIndex = allFiveQiNodes.indexOf(nodeId);
              const fiveQiSpacing = 350; // Increased spacing for 5QI nodes to prevent overlap
              const totalFiveQiWidth = (allFiveQiNodes.length - 1) * fiveQiSpacing;
              const startX = 0 - totalFiveQiWidth / 2; // Center around X=0
              const x = startX + nodeIndex * fiveQiSpacing;
              
              const position = { x, y };
              positionedNodes.push({ id: nodeId, position });
              nodePositionMap[nodeId] = position;
              // 5QI node positioned with global spacing
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
