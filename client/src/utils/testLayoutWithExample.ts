import { Node, Edge } from '@xyflow/react';
import { EXAMPLE_GRAPH } from '@/data/exampleGraph';
import { arrangeNodes } from '@/utils/flowData/layoutAlgorithms';

/**
 * Test the balanced tree layout with the example graph
 * This function loads the example graph and applies the improved balanced tree layout
 */
export const testBalancedLayoutWithExample = (): { nodes: Node[]; edges: Edge[] } => {
  console.log('🌳 Testing balanced tree layout with example graph...');
  
  const { nodes: exampleNodes, edges: exampleEdges } = EXAMPLE_GRAPH;
  
  // Apply the improved balanced tree layout
  const arrangedNodes = arrangeNodes(exampleNodes as Node[], exampleEdges as Edge[], {
    type: 'balanced-tree',
    nodeWidth: 180,
    nodeHeight: 120,
    horizontalSpacing: 250,
    verticalSpacing: 180,
    marginX: 400,
    marginY: 100,
    preventOverlap: true,
    edgeShortenFactor: 0.95
  });
  
  console.log('✨ Balanced tree layout applied to example graph:', {
    originalNodes: exampleNodes.length,
    arrangedNodes: arrangedNodes.length,
    edges: exampleEdges.length
  });
  
  return {
    nodes: arrangedNodes,
    edges: exampleEdges as Edge[]
  };
};

/**
 * Helper to make the test function available globally for easy testing
 * You can call window.__testBalancedLayout() in the browser console
 */
if (typeof window !== 'undefined') {
  (window as any).__testBalancedLayout = testBalancedLayoutWithExample;
}