import React, { useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { resetCounters, updateDnnCounter } from '@/utils/flowData/idCounters';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';
import { GraphLoadingService } from '@/services/loading/GraphLoadingService';
import { GraphNodeProcessor } from '@/services/processing/GraphNodeProcessor';
import { arrangeNodes } from '@/utils/flowData/layoutAlgorithms';

export function useGraphLoadHandler(
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) {
  // Track if we're currently loading a graph to prevent duplicate events
  const isLoadingRef = useRef(false);

  // Add an effect to reset loading state on unmount
  useEffect(() => {
    return () => {
      console.log('GraphLoadHandler unmounting, resetting loading state');
      isLoadingRef.current = false;
    };
  }, []);

  // Add an effect to listen for loading-reset events
  useEffect(() => {
    const handleLoadingReset = () => {
      console.log('GraphLoadHandler: Loading reset event received, resetting loading state');
      isLoadingRef.current = false;
    };
    
    // Add event listeners for all loading state events
    window.addEventListener('loading-reset', handleLoadingReset);
    window.addEventListener('loading-completed', handleLoadingReset);
    window.addEventListener('loading-timeout', handleLoadingReset);
    
    return () => {
      window.removeEventListener('loading-reset', handleLoadingReset);
      window.removeEventListener('loading-completed', handleLoadingReset);
      window.removeEventListener('loading-timeout', handleLoadingReset);
    };
  }, []);
  
  const handleLoadGraphFromStorage = useCallback((name: string | GraphData): boolean => {
    // Type guard to check if name is a string or GraphData
    const isGraphData = (value: string | GraphData): value is GraphData => {
      return typeof value !== 'string' && value !== null && typeof value === 'object';
    };
    
    // If already loading, prevent duplicate actions
    if (isLoadingRef.current) {
      console.log('Already loading a graph, ignoring duplicate request');
      toast.info('Already loading a graph, please wait');
      return false;
    }
    
    // Set loading flag
    isLoadingRef.current = true;
    
    try {
      // Handle different input types
      let graphData: GraphData | null = null;
      
      if (isGraphData(name)) {
        // We received a GraphData object directly
        graphData = name;
        console.log(`Loading graph from GraphData object with ${graphData.nodes.length} nodes`);
      } else {
        // Otherwise, name is a string, so load from storage
        console.log(`Loading graph by name: "${name}"`);
        
        // Import storage service on-demand
        const { GraphStorageService } = require('@/services/storage/GraphStorageService');
        graphData = GraphStorageService.loadGraph(name);
        
        if (!graphData) {
          console.error(`Failed to load graph "${name}" from storage`);
          toast.error(`Failed to load graph "${name}"`);
          isLoadingRef.current = false;
          return false;
        }
      }
      
      if (!graphData || !graphData.nodes || !Array.isArray(graphData.nodes)) {
        console.error('Invalid graph data structure');
        toast.error('Invalid graph structure');
        isLoadingRef.current = false;
        return false;
      }
      
      console.log(`Successfully loaded graph with ${graphData.nodes.length} nodes and ${graphData.edges?.length || 0} edges`);
      
      // Reset counters to avoid ID conflicts
      resetCounters();
      
      // Update counters based on the loaded nodes
      if (graphData.nodes && graphData.nodes.length > 0) {
        updateDnnCounter(graphData.nodes);
      }
      
      // 1. Clear existing nodes/edges first to ensure a clean slate
      setNodes([]);
      setEdges([]);
      
      // 2. Process graph data
      console.log("Processing graph data for loading");
      
      // Create deep copies to prevent mutation issues
      const nodesCopy = JSON.parse(JSON.stringify(graphData.nodes || []));
      const edgesCopy = JSON.parse(JSON.stringify(graphData.edges || []));
      
      // Process nodes and edges
      const processedNodes = GraphNodeProcessor.prepareNodesForLoading(nodesCopy);
      const normalizedEdges = GraphNodeProcessor.normalizeHandleIds(edgesCopy);
      const processedEdges = GraphNodeProcessor.prepareEdgesForLoading(normalizedEdges);
      
      console.log(`Processed ${processedNodes.length} nodes and ${processedEdges.length} edges for loading`);
      
      // Apply balanced tree layout for proper RRP-member positioning
      const arrangedNodes = arrangeNodes(
        processedNodes,
        processedEdges,
        {
          type: 'balanced-tree',
          horizontalSpacing: 800,
          verticalSpacing: 150,
          nodeWidth: 180,
          nodeHeight: 120,
          marginX: 100,
          marginY: 100,
          preventOverlap: true,
          edgeShortenFactor: 0.95
        }
      );
      
      // Set nodes and edges with significant delay between them
      // This sequence is crucial for proper rendering
      console.log("Setting nodes to React Flow");
      setNodes(arrangedNodes); // Using arranged nodes instead of processed nodes
      
      // Wait a bit longer before setting edges to ensure nodes are rendered
      setTimeout(() => {
        console.log(`Setting ${processedEdges.length} edges to React Flow`);
        
        // Store edges in debug variable for debugging
        try {
          // @ts-ignore - This is for debugging only
          window.__DEBUG_NODE_EDITOR_EDGES = [...processedEdges];
          console.log(`Stored ${processedEdges.length} edges in debug variable`);
        } catch (e) {
          console.error('Error setting debug edges:', e);
        }
        
        // Now set edges, which should connect to the already-rendered nodes
        setEdges(processedEdges);
        
        // After setting edges, trigger layout events and reset loading state
        setTimeout(() => {
          console.log('Dispatching graph-loaded event from GraphLoadHandler');
          window.dispatchEvent(new CustomEvent('graph-loaded'));
          
          // Reset loading flag
          isLoadingRef.current = false;
          
          // Show success toast
          const graphName = isGraphData(name) ? (name.name || 'Graph') : name;
          toast.success(`Graph "${graphName}" loaded with ${arrangedNodes.length} nodes and ${processedEdges.length} edges`);
          
          // After another delay, force an edge redraw and notify loading completed
          setTimeout(() => {
            console.log('Dispatching force-edge-redraw event');
            window.dispatchEvent(new CustomEvent('force-edge-redraw'));
            window.dispatchEvent(new CustomEvent('loading-completed'));
          }, 300);
        }, 300);
      }, 500); // Increased delay between setting nodes and edges
      
      return true;
    } catch (error) {
      console.error("Error in handleLoadGraphFromStorage:", error);
      toast.error("Failed to load graph");
      isLoadingRef.current = false;
      
      // Explicitly dispatch loading-completed event on error
      window.dispatchEvent(new CustomEvent('loading-completed'));
      
      return false;
    }
  }, [setNodes, setEdges]);

  return {
    handleLoadGraphFromStorage, 
    isLoadingRef
  };
}
