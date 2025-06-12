
import React, { useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { enforceParentChildPositioning } from '@/utils/flowData/layouts/treeLayout/hierarchyEnforcement/parentChildEnforcer';
import { positionCellAreaNodes } from '@/utils/flowData/layouts/treeLayout/hierarchyEnforcement/cellAreaPositioner';
import { distributeCellAreaNodes } from '@/utils/flowData/layouts/treeLayout/hierarchyEnforcement/cellAreaDistributor';

interface FlowParentChildVerifierProps {
  nodes: Node[];
  edges: Edge[];
  onEdgesChange: (changes: any) => void;
}

/**
 * Component that ensures proper parent-child relationships are maintained in the flow
 * and adjusts cell-area nodes to prevent overlap and enforce positioning below network nodes
 */
export const FlowParentChildVerifier: React.FC<FlowParentChildVerifierProps> = ({ 
  nodes, 
  edges, 
  onEdgesChange 
}) => {
  // Effect to ensure proper node connections for parent-child relationships
  useEffect(() => {
    // Define the valid hierarchy of node relationships - updated hierarchy
    const hierarchyRelationships = [
      { parent: 'network', child: 'cell-area' },
      { parent: 'cell-area', child: 'rrp' },
      { parent: 'rrp', child: 'rrpmember' },
      { parent: 'rrpmember', child: 's-nssai' },
      { parent: 's-nssai', child: 'dnn' },
      { parent: 'dnn', child: '5qi' }
    ];
    
    // Process each relationship type
    hierarchyRelationships.forEach(({ parent, child }) => {
      const parentNodes = nodes.filter(node => node.data?.type === parent);
      const childNodes = nodes.filter(node => node.data?.type === child);
      
      if (parentNodes.length === 0 || childNodes.length === 0) {
        return;
      }
      
      // For each child node, find its linked parent or the nearest appropriate parent
      childNodes.forEach(childNode => {
        // Skip if already connected to any parent node of the correct type
        const isConnected = edges.some(edge => 
          edge.target === childNode.id && 
          parentNodes.some(n => n.id === edge.source)
        );
        
        if (!isConnected && parentNodes.length > 0) {
          // If there's a parent specified in the data, use that
          const specifiedParentId = childNode.data?.parentId;
          const specifiedParent = specifiedParentId ? 
            parentNodes.find(n => n.id === specifiedParentId) : null;
          
          // Use specified parent or find the closest parent
          let parentNode = specifiedParent;
          
          // If no specified parent, find the closest one
          if (!parentNode) {
            // For cell-area nodes, find the closest network node
            if (child === 'cell-area') {
              let closestNode = parentNodes[0];
              let minDistance = Infinity;
              
              parentNodes.forEach(networkNode => {
                const distance = Math.abs(networkNode.position.x - childNode.position.x);
                if (distance < minDistance) {
                  minDistance = distance;
                  closestNode = networkNode;
                }
              });
              
              parentNode = closestNode;
            } else {
              // For other node types, just use the first available parent
              parentNode = parentNodes[0];
            }
          }
          
          // Create a straight edge to visually connect them
          const newEdge = {
            id: `e-${parentNode.id}-${childNode.id}`,
            source: parentNode.id,
            target: childNode.id,
            sourceHandle: 'bottom-source',
            targetHandle: 'top-target',
            type: 'straight',
            style: { stroke: '#94a3b8', strokeWidth: 2, opacity: 1 },
            data: {
              curvature: 0,
              shortened: false,
              shortenFactor: 0,
              persistent: true,
              permanent: true,
              preserveEdge: true,
              optimized: true,
              visible: true,
              forceVisible: true,
              maintainVisibility: true
            }
          };
          
          // Add the edge
          onEdgesChange({
            type: 'add',
            item: newEdge
          });
          
          console.log(`Connected ${childNode.id} to ${parent} node ${parentNode.id}`);
          
          // Adjust position based on parent-child relationship with ultra-compact spacing
          let yOffset = 30; // Reduced by 90% from 300 to 30
          
          // Special case for cell-area nodes
          if (parent === 'network' && child === 'cell-area') {
            yOffset = 30; // Reduced by 90% from 300 to 30
            
            // Position directly below parent and align X position
            childNode.position = {
              x: parentNode.position.x, // Align with parent x-position
              y: parentNode.position.y + yOffset // Position below with reduced spacing
            };
            
            // Set the parentId in the node data for future reference
            if (childNode.data) {
              childNode.data = {
                ...childNode.data,
                parentId: parentNode.id
              };
            }
            
            console.log(`Positioned cell-area node ${childNode.id} directly below network node ${parentNode.id}`);
          } else {
            // For other node types, maintain standard positioning with reduced spacing
            childNode.position = {
              x: parentNode.position.x,
              y: parentNode.position.y + yOffset
            };
          }
        }
      });
    });
    
    // Create a simplified relationship structure for the enforcer functions
    const relationships = {
      childrenMap: {} as Record<string, string[]>,
      parentMap: {} as Record<string, string>,
      rootNodes: [] as Node[]
    };
    
    // Build relationship maps from edges
    edges.forEach(edge => {
      const sourceId = edge.source;
      const targetId = edge.target;
      
      if (!relationships.childrenMap[sourceId]) {
        relationships.childrenMap[sourceId] = [];
      }
      
      if (!relationships.childrenMap[sourceId].includes(targetId)) {
        relationships.childrenMap[sourceId].push(targetId);
      }
      
      relationships.parentMap[targetId] = sourceId;
    });
    
    // Apply the specialized cell area positioning logic
    const { nodes: positionedNodes, changed } = positionCellAreaNodes(nodes);
    
    if (changed) {
      // Apply horizontal distribution to prevent cell area overlaps
      const distributedNodes = distributeCellAreaNodes(positionedNodes);
      
      // Update any modified nodes
      distributedNodes.forEach(updatedNode => {
        const originalNode = nodes.find(n => n.id === updatedNode.id);
        if (originalNode) {
          originalNode.position = {...updatedNode.position};
          
          if (updatedNode.data?.parentId && originalNode.data) {
            originalNode.data.parentId = updatedNode.data.parentId;
          }
        }
      });
    }
    
    // Dispatch events to ensure edge visibility
    window.dispatchEvent(new CustomEvent('edge-created'));
    window.dispatchEvent(new CustomEvent('force-edge-redraw'));
  }, [nodes, edges, onEdgesChange]);
  
  return null;
};

export default FlowParentChildVerifier;
