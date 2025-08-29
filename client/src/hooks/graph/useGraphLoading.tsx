
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { useLocalGraphPersistence } from './useLocalGraphPersistence';
import { useCloudGraphPersistence } from './useCloudGraphPersistence';
import { useGraphLoadingState } from './useGraphLoadingState';
import { useGraphLoader } from './useGraphLoader';
import { GraphLoadingService } from '@/services/loading/GraphLoadingService';
import { arrangeNodes } from '@/utils/flowData/layoutAlgorithms';

export const useGraphLoading = (
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // Use the smaller hooks for specific operations
  const { loadGraph: loadFromLocal, getSavedGraphs, deleteGraph } = useLocalGraphPersistence();
  const { loadFromCloud, getCloudGraphs } = useCloudGraphPersistence();
  const { isLoadingRef, setLoading, isLoading, resetLoadingState } = useGraphLoadingState();
  const { handleGraphLoading } = useGraphLoader(setNodes, setEdges);
  
  // Load graph from local storage
  const loadGraph = useCallback((name: string): boolean => {
    console.log(`useGraphLoading.loadGraph: Attempting to load graph with name: ${name}`);
    
    if (!setNodes || !setEdges) {
      console.error('Cannot load graph: setNodes or setEdges not provided');
      toast.error('Failed to load graph: Internal state error');
      return false;
    }
    
    // FIXED: Force reset the loading state first to clear any stuck state
    resetLoadingState();
    
    // Then check if we're already loading after the reset
    if (isLoadingRef.current) {
      console.log('Already loading a graph, ignoring request');
      toast.info('Already loading a graph, please wait');
      return false; 
    }
    
    // Check if the graph exists before trying to load it
    const availableGraphs = getSavedGraphs();
    const graphExists = availableGraphs.some(graph => graph.name === name);
    
    if (!graphExists) {
      console.error(`Graph "${name}" not found. Available graphs: ${availableGraphs.map(g => g.name).join(', ')}`);
      toast.error(`Graph "${name}" not found`, {
        description: availableGraphs.length > 0 
          ? `Available graphs: ${availableGraphs.map(g => g.name).join(', ')}` 
          : 'No saved graphs found. Save a graph first.'
      });
      return false;
    }
    
    // Now set loading to true
    setLoading(true);
    
    try {
      // Show an initial loading toast
      toast.info(`Loading graph "${name}"...`, { duration: 4000 });
      
      const graphData = loadFromLocal(name);
      if (!graphData) {
        console.error(`Failed to load graph "${name}": No data returned`);
        toast.error(`Failed to load graph "${name}": No data found`);
        setLoading(false);
        return false;
      }
      
      console.log(`useGraphLoading.loadGraph: Successfully loaded graph "${name}"`);
      console.log(`  - Loaded ${graphData.nodes?.length || 0} nodes`);
      console.log(`  - Loaded ${graphData.edges?.length || 0} edges`);
      
      // Validate edges array
      if (!graphData.edges || !Array.isArray(graphData.edges)) {
        console.warn('Graph has no valid edges array');
        graphData.edges = []; // Initialize with empty array
      } else if (graphData.edges.length > 0) {
        console.log('First edge from storage:', JSON.stringify(graphData.edges[0]));
      }
      
      // First clear the canvas
      setNodes([]);
      setEdges([]);
      
      // Process the graph data with our GraphLoadingService
      const processedGraph = GraphLoadingService.processGraphForLoading(
        graphData.nodes || [], 
        graphData.edges || []
      );
      
      console.log(`Processed graph for loading:`);
      console.log(`  - Processed nodes: ${processedGraph.nodes.length}`);
      console.log(`  - Processed edges: ${processedGraph.edges.length}`);
      
      // Auto-arrange the nodes with improved balanced hierarchical tree layout before loading them
      const arrangedNodes = arrangeNodes(
        processedGraph.nodes,
        processedGraph.edges,
        {
          type: 'balanced-tree', // Use improved balanced tree layout for hierarchical arrangement
          spacing: 800,          // Increased spacing for clearer visualization
          horizontalSpacing: 800,
          verticalSpacing: 650,
          nodeWidth: 180,
          nodeHeight: 120,
          marginX: 400,          // Wider margins for better centering
          marginY: 100,          // Top margin for hierarchy
          preventOverlap: true,
          edgeShortenFactor: 0.95
        }
      );
      
      // FIXED: Use a shorter delay before loading to improve responsiveness
      setTimeout(() => {
        // Replace original data with processed and arranged data
        const enhancedGraphData = {
          ...graphData,
          nodes: arrangedNodes, // Use arranged nodes instead of processed nodes
          edges: processedGraph.edges
        };
        
        const result = handleGraphLoading(enhancedGraphData);
        
        // If loading fails, make sure to reset loading state
        if (!result) {
          console.error('Graph loading failed in handleGraphLoading');
          toast.error('Failed to load graph: Error processing graph data');
          setLoading(false);
        } else {
          // FIXED: Notify when graph is loaded after a short delay
          setTimeout(() => {
            GraphLoadingService.notifyGraphLoaded();
            // Explicitly reset loading state
            setLoading(false);
            // Dispatch nodes-arranged event for further processing
            window.dispatchEvent(new CustomEvent('nodes-arranged'));
          }, 200);
        }
      }, 200); // Reduced delay for better responsiveness
      
      return true;
    } catch (error) {
      console.error('Error in loadGraph:', error);
      toast.error('Failed to load graph: Unexpected error occurred');
      setLoading(false);
      return false;
    }
  }, [loadFromLocal, setNodes, setEdges, isLoadingRef, setLoading, resetLoadingState, handleGraphLoading, getSavedGraphs]);
  
  // Load graph from cloud storage
  const loadGraphFromCloud = useCallback(async (fileUrl: string): Promise<boolean> => {
    if (!setNodes || !setEdges) {
      console.error('Cannot load graph: setNodes or setEdges not provided');
      toast.error('Failed to load graph from cloud: Internal state error');
      return false;
    }
    
    if (isLoadingRef.current) {
      toast.info('Already loading a graph, please wait');
      return false; // Prevent multiple concurrent loads
    }
    
    // FIXED: Reset loading state first to ensure we're in a clean state
    resetLoadingState();
    // Now set loading to true
    setLoading(true);
    
    try {
      // Show an initial toast with longer duration
      toast.info(`Loading graph from cloud...`, { duration: 4000 });
      
      const graphData = await loadFromCloud(fileUrl);
      if (!graphData) {
        toast.error('Failed to load graph from cloud: No data found');
        setLoading(false);
        return false;
      }
      
      console.log('Loaded graph from cloud with nodes:', graphData.nodes?.length || 0);
      console.log('Loaded graph from cloud with edges:', graphData.edges?.length || 0);
      
      // Validate edges array
      if (!graphData.edges || !Array.isArray(graphData.edges)) {
        console.warn('Graph has no valid edges array');
        graphData.edges = []; // Initialize with empty array
      }
      
      // First clear the canvas
      setNodes([]);
      setEdges([]);
      
      // IMPROVED: Process the graph data with our GraphLoadingService
      const processedGraph = GraphLoadingService.processGraphForLoading(
        graphData.nodes || [], 
        graphData.edges || []
      );
      
      console.log(`Processed graph for loading:`);
      console.log(`  - Processed nodes: ${processedGraph.nodes.length}`);
      console.log(`  - Processed edges: ${processedGraph.edges.length}`);
      
      // Auto-arrange the nodes with improved balanced hierarchical tree layout before loading them
      const arrangedNodes = arrangeNodes(
        processedGraph.nodes,
        processedGraph.edges,
        {
          type: 'balanced-tree', // Use improved balanced tree layout for hierarchical arrangement
          spacing: 800,          // Increased spacing for clearer visualization
          horizontalSpacing: 800,
          verticalSpacing: 650,
          nodeWidth: 180,
          nodeHeight: 120,
          marginX: 400,          // Wider margins for better centering
          marginY: 100,          // Top margin for hierarchy
          preventOverlap: true,
          edgeShortenFactor: 0.95
        }
      );
      
      // FIXED: Increased delay before loading to ensure canvas is cleared
      setTimeout(() => {
        // Replace original data with processed and arranged data
        const enhancedGraphData = {
          ...graphData,
          nodes: arrangedNodes, // Use arranged nodes instead of processed nodes
          edges: processedGraph.edges
        };
        
        const result = handleGraphLoading(enhancedGraphData);
        
        if (!result) {
          toast.error('Failed to load graph from cloud: Error processing graph data');
          setLoading(false);
        } else {
          // Notify when graph is loaded
          GraphLoadingService.notifyGraphLoaded();
          // Dispatch nodes-arranged event for further processing
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('nodes-arranged'));
          }, 200);
        }
      }, 500); // Increased delay
      
      return true;
    } catch (error) {
      console.error('Error loading graph from cloud:', error);
      toast.error('Failed to load graph from cloud: Unexpected error occurred');
      setLoading(false);
      return false;
    }
  }, [loadFromCloud, setNodes, setEdges, isLoadingRef, setLoading, resetLoadingState, handleGraphLoading]);
  
  return {
    loadGraph,
    loadGraphFromCloud,
    getSavedGraphs,
    getCloudGraphs,
    deleteGraph,
    isLoadingGraph: isLoading,
    resetLoadingState
  };
};
