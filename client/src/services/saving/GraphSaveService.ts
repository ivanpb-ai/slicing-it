
import { Node, Edge } from '@xyflow/react';

type PreparedGraph = {
  success: boolean;
  message?: string;
  nodes?: Node[];
  edges?: Edge[];
};

export class GraphSaveService {
  // Helper method to deep clone data
  private static deepClone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }
  
  // Prepare graph data for saving
  static prepareGraphForSaving(name: string, nodes: Node[], edges: Edge[]): PreparedGraph | null {
    try {
      // Validate inputs
      if (!name) {
        return { success: false, message: 'Invalid graph name' };
      }
      
      if (!Array.isArray(nodes)) {
        return { success: false, message: 'Invalid nodes array' };
      }
      
      if (!Array.isArray(edges)) {
        return { success: false, message: 'Invalid edges array' };
      }
      
      if (nodes.length === 0) {
        return { success: false, message: 'No nodes to save' };
      }
      
      // Create deep clones to avoid reference issues
      const nodesClone = this.deepClone(nodes);
      const edgesClone = this.deepClone(edges);
      
      // Process nodes to ensure consistent format
      const processedNodes = nodesClone.map(node => ({
        ...node,
        type: 'customNode',
        position: {
          x: typeof node.position?.x === 'number' ? node.position.x : 0,
          y: typeof node.position?.y === 'number' ? node.position.y : 0
        },
        data: {
          ...(node.data || {}),
          type: node.data?.type || 'generic'
        }
      }));
      
      // Process edges to ensure consistent format
      const processedEdges = edgesClone.map(edge => ({
        ...edge,
        id: edge.id || `e-${edge.source}-${edge.target}-${Date.now()}`,
        source: String(edge.source),
        target: String(edge.target)
      }));
      
      return { 
        success: true, 
        nodes: processedNodes, 
        edges: processedEdges
      };
    } catch (error) {
      console.error('Error preparing graph for saving:', error);
      return { success: false, message: 'Error preparing graph for saving' };
    }
  }
}
