
import React, { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useLocalGraphPersistence } from './useLocalGraphPersistence';
import { useCloudGraphPersistence } from './useCloudGraphPersistence';
import { useExportImportGraph } from './useExportImportGraph.ts';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

export const useGraphOperations = (
  nodes?: Node[],
  edges?: Edge[],
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // Use specialized hooks for different operations
  const { 
    saveGraph: saveToLocal, 
    loadGraph: loadFromLocal,
    getSavedGraphs,
    deleteGraph: deleteFromLocal
  } = useLocalGraphPersistence(nodes, edges);
  
  const {
    saveGraphToCloud,
    getCloudGraphs,
    loadFromCloud,
    deleteFromCloud
  } = useCloudGraphPersistence();
  
  const { 
    exportGraph, 
    importGraph 
  } = useExportImportGraph(nodes, edges, setNodes, setEdges);
  
  // State for loading status
  const [isLoading, setIsLoading] = useState(false);
  
  // Save graph method - unified for both local and cloud
  const saveGraph = (name: string, storageMethod: 'local' | 'cloud' = 'local'): boolean => {
    if (!nodes) {
      console.error('Cannot save graph: no nodes provided');
      return false;
    }
    
    if (storageMethod === 'local') {
      return saveToLocal(name);
    } else {
      // For cloud, we need to handle async differently
      saveGraphToCloud(name, nodes, edges || [])
        .then(result => {
          if (result) {
            return true;
          }
          return false;
        })
        .catch(() => false);
      
      // Return true for now since the actual result is handled async
      return true;
    }
  };
  
  // Load graph method - unified for both local and cloud
  const loadGraph = (name: string, storageMethod: 'local' | 'cloud' = 'local'): boolean => {
    setIsLoading(true);
    
    try {
      if (storageMethod === 'local') {
        const graphData = loadFromLocal(name);
        
        if (!graphData || !setNodes || !setEdges) {
          setIsLoading(false);
          return false;
        }
        
        // First clear existing state
        setNodes([]);
        setEdges([]);
        
        // Then set the new data with delay
        setTimeout(() => {
          console.log('🔍 useGraphOperations: Setting nodes to React state:', graphData.nodes?.length || 0);
          setNodes(graphData.nodes || []);
          
          // Set edges with delay to ensure nodes are rendered
          setTimeout(() => {
            console.log('🔍 useGraphOperations: Setting edges to React state:', graphData.edges?.length || 0);
            setEdges(graphData.edges || []);
            setIsLoading(false);
            console.log('🔍 useGraphOperations: Load complete - React state should now have', graphData.nodes?.length || 0, 'nodes and', graphData.edges?.length || 0, 'edges');
          }, 200);
        }, 100);
        
        return true;
      } else {
        // For cloud, we need to handle async differently
        loadFromCloud(name)
          .then(graphData => {
            if (!graphData || !setNodes || !setEdges) {
              setIsLoading(false);
              return false;
            }
            
            // First clear existing state
            setNodes([]);
            setEdges([]);
            
            // Then set the new data with delay
            setTimeout(() => {
              setNodes(graphData.nodes || []);
              
              // Set edges with delay to ensure nodes are rendered
              setTimeout(() => {
                setEdges(graphData.edges || []);
                setIsLoading(false);
              }, 200);
            }, 100);
            
            return true;
          })
          .catch(() => {
            setIsLoading(false);
            return false;
          });
        
        // Return true for now since the actual result is handled async
        return true;
      }
    } catch (error) {
      console.error('Error loading graph:', error);
      setIsLoading(false);
      return false;
    }
  };
  
  // Delete graph method - unified for both local and cloud
  const deleteGraph = (name: string, storageMethod: 'local' | 'cloud' = 'local'): boolean => {
    if (storageMethod === 'local') {
      return deleteFromLocal(name);
    } else {
      // For cloud, we need to handle async differently
      deleteFromCloud(name)
        .then(result => result)
        .catch(() => false);
      
      // Return true for now since the actual result is handled async
      return true;
    }
  };
  
  // Handle loading a graph from GraphData
  const handleLoadGraphFromData = (graphData: GraphData): boolean => {
    if (!setNodes || !setEdges) {
      return false;
    }
    
    setIsLoading(true);
    
    // First clear existing state
    setNodes([]);
    setEdges([]);
    
    // Then set the new data with delay
    setTimeout(() => {
      setNodes(graphData.nodes || []);
      
      // Set edges with delay to ensure nodes are rendered
      setTimeout(() => {
        setEdges(graphData.edges || []);
        setIsLoading(false);
      }, 200);
    }, 100);
    
    return true;
  };
  
  return {
    saveGraph,
    loadGraph,
    deleteGraph,
    getSavedGraphs,
    getCloudGraphs,
    exportGraph,
    importGraph,
    handleLoadGraphFromData,
    isLoading
  };
};
