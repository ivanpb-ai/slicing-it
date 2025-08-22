
import { Node, Edge, MarkerType } from '@xyflow/react';
import { GraphNodeProcessor } from '../processing/GraphNodeProcessor';
import { resetCounters, updateDnnCounter } from '@/utils/flowData/idCounters';
import { toast } from 'sonner';

type LoadGraphOptions = {
  applyViewportReset?: boolean;
  resetNodeCounters?: boolean;
};

export class GraphLoadingService {
  // Process graph data for loading
  static processGraphForLoading(nodes: Node[], edges: Edge[], options: LoadGraphOptions = {}) {
    try {
      // Reset counters if needed
      if (options.resetNodeCounters !== false) {
        resetCounters();
        if (nodes && nodes.length > 0) {
          updateDnnCounter(nodes);
        }
      }
      
      // Process nodes and edges
      const processedNodes = GraphNodeProcessor.prepareNodesForLoading(nodes);
      const normalizedEdges = GraphNodeProcessor.normalizeHandleIds(edges);
      const processedEdges = GraphNodeProcessor.prepareEdgesForLoading(normalizedEdges);
      
      return {
        success: true,
        nodes: processedNodes,
        edges: processedEdges
      };
    } catch (error) {
      console.error('Error processing graph for loading:', error);
      return {
        success: false,
        nodes: [],
        edges: []
      };
    }
  }
  
  // Method to notify when graph is loaded - this was missing
  static notifyGraphLoaded() {
    console.log('Graph loaded successfully');
    toast.success('Graph loaded successfully');
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('graph-loaded'));
    
    // Also dispatch loading completed event
    window.dispatchEvent(new CustomEvent('loading-completed'));
    
    return true;
  }
  
  // For backward compatibility - alias to processGraphForLoading
  static prepareGraphForLoading(nodes: Node[], edges: Edge[], options: LoadGraphOptions = {}) {
    return this.processGraphForLoading(nodes, edges, options);
  }
}
