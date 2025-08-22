
import { useCallback } from 'react';
import { Node, Edge, useReactFlow, MarkerType } from '@xyflow/react';
import { toast } from 'sonner';
import { updateDnnCounter, resetCounters } from '@/utils/flowData/idCounters';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';
import { GraphNodeProcessor } from '@/services/processing/GraphNodeProcessor';

export const useLoadGraph = (
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // Get the react flow instance safely - it will be undefined if not within a ReactFlowProvider
  const reactFlowInstance = useReactFlow();

  // Load a saved graph
  const loadGraph = useCallback(
    (graphData: GraphData): boolean => {
      try {
        // If setNodes/setEdges are not provided, we can't load
        if (!setNodes || !setEdges) {
          console.error('Cannot load graph: setNodes or setEdges not provided');
          toast.error('Failed to load graph');
          return false;
        }
        
        // Validate graph data
        if (!graphData) {
          console.error('Invalid graph data:', graphData);
          toast.error('Failed to load graph: Invalid data');
          return false;
        }
        
        const { nodes: savedNodes, edges: savedEdges } = graphData;
        
        console.log('Loading graph with nodes:', savedNodes?.length || 0);
        console.log('Loading graph with edges:', savedEdges?.length || 0);
        
        if (!savedNodes || !Array.isArray(savedNodes)) {
          console.error('Invalid nodes data in saved graph:', savedNodes);
          toast.error('Failed to load graph: Invalid node data');
          return false;
        }
        
        // First reset all counters to avoid ID conflicts
        resetCounters();
        
        // Then update counters based on the loaded nodes to prevent ID conflicts
        updateDnnCounter(savedNodes);
        
        // Reset viewport first to ensure clean state
        if (reactFlowInstance) {
          console.log('Resetting viewport before loading graph');
          reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
        }
        
        // Clear existing nodes and edges first
        console.log('Clearing existing nodes and edges before loading new graph');
        setNodes([]);
        setEdges([]);
        
        // Process nodes with proper structure using our processor
        const processedNodes = GraphNodeProcessor.prepareNodesForLoading(savedNodes);
        
        // Make sure edges is a valid array
        const validEdges = Array.isArray(savedEdges) ? savedEdges : [];
        console.log(`Valid edges count: ${validEdges.length}`);
        
        // First normalize handle IDs then process edges
        const normalizedEdges = GraphNodeProcessor.normalizeHandleIds(validEdges);
        const processedEdges = GraphNodeProcessor.prepareEdgesForLoading(normalizedEdges);
        
        console.log(`Processed edges count: ${processedEdges.length}`);
        if (processedEdges.length > 0) {
          console.log('First processed edge:', JSON.stringify(processedEdges[0]));
        }
        
        // Set nodes first, then edges after a delay to ensure nodes are rendered first
        setNodes(processedNodes);
        
        // Use a longer delay before setting edges to ensure nodes are fully rendered
        setTimeout(() => {
          console.log(`Setting ${processedEdges.length} edges`);
          setEdges(processedEdges);
          
          // Dispatch events
          setTimeout(() => {
            console.log('Dispatching graph-loaded event');
            window.dispatchEvent(new CustomEvent('graph-loaded'));
            
            // Force edge redraw after loading
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('force-edge-redraw'));
            }, 300);
          }, 300);
        }, 500); // Increased delay to ensure nodes are fully rendered
        
        // Show success toast
        toast.success(`Graph loaded successfully with ${processedNodes.length} nodes and ${processedEdges.length} edges`);
        
        return true;
      } catch (error) {
        console.error('Error loading graph:', error);
        toast.error('Failed to load graph');
        return false;
      }
    },
    [setNodes, setEdges, reactFlowInstance]
  );

  return { loadGraph };
};
