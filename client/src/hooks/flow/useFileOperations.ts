
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { resetCounters, updateDnnCounter } from '@/utils/flowData/idCounters';
import { GraphExportImportService } from '@/services/export/GraphExportImportService';
import { arrangeNodes } from '@/utils/flowData/layoutAlgorithms';

interface UseFileOperationsProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  reactFlowInstance?: any;
}

export const useFileOperations = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  setIsLoading,
  reactFlowInstance
}: UseFileOperationsProps) => {
  const reactFlow = useReactFlow();
  const flowInstance = reactFlowInstance || reactFlow;

  const handleImport = useCallback(async (file: File): Promise<void> => {
    console.log(`useFileOperations: Starting import of ${file.name}`);
    
    if (setIsLoading) {
      setIsLoading(true);
    }

    try {
      // Import the graph data using the service
      const graphData = await GraphExportImportService.importGraphFromFile(file);
      
      if (!graphData || !graphData.nodes || !Array.isArray(graphData.nodes)) {
        console.error('useFileOperations: Invalid or empty graph data', graphData);
        toast.error('Invalid graph file or empty graph');
        return;
      }

      console.log(`useFileOperations: Successfully parsed graph with ${graphData.nodes.length} nodes and ${graphData.edges?.length || 0} edges`);

      // Validate we have actual data
      if (graphData.nodes.length === 0) {
        console.warn('useFileOperations: Graph has no nodes');
        toast.warning('Graph file contains no nodes');
        return;
      }

      // Reset counters to avoid ID conflicts
      resetCounters();
      updateDnnCounter(graphData.nodes);

      // Clear existing canvas first
      console.log('useFileOperations: Clearing existing nodes and edges');
      setNodes([]);
      setEdges([]);

      // Reset viewport if available
      if (flowInstance) {
        flowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }

      // Process nodes - ensure they have the correct structure
      const processedNodes = graphData.nodes.map(node => ({
        ...node,
        type: 'customNode', // Ensure all nodes use our custom node type
        position: {
          x: typeof node.position?.x === 'number' ? node.position.x : 0,
          y: typeof node.position?.y === 'number' ? node.position.y : 0
        },
        data: {
          ...(node.data || {}),
          label: node.data?.label || node.id || 'Unnamed Node',
          type: node.data?.type || 'generic'
        }
      }));

      // Process edges - ensure they have the correct structure
      const processedEdges = (graphData.edges || []).map(edge => ({
        ...edge,
        id: edge.id || `e-${edge.source}-${edge.target}-${Date.now()}`,
        source: String(edge.source),
        target: String(edge.target),
        type: edge.type || 'default',
        style: edge.style || { stroke: '#2563eb', strokeWidth: 3 }
      }));

      // Apply layout arrangement for better visual organization
      const arrangedNodes = arrangeNodes(
        processedNodes,
        processedEdges,
        {
          type: 'vertical',
          spacing: 113, // Use the correct 3cm spacing
          compactFactor: 0.7,
          nodeWidth: 180,
          nodeHeight: 120,
          marginX: 300,
          marginY: 120,
          preventOverlap: true,
          edgeShortenFactor: 0.9
        }
      );

      console.log(`useFileOperations: Processed ${arrangedNodes.length} nodes and ${processedEdges.length} edges`);

      // Set nodes and edges with proper timing - CRITICAL: Set them directly to state
      console.log(`useFileOperations: Setting ${arrangedNodes.length} arranged nodes to state`);
      setNodes(arrangedNodes);

      // Small delay before setting edges to ensure nodes are rendered
      setTimeout(() => {
        console.log(`useFileOperations: Setting ${processedEdges.length} processed edges to state`);
        setEdges(processedEdges);

        // Dispatch completion events after a short delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('graph-loaded'));
          window.dispatchEvent(new CustomEvent('force-node-visibility'));
          console.log('useFileOperations: Import completed successfully');
          
          toast.success(`Graph imported: ${arrangedNodes.length} nodes, ${processedEdges.length} edges`);
        }, 200);
      }, 300);

    } catch (error) {
      console.error('useFileOperations: Error during import:', error);
      toast.error('Failed to import graph: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      if (setIsLoading) {
        setTimeout(() => setIsLoading(false), 1000);
      }
    }
  }, [setNodes, setEdges, setIsLoading, flowInstance]);

  return {
    handleImport
  };
};
