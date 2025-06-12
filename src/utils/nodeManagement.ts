
import { Node, Edge, MarkerType } from '@xyflow/react';
import { toast } from "sonner";
import { hasNetworkNode } from '@/utils/flowData/nodeCreation';

// Delete selected nodes
export const filterDeletedNodes = (
  nodes: Node[],
  selectedNodes: Node[]
): Node[] => {
  if (selectedNodes.length === 0) {
    return nodes;
  }
  
  const nodesToDelete = new Set(selectedNodes.map(node => node.id));
  
  // Also remove child nodes when parent is deleted
  selectedNodes.forEach(node => {
    nodes.forEach(n => {
      if (n.parentId === node.id) {
        nodesToDelete.add(n.id);
      }
    });
  });
  
  console.log(`Deleting nodes: ${Array.from(nodesToDelete).join(', ')}`);
  
  // Create a new array excluding the nodes to delete
  const filteredNodes = nodes.filter(node => !nodesToDelete.has(node.id));
  
  // Debug log the count of nodes before and after deletion
  console.log(`Original node count: ${nodes.length}, Filtered node count: ${filteredNodes.length}`);
  console.log(`Node IDs being deleted: ${Array.from(nodesToDelete).join(', ')}`);
  
  // Verify each node that should be deleted is actually removed
  selectedNodes.forEach(node => {
    const stillExists = filteredNodes.some(n => n.id === node.id);
    if (stillExists) {
      console.error(`Failed to delete node ${node.id} of type ${node.data?.type}`);
    }
  });
  
  return filteredNodes;
};

// Delete selected edges
export const filterDeletedEdges = (
  edges: Edge[],
  selectedEdges: Edge[]
): Edge[] => {
  if (selectedEdges.length === 0) {
    return edges;
  }
  
  console.log(`Deleting edges: ${selectedEdges.map(e => e.id).join(', ')}`);
  
  // Also delete edges connected to deleted nodes
  const deletedNodeIds = new Set(selectedEdges.map(edge => edge.id));
  
  // Create a new array excluding the edges to delete
  const filteredEdges = edges.filter(
    (edge) => !selectedEdges.some((e) => e.id === edge.id)
  );
  
  // Debug log the count of edges before and after deletion
  console.log(`Original edge count: ${edges.length}, Filtered edge count: ${filteredEdges.length}`);
  
  return filteredEdges;
};

// Also delete edges connected to deleted nodes
export const removeEdgesForDeletedNodes = (
  edges: Edge[],
  deletedNodeIds: string[]
): Edge[] => {
  if (deletedNodeIds.length === 0) {
    return edges;
  }
  
  const nodeIdSet = new Set(deletedNodeIds);
  
  return edges.filter(
    edge => !nodeIdSet.has(edge.source) && !nodeIdSet.has(edge.target)
  );
};

// Add this function if it doesn't exist, or update it if it does
// Make sure the function returns an object with newNodes and newEdges properties
export const createDuplicatedNodes = (
  selectedNodes: Node[],
  nodes: Node[],
  edges: Edge[]
): { newNodes: Node[], newEdges: Edge[] } | null => {
  // Check if we're trying to duplicate a network node
  if (
    selectedNodes.some(node => node.data?.type === 'network') && 
    hasNetworkNode(nodes)
  ) {
    return null;
  }

  const newNodes = selectedNodes.map((node) => ({
    ...node,
    id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    position: {
      x: node.position.x + 20,
      y: node.position.y + 20,
    },
  }));

  const newEdges: Edge[] = [];
  
  // Return both the new nodes and edges
  return { newNodes, newEdges };
};
