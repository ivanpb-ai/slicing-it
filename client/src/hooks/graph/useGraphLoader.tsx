
import React, { useCallback } from 'react';
import { Node, Edge, useReactFlow, MarkerType } from '@xyflow/react';
import { toast } from 'sonner';
import { useGraphLoadingState } from './useGraphLoadingState';
import { resetCounters } from '@/utils/flowData/idCounters';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';
import { GraphNodeProcessor } from '@/services/processing/GraphNodeProcessor';
import { validateAllEdges } from '@/utils/edgeGuardrails';

export const useGraphLoader = (
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  const reactFlowInstance = useReactFlow();
  const { isLoadingRef, setLoading } = useGraphLoadingState();
  
  // Handle graph loading process with improved edge handling
  const handleGraphLoading = useCallback((graphData: GraphData): boolean => {
    if (!setNodes || !setEdges) {
      console.error('Cannot load graph: setNodes or setEdges not provided');
      toast.error('Failed to load graph');
      setLoading(false);
      return false;
    }
    
    console.log("Handling graph loading with nodes:", graphData.nodes?.length || 0, "and edges:", graphData.edges?.length || 0);
    
    // Validate edges and ensure we have a valid array
    if (!graphData.edges) {
      console.warn("No edges in the loaded graph data, creating empty array");
      graphData.edges = [];
    } else if (!Array.isArray(graphData.edges)) {
      console.error("Edges property is not an array:", graphData.edges);
      toast.error("Invalid graph structure: edges must be an array");
      graphData.edges = [];
    }
    
    // Detailed edge logging for debugging
    if (graphData.edges.length > 0) {
      console.log(`Graph has ${graphData.edges.length} edges to load`);
      console.log("First edge in loaded data:", JSON.stringify(graphData.edges[0]));
      console.log("Edge sources:", graphData.edges.map(e => e.source).join(', '));
      console.log("Edge targets:", graphData.edges.map(e => e.target).join(', '));
    } else {
      console.warn("Graph has no edges. This might be intentional or a data issue.");
    }
    
    // Reset counters before loading to avoid ID conflicts
    resetCounters();
    if (graphData.nodes && Array.isArray(graphData.nodes)) {
      updateDnnCounter(graphData.nodes);
    }
    
    try {
      // First completely reset the canvas state
      console.log("Resetting canvas state before loading new graph");
      setNodes([]);
      setEdges([]);
      
      // Reset viewport
      if (reactFlowInstance) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }
      
      // Ensure we have valid arrays
      const validNodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];
      const validEdges = Array.isArray(graphData.edges) ? graphData.edges : [];
      
      // Process nodes using our dedicated service and add visibility flags
      const processedNodes = GraphNodeProcessor.prepareNodesForLoading(validNodes).map(node => ({
        ...node,
        data: {
          ...node.data,
          ensureVisible: true,
          persistNode: true,
          preserveInLayout: true,
          visible: true,
          forceVisible: true
        },
        style: {
          ...node.style,
          // Fix: Use "visible" instead of 'visibility: "visible"'
          visibility: "visible" as const,
          display: "flex" as const,
          opacity: 1,
          zIndex: 1000
        },
        className: 'node-wrapper'
      }));
      
      // First normalize the handle IDs
      const normalizedEdges = GraphNodeProcessor.normalizeHandleIds(validEdges);
      console.log(`Normalized ${normalizedEdges.length} edges`);
      
      // Process edges and force straight hierarchical lines with fixed lengths
      const processedEdges = normalizedEdges.map(edge => ({
        ...edge,
        type: 'straight', // Force straight line type
        animated: false,
        style: { 
          stroke: '#94a3b8', 
          strokeWidth: 2
        },
        data: {
          curvature: 0,
          shortened: true,
          shortenFactor: 0.55, // Fixed edge length of approximately 100px (55% shortening)
          persistent: true,
          permanent: true,
          preserveEdge: true,
          optimized: true
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 8,
          height: 8,
          color: '#94a3b8',
        },
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target'
      }));
      
      console.log(`Processed ${processedEdges.length} edges for loading`);
      
      // IMPROVED: Set nodes first in a separate update 
      console.log('Setting nodes:', processedNodes.length);
      setNodes(processedNodes);
      
      // Then set edges in a separate update for better rendering reliability
      setTimeout(() => {
        console.log('Setting edges after nodes:', processedEdges.length);
        if (processedEdges.length > 0) {
          console.log('First edge being set:', JSON.stringify(processedEdges[0]));
        }
        
        // 🛡️ GUARDRAIL: Validate edges to prevent multiple S-NSSAI→DNN connections
        const validatedEdges = validateAllEdges(processedEdges, processedNodes);
        console.log(`🛡️ Import Guardrail: Processed ${processedEdges.length} → ${validatedEdges.length} edges`);
        
        setEdges(validatedEdges);
        
        // Store edges in global debug variable for debugging
        try {
          // @ts-ignore - This is for debugging only
          window.__DEBUG_NODE_EDITOR_EDGES = [...processedEdges];
          console.log("Stored edges in global debug variable:", processedEdges.length);
        } catch (e) {
          console.error("Error setting debug edges:", e);
        }
        
        // Dispatch visibility events
        window.dispatchEvent(new CustomEvent('ensure-nodes-visible'));
        window.dispatchEvent(new CustomEvent('force-edge-redraw'));
      }, 50);
      
      // Fit view after nodes and edges are set
      setTimeout(() => {
        if (reactFlowInstance && !window.sessionStorage.getItem('prevent-fitview')) {
          console.log('Fitting view after graph loading');
          reactFlowInstance.fitView({
            padding: 0.2,
            includeHiddenNodes: false,
            duration: 500
          });
          
          // Update the global debug variables for nodes and edges
          try {
            // @ts-ignore - This is for debugging only
            window.__DEBUG_NODE_EDITOR_NODES = [...processedNodes];
            // @ts-ignore - This is for debugging only
            window.__DEBUG_NODE_EDITOR_EDGES = [...processedEdges];
            console.log("Updated global debug variables with", processedNodes.length, "nodes and", processedEdges.length, "edges");
          } catch (e) {
            console.error("Error setting debug variables:", e);
          }
          
          setLoading(false);
          toast.success(`Graph loaded with ${processedNodes.length} nodes and ${processedEdges.length} edges`);
          
          // Dispatch event to notify that the graph is loaded
          window.dispatchEvent(new CustomEvent('graph-loaded'));
          
          // Add a special event for edge rendering and node visibility
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('force-edge-redraw'));
            window.dispatchEvent(new CustomEvent('ensure-nodes-visible'));
          }, 200);
        } else {
          setLoading(false);
          toast.error('Failed to fit view: ReactFlow instance not available');
        }
      }, 500);
      
      return true;
    } catch (error) {
      console.error("Error processing graph data:", error);
      toast.error("Failed to process graph data");
      setLoading(false);
      return false;
    }
  }, [reactFlowInstance, setNodes, setEdges, setLoading]);

  return {
    handleGraphLoading
  };
};
