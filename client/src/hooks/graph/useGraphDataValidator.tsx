
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

export const useGraphDataValidator = () => {
  // Validate and normalize graph data
  const validateGraphData = (graphData: GraphData): GraphData => {
    if (!graphData) {
      return { nodes: [], edges: [], timestamp: Date.now() };
    }
    
    // Ensure nodes exist and are an array
    if (!graphData.nodes || !Array.isArray(graphData.nodes)) {
      console.error('Invalid graph data: nodes not found or not an array');
      graphData.nodes = [];
    }
    
    // Ensure edges exist and are an array
    if (!graphData.edges || !Array.isArray(graphData.edges)) {
      console.error('Invalid graph data: edges not found or not an array');
      graphData.edges = [];
    }
    
    // Ensure each node has the required properties
    const processedNodes = graphData.nodes.map(node => ({
      ...node,
      type: 'customNode', // Ensure consistent node type
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
    
    // Ensure each edge has the required properties
    const processedEdges = graphData.edges.map(edge => ({
      ...edge,
      id: edge.id || `e-${edge.source}-${edge.target}-${Date.now()}`,
      source: String(edge.source),
      target: String(edge.target),
      type: edge.type || 'smoothstep',
      style: edge.style || { stroke: '#94a3b8', strokeWidth: 2 }
    }));
    
    return {
      nodes: processedNodes,
      edges: processedEdges,
      timestamp: graphData.timestamp || Date.now()
    };
  };
  
  return { validateGraphData };
};
