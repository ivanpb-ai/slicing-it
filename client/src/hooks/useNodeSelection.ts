
import { useCallback, useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from "sonner";
import { 
  filterDeletedNodes, 
  filterDeletedEdges,
  removeEdgesForDeletedNodes,
  createDuplicatedNodes
} from '@/utils/flowData/nodeEdgeOperations';

export const useNodeSelection = (
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  const [selectedElements, setSelectedElements] = useState<{ 
    nodes: Node[]; 
    edges: Edge[] 
  }>({
    nodes: [],
    edges: [],
  });

  // Handle node selection
  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedElements({ nodes, edges });
      console.log(`Selection changed: ${nodes.length} nodes, ${edges.length} edges selected`);
      
      if (nodes.length > 0) {
        console.log(`Selected node types: ${nodes.map(n => n.data?.type).join(', ')}`);
        console.log(`Selected node IDs: ${nodes.map(n => n.id).join(', ')}`);
      }
    },
    [],
  );

  // Delete selected nodes and any connected edges
  const deleteSelected = useCallback(() => {
    if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) {
      console.log('No elements selected for deletion');
      return;
    }
    
    console.log(`Deleting ${selectedElements.nodes.length} nodes and ${selectedElements.edges.length} edges`);
    
    // Get IDs of nodes being deleted
    const deletedNodeIds = selectedElements.nodes.map(node => node.id);
    
    // First update nodes
    const updatedNodes = filterDeletedNodes(nodes, selectedElements.nodes);
    
    // Then update edges - first remove selected edges, then remove edges connected to deleted nodes
    let updatedEdges = filterDeletedEdges(edges, selectedElements.edges);
    updatedEdges = removeEdgesForDeletedNodes(updatedEdges, deletedNodeIds);
    
    console.log(`After deletion: ${updatedNodes.length} nodes and ${updatedEdges.length} edges remain`);
    
    // Update the state
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    
    // Clear selection after deletion
    setSelectedElements({ nodes: [], edges: [] });
    
    toast.success('Selected elements deleted');
  }, [selectedElements, setNodes, setEdges, nodes, edges]);

  // Duplicate selected nodes
  const duplicateSelected = useCallback(() => {
    if (selectedElements.nodes.length === 0) return;

    const newNodes = createDuplicatedNodes(selectedElements.nodes, nodes);
    if (newNodes) {
      setNodes((nds) => [...nds, ...newNodes]);
      toast.success('Selected nodes duplicated');
    }
  }, [selectedElements.nodes, setNodes, nodes]);

  return {
    selectedElements,
    onSelectionChange,
    deleteSelected,
    duplicateSelected,
  };
};
