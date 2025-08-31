
import { useCallback, useState } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { GraphStorageService, GraphData, SavedGraph } from '../services/storage/GraphStorageService';
import { resetCounters, updateDnnCounter } from '../utils/flowData/idCounters';

export const useGraphManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const reactFlowInstance = useReactFlow();
  
  // SAVE GRAPH
  const saveGraph = useCallback((name: string, nodes: Node[], edges: Edge[]): boolean => {
    try {
      console.log(`useGraphManager: Saving graph "${name}" with ${nodes.length} nodes and ${edges.length} edges`);
      return GraphStorageService.saveGraph(name, nodes, edges);
    } catch (error) {
      console.error('Error in saveGraph:', error);
      toast.error('Failed to save graph');
      return false;
    }
  }, []);
  
  // LOAD GRAPH
  const loadGraph = useCallback((name: string, setNodes: React.Dispatch<React.SetStateAction<Node[]>>, setEdges: React.Dispatch<React.SetStateAction<Edge[]>>): boolean => {
    try {
      console.log(`useGraphManager: Loading graph "${name}"`);
      setIsLoading(true);
      
      // Load graph data
      const graphData = GraphStorageService.loadGraph(name);
      
      if (!graphData) {
        setIsLoading(false);
        return false;
      }
      
      // Reset counters before loading
      resetCounters();
      updateDnnCounter(graphData.nodes);
      
      // Clear the canvas first
      setNodes([]);
      setEdges([]);
      
      // Reset viewport
      if (reactFlowInstance) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }
      
      // Filter duplicates before setting - this fixes React key warnings
      const uniqueNodes = graphData.nodes.filter((node, index, arr) => 
        arr.findIndex(n => n.id === node.id) === index
      );
      const uniqueEdges = graphData.edges.filter((edge, index, arr) => 
        arr.findIndex(e => e.id === edge.id) === index
      );
      
      console.log(`Setting ${uniqueNodes.length} unique nodes and ${uniqueEdges.length} unique edges`);
      
      // CRITICAL FIX: Use ReactFlow instance to maintain interactivity after load
      if (reactFlowInstance) {
        reactFlowInstance.setNodes(uniqueNodes);
        reactFlowInstance.setEdges(uniqueEdges);
      } else {
        setNodes(uniqueNodes);
        setEdges(uniqueEdges);
      }
      
      // Trigger events and finish
      window.dispatchEvent(new CustomEvent('graph-loaded'));
      setIsLoading(false);
      toast.success(`Graph "${name}" loaded with ${uniqueNodes.length} nodes and ${uniqueEdges.length} edges`);
      
      return true;
    } catch (error) {
      console.error('Error in loadGraph:', error);
      toast.error('Failed to load graph');
      setIsLoading(false);
      return false;
    }
  }, [reactFlowInstance]);
  
  // GET SAVED GRAPHS
  const getSavedGraphs = useCallback((): SavedGraph[] => {
    return GraphStorageService.getSavedGraphs();
  }, []);
  
  // DELETE GRAPH
  const deleteGraph = useCallback((name: string): boolean => {
    return GraphStorageService.deleteGraph(name);
  }, []);
  
  // EXPORT GRAPH
  const exportGraph = useCallback((name: string | undefined, nodes: Node[], edges: Edge[]): string | null => {
    return GraphStorageService.exportGraph(name, nodes, edges);
  }, []);
  
  // IMPORT GRAPH
  const importGraph = useCallback(async (file: File, setNodes: React.Dispatch<React.SetStateAction<Node[]>>, setEdges: React.Dispatch<React.SetStateAction<Edge[]>>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const graphData = await GraphStorageService.importGraph(file);
      
      if (!graphData) {
        setIsLoading(false);
        return false;
      }
      
      // Reset counters
      resetCounters();
      updateDnnCounter(graphData.nodes);
      
      // Clear the canvas
      setNodes([]);
      setEdges([]);
      
      // Reset viewport
      if (reactFlowInstance) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }
      
      // Set nodes first
      setTimeout(() => {
        console.log(`Setting ${graphData.nodes.length} imported nodes`);
        // CRITICAL FIX: Use ReactFlow instance for import
        if (reactFlowInstance) {
          reactFlowInstance.setNodes(graphData.nodes);
        } else {
          setNodes(graphData.nodes);
        }
        
        // Then set edges
        setTimeout(() => {
          console.log(`Setting ${graphData.edges.length} imported edges`);
          if (reactFlowInstance) {
            reactFlowInstance.setEdges(graphData.edges);
          } else {
            setEdges(graphData.edges);
          }
          
          // Notify and reset loading
          window.dispatchEvent(new CustomEvent('graph-loaded'));
          
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('force-edge-redraw'));
            setIsLoading(false);
            toast.success(`Graph imported with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);
          }, 200);
        }, 200);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error importing graph:', error);
      toast.error('Failed to import graph');
      setIsLoading(false);
      return false;
    }
  }, [reactFlowInstance]);
  
  return {
    saveGraph,
    loadGraph,
    getSavedGraphs,
    deleteGraph,
    exportGraph,
    importGraph,
    isLoading
  };
};
