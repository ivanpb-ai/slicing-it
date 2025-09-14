
import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { resetCounters, updateDnnCounter } from '@/utils/flowData/idCounters';
import type { GraphData } from '@/services/storage/GraphLocalStorageService';

// Export the hook with the name that's imported in useGraphOperations.tsx
export const useExportImportGraph = (
  nodes?: Node[],
  edges?: Edge[],
  setNodes?: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges?: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // Get the react flow instance
  const reactFlowInstance = useReactFlow();

  // Export the current graph as JSON
  const exportGraph = useCallback((graphName?: string): string | null => {
    console.log('🔍 useExportImportGraph.ts: Export function called with graphName:', graphName);
    console.log('🔍 useExportImportGraph.ts: ReactFlow instance available:', !!reactFlowInstance);
    try {
      // ALWAYS export the current graph, use graphName as the filename
      const fileName = graphName 
        ? `${graphName.replace(/\s+/g, '_')}_${Date.now()}.json`
        : `graph_export_${Date.now()}.json`;
        
      console.log('🔍 useExportImportGraph.ts: Exporting current graph with', nodes?.length || 0, 'nodes and', edges?.length || 0, 'edges');
      
      // SIMPLIFIED: Always use ReactFlow instance as source of truth since that's what user sees
      console.log('🔍 useExportImportGraph.ts: Using ReactFlow instance as primary source (what user actually sees)');
      
      if (reactFlowInstance) {
        const flowNodes = reactFlowInstance.getNodes();
        const flowEdges = reactFlowInstance.getEdges();
        console.log('🔍 useExportImportGraph.ts: ReactFlow instance has', flowNodes.length, 'nodes and', flowEdges.length, 'edges');
        
        if (flowNodes.length > 0) {
          // Export from ReactFlow instance - this includes ALL nodes regardless of type
          const reactFlowTypeCounts = flowNodes.reduce((acc, node) => {
            const type = node.data?.type;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});
          console.log('🔍 useExportImportGraph.ts: All node types in ReactFlow:', reactFlowTypeCounts);
          
          const dataStr = JSON.stringify({ 
            nodes: flowNodes, 
            edges: flowEdges, 
            exportTime: Date.now(),
            exportMethod: 'REACTFLOW_INSTANCE',
            totalNodes: flowNodes.length,
            totalEdges: flowEdges.length 
          }, null, 2);
          
          const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
          
          const downloadLink = document.createElement('a');
          downloadLink.setAttribute('href', dataUri);
          downloadLink.setAttribute('download', fileName);
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          toast.success(`Graph exported as ${fileName} with ${flowNodes.length} nodes from ReactFlow instance!`);
          return dataStr;
        }
      }
      
      // Fallback to props state only if ReactFlow instance is empty
      console.log('🔍 useExportImportGraph.ts: ReactFlow instance empty, checking props state - nodes:', nodes?.length || 0, 'edges:', edges?.length || 0);
      if (nodes && nodes.length > 0) {
        console.log('🔍 useExportImportGraph.ts: Using props state as fallback');
        
        // DEBUG: Check what node types we're exporting from props state
        const nodeTypes = nodes.map(node => ({ id: node.id, type: node.data?.type }));
        console.log('🔍 useExportImportGraph.ts: Props state node types EXPANDED:', nodeTypes);
        
        // Count each node type in props state
        const typeCounts = nodeTypes.reduce((acc, { type }) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        console.log('🔍 useExportImportGraph.ts: Props state type counts:', typeCounts);
        
        const dnnNodes = nodes.filter(node => node.data?.type === 'dnn');
        const fiveQiNodes = nodes.filter(node => node.data?.type === 'fiveqi');
        console.log('🔍 useExportImportGraph.ts: Props DNN nodes:', dnnNodes.length, dnnNodes.map(n => ({ id: n.id, data: n.data })));
        console.log('🔍 useExportImportGraph.ts: Props 5QI nodes:', fiveQiNodes.length, fiveQiNodes.map(n => ({ id: n.id, data: n.data })));
        
        // CRITICAL: Also check ReactFlow instance even when props state exists
        if (reactFlowInstance) {
          const flowNodes = reactFlowInstance.getNodes();
          const flowNodeTypes = flowNodes.map(node => ({ id: node.id, type: node.data?.type }));
          const flowTypeCounts = flowNodeTypes.reduce((acc, { type }) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});
          console.log('🔍 useExportImportGraph.ts: ReactFlow instance type counts:', flowTypeCounts);
          
          const flowDnnNodes = flowNodes.filter(node => node.data?.type === 'dnn');
          const flowFiveQiNodes = flowNodes.filter(node => node.data?.type === 'fiveqi');
          console.log('🔍 useExportImportGraph.ts: ReactFlow DNN nodes:', flowDnnNodes.length, flowDnnNodes.map(n => ({ id: n.id, data: n.data })));
          console.log('🔍 useExportImportGraph.ts: ReactFlow 5QI nodes:', flowFiveQiNodes.length, flowFiveQiNodes.map(n => ({ id: n.id, data: n.data })));
        }
        
        const dataStr = JSON.stringify({ 
          nodes: nodes || [], 
          edges: edges || [], 
          exportTime: Date.now(),
          exportMethod: 'PROPS_STATE'
        }, null, 2);
        
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', dataUri);
        downloadLink.setAttribute('download', fileName);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        toast.success(`Graph exported as ${fileName} with ${nodes.length} nodes and ${edges?.length || 0} edges from props state`);
        return dataStr;
      } else {
        console.warn('🔍 useExportImportGraph.ts: No props state available, nodes:', nodes?.length || 0);
      }
      
      // PRIORITY 2: Try ReactFlow instance as fallback (for timing issues)
      console.log('🔍 useExportImportGraph.ts: Checking ReactFlow instance...', !!reactFlowInstance);
      if (reactFlowInstance) {
        try {
          const flowNodes = reactFlowInstance.getNodes();
          const flowEdges = reactFlowInstance.getEdges();
          console.log('🔍 useExportImportGraph.ts: ReactFlow instance has', flowNodes.length, 'nodes and', flowEdges.length, 'edges');
          
          // DEBUG: Check what node types are in ReactFlow instance (vs component state)
          const flowNodeTypes = flowNodes.map(node => ({ id: node.id, type: node.data?.type }));
          console.log('🔍 useExportImportGraph.ts: ReactFlow instance node types:', flowNodeTypes);
          
          const flowDnnNodes = flowNodes.filter(node => node.data?.type === 'dnn');
          const flowFiveQiNodes = flowNodes.filter(node => node.data?.type === 'fiveqi');
          console.log('🔍 useExportImportGraph.ts: ReactFlow DNN nodes:', flowDnnNodes.length, flowDnnNodes.map(n => ({ id: n.id, data: n.data })));
          console.log('🔍 useExportImportGraph.ts: ReactFlow 5QI nodes:', flowFiveQiNodes.length, flowFiveQiNodes.map(n => ({ id: n.id, data: n.data })));
          
          if (flowNodes.length > 0) {
            console.log('🔍 useExportImportGraph.ts: Using ReactFlow instance data for export (PRIORITY 2)');
            const dataStr = JSON.stringify({ 
              nodes: flowNodes || [], 
              edges: flowEdges || [], 
              exportTime: Date.now(),
              exportMethod: 'REACTFLOW_INSTANCE'
            }, null, 2);
            
            const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
            
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', dataUri);
            downloadLink.setAttribute('download', fileName);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            toast.success(`Graph exported as ${fileName} with ${flowNodes.length} nodes and ${flowEdges.length} edges from ReactFlow instance`);
            return dataStr;
          } else {
            console.warn('🔍 useExportImportGraph.ts: ReactFlow instance has no nodes, falling to next priority');
          }
        } catch (e) {
          console.error('🔍 useExportImportGraph.ts: Error accessing ReactFlow instance:', e);
        }
      } else {
        console.warn('🔍 useExportImportGraph.ts: No ReactFlow instance available');
      }
      
      // PRIORITY 3: Try debug state as fallback
      if ((!nodes || nodes.length === 0)) {
        console.log('🔍 useExportImportGraph.ts: Trying to get nodes from global debug state...');
        try {
          // @ts-ignore - This is for debugging only
          const debugNodes = window.__DEBUG_NODE_EDITOR_NODES;
          // @ts-ignore - This is for debugging only  
          const debugEdges = window.__DEBUG_LAST_EDGES;
          console.log('🔍 useExportImportGraph.ts: Debug nodes found:', debugNodes?.length || 0);
          console.log('🔍 useExportImportGraph.ts: Debug edges found:', debugEdges?.length || 0);
          
          if (debugNodes && debugNodes.length > 0) {
            console.log('🔍 useExportImportGraph.ts: Using debug nodes for export');
            const dataStr = JSON.stringify({ 
              nodes: debugNodes || [], 
              edges: debugEdges || [], 
              exportTime: Date.now() 
            }, null, 2);
            
            const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
            
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', dataUri);
            downloadLink.setAttribute('download', fileName);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            toast.success(`Graph exported as ${fileName} with ${debugNodes.length} nodes from debug state`);
            return dataStr;
          }
        } catch (e) {
          console.error('🔍 useExportImportGraph.ts: Error accessing debug state:', e);
        }
        
        // NOTE: ReactFlow instance already tried as PRIORITY 1 above
        
        // Ultimate fallback: Extract graph data directly from DOM elements
        console.log('🔍 useExportImportGraph.ts: Attempting DOM extraction...');
        try {
          const nodeElements = document.querySelectorAll('[data-id]');
          console.log('🔍 useExportImportGraph.ts: Found', nodeElements.length, 'DOM elements with data-id');
          
          if (nodeElements.length > 0) {
            console.log('🔍 useExportImportGraph.ts: Extracting graph data from DOM...');
            
            const extractedNodes: any[] = [];
            const extractedEdges: any[] = [];
            
            // First pass: extract all nodes
            nodeElements.forEach((element: Element) => {
              const dataId = element.getAttribute('data-id');
              if (!dataId) return;
              
              // Check if this is a node (has position transform)
              const transform = (element as HTMLElement).style.transform;
              const isNode = transform && transform.includes('translate');
              
              if (isNode) {
                // Extract position from transform
                const translateMatch = transform.match(/translate\(([^,]+),([^\)]+)\)/);
                const x = translateMatch ? parseFloat(translateMatch[1]) : 0;
                const y = translateMatch ? parseFloat(translateMatch[2]) : 0;
                
                // Extract node data from DOM attributes and content
                const classList = Array.from(element.classList);
                const textContent = element.textContent || '';
                
                // Try to determine the actual node type from DOM structure
                let nodeType = 'customNode'; // Default to the application's custom node type
                let nodeDataType = 'generic';
                
                // Look for data-node-type attribute first (most reliable)
                const nodeTypeAttr = element.getAttribute('data-node-type');
                if (nodeTypeAttr) {
                  nodeDataType = nodeTypeAttr;
                } else {
                  // Fallback: analyze ID patterns first (most reliable)
                  if (dataId.startsWith('network')) {
                    nodeDataType = 'network';
                  } else if (dataId.startsWith('cell-area')) {
                    nodeDataType = 'cell-area';
                  } else if (dataId.startsWith('dnn-')) {
                    nodeDataType = 'dnn'; // DNN nodes specifically
                  } else if (dataId.startsWith('fiveqi-') || textContent.includes('5QI')) {
                    nodeDataType = 'fiveqi';
                  } else if (dataId.startsWith('s-nssai') || textContent.includes('S-NSSAI')) {
                    nodeDataType = 's-nssai';
                  } else if (dataId.startsWith('rrp-') && !dataId.startsWith('rrpmember')) {
                    nodeDataType = 'rrp';
                  } else if (dataId.startsWith('rrpmember') || textContent.includes('RRP Member')) {
                    nodeDataType = 'rrpmember';
                  }
                }
                
                // Extract additional data from the DOM
                const nodeData: any = {
                  label: textContent.trim() || dataId,
                  type: nodeDataType,
                  extractedFromDOM: true
                };
                
                // For specific node types, try to extract additional relevant data
                if (nodeDataType === 'network') {
                  // Look for network-specific data
                  const networkMatch = dataId.match(/network-(.+)/);
                  if (networkMatch) {
                    const networkValue = isNaN(parseInt(networkMatch[1])) ? networkMatch[1] : parseInt(networkMatch[1]);
                    nodeData.network = networkValue;
                  }
                } else if (nodeDataType === 'cell-area') {
                  // Look for cell area number
                  const cellMatch = dataId.match(/cell-area-(\d+)/);
                  if (cellMatch) {
                    nodeData['cell-area'] = parseInt(cellMatch[1]);
                  }
                } else if (nodeDataType === 'dnn') {
                  // Look for DNN number
                  const dnnMatch = dataId.match(/dnn-(\d+)/);
                  if (dnnMatch) {
                    nodeData.dnn = parseInt(dnnMatch[1]);
                  }
                } else if (nodeDataType === 'fiveqi') {
                  // Look for 5QI number and set up fiveQIId for FiveQiNode compatibility
                  const fiveqiMatch = dataId.match(/fiveqi-(\d+)/);
                  if (fiveqiMatch) {
                    const fiveqiValue = parseInt(fiveqiMatch[1]);
                    nodeData.fiveqi = fiveqiValue;
                    nodeData.fiveQIId = fiveqiValue; // Required by FiveQiNode component
                  }
                } else if (nodeDataType === 's-nssai') {
                  // Look for S-NSSAI number
                  const snssaiMatch = dataId.match(/s-nssai-(\d+)/);
                  if (snssaiMatch) {
                    nodeData['s-nssai'] = parseInt(snssaiMatch[1]);
                  }
                } else if (nodeDataType === 'rrp') {
                  // Look for RRP number
                  const rrpMatch = dataId.match(/rrp-(\d+)/);
                  if (rrpMatch) {
                    nodeData.rrp = parseInt(rrpMatch[1]);
                  }
                } else if (nodeDataType === 'rrpmember') {
                  // Look for RRP member number
                  const rrpmemberMatch = dataId.match(/rrpmember-(.+)-(\d+)/);
                  if (rrpmemberMatch) {
                    nodeData.rrpmember = parseInt(rrpmemberMatch[2]);
                  }
                }
                
                extractedNodes.push({
                  id: dataId,
                  type: nodeType, // Always use customNode
                  position: { x, y },
                  data: nodeData
                });
              // Skip non-node elements
              }
            });
            
            // Second pass: extract edges from ReactFlow edge elements
            const edgeElements = document.querySelectorAll('.react-flow__edge');
            console.log('🔍 useExportImportGraph.ts: Found', edgeElements.length, 'edge elements');
            
            const edgeIdSet = new Set(); // Track unique edge IDs to prevent duplicates
            
            edgeElements.forEach((edgeElement: Element) => {
              const edgeId = edgeElement.getAttribute('data-id');
              if (!edgeId || edgeId.includes('xy-edge__') || edgeIdSet.has(edgeId)) return; // Skip internal ReactFlow edges and duplicates
              
              edgeIdSet.add(edgeId);
              
              // Try to parse the edge ID to get source and target
              // Edge IDs typically follow pattern: sourceId-targetId
              const nodeIds = extractedNodes.map(n => n.id);
              let sourceId = '';
              let targetId = '';
              
              // Sort node IDs by length (longest first) to handle complex IDs correctly
              const sortedNodeIds = [...nodeIds].sort((a, b) => b.length - a.length);
              
              // Try different parsing strategies - use longest matching node IDs first
              for (const nodeId of sortedNodeIds) {
                if (edgeId.startsWith(nodeId + '-')) {
                  sourceId = nodeId;
                  const remainder = edgeId.substring(nodeId.length + 1);
                  
                  // Check if remainder matches another node ID (also prioritize longer matches)
                  for (const targetNodeId of sortedNodeIds) {
                    if (remainder === targetNodeId) {
                      targetId = targetNodeId;
                      break;
                    }
                  }
                  
                  // If exact match failed, try partial matches but be more careful
                  if (!targetId) {
                    for (const targetNodeId of sortedNodeIds) {
                      if (remainder.startsWith(targetNodeId) && 
                          (remainder === targetNodeId || remainder[targetNodeId.length] === '-')) {
                        targetId = targetNodeId;
                        break;
                      }
                    }
                  }
                  
                  if (targetId) break;
                }
              }
              
              // Alternative parsing: try to find the best match by testing all combinations
              if (!sourceId || !targetId) {
                let bestMatch = { source: '', target: '', score: 0 };
                
                for (const potentialSource of sortedNodeIds) {
                  for (const potentialTarget of sortedNodeIds) {
                    if (potentialSource === potentialTarget) continue;
                    
                    const expectedEdgeId = `${potentialSource}-${potentialTarget}`;
                    if (edgeId === expectedEdgeId) {
                      // Perfect match
                      sourceId = potentialSource;
                      targetId = potentialTarget;
                      break;
                    } else if (edgeId.includes(potentialSource) && edgeId.includes(potentialTarget)) {
                      // Both IDs are present in the edge ID
                      const sourceIndex = edgeId.indexOf(potentialSource);
                      const targetIndex = edgeId.indexOf(potentialTarget);
                      if (sourceIndex < targetIndex) {
                        const score = potentialSource.length + potentialTarget.length;
                        if (score > bestMatch.score) {
                          bestMatch = { source: potentialSource, target: potentialTarget, score };
                        }
                      }
                    }
                  }
                  if (sourceId && targetId) break;
                }
                
                // Use best match if no perfect match found
                if (!sourceId && bestMatch.score > 0) {
                  sourceId = bestMatch.source;
                  targetId = bestMatch.target;
                }
              }
              
              if (sourceId && targetId && sourceId !== targetId) {
                extractedEdges.push({
                  id: edgeId,
                  source: sourceId,
                  target: targetId,
                  sourceHandle: 'bottom-source', // Correct handle ID used by custom nodes
                  targetHandle: 'top-target',    // Correct handle ID used by custom nodes
                  type: 'default',
                  style: { stroke: '#2563eb', strokeWidth: 3 },
                  data: { extractedFromDOM: true }
                });
              } else {
                console.warn('🔍 useExportImportGraph.ts: Could not parse edge:', edgeId, 'source:', sourceId, 'target:', targetId);
              }
            });
            
            console.log('🔍 useExportImportGraph.ts: Extracted', extractedNodes.length, 'nodes and', extractedEdges.length, 'edges from DOM');
            
            if (extractedNodes.length > 0) {
              const extractedData = {
                nodes: extractedNodes,
                edges: extractedEdges,
                extractionMethod: 'DOM_SCRAPING',
                extractionTime: Date.now()
              };
              
              const dataStr = JSON.stringify(extractedData, null, 2);
              const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
              
              const downloadLink = document.createElement('a');
              downloadLink.setAttribute('href', dataUri);
              downloadLink.setAttribute('download', fileName);
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              
              toast.success(`Graph extracted from DOM: ${extractedNodes.length} nodes, ${extractedEdges.length} edges`);
              return dataStr;
            }
          }
        } catch (e) {
          console.error('🔍 useExportImportGraph.ts: Error extracting from DOM:', e);
        }
      }
      
      // Export current graph with all current nodes and edges
      const dataStr = JSON.stringify({ 
        nodes: nodes || [], 
        edges: edges || [], 
        exportTime: Date.now() 
      }, null, 2);
      
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Create and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.setAttribute('href', dataUri);
      downloadLink.setAttribute('download', fileName);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      if (nodes && nodes.length > 0) {
        toast.success(`Graph exported as ${fileName} with ${nodes.length} nodes`);
      } else {
        toast.success('Empty graph exported successfully');
      }
      return dataStr;
    } catch (error) {
      console.error('Error exporting graph:', error);
      toast.error('Failed to export graph');
      return null;
    }
  }, [nodes, edges]);

  // Import a graph from JSON content from a file
  const importGraph = useCallback(
    (file: File) => {
      if (!setNodes || !setEdges) {
        console.error('Cannot import graph: setNodes or setEdges not provided');
        toast.error('Import failed', {
          description: 'Unable to update the graph display'
        });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          if (!jsonData) {
            toast.error('Empty file', {
              description: 'The imported file is empty'
            });
            return;
          }
          
          const parsedData = JSON.parse(jsonData);
          if (!parsedData.nodes || !parsedData.edges) {
            toast.error('Invalid graph data', {
              description: 'The imported file does not contain valid nodes and edges'
            });
            return;
          }
          
          // First reset all counters to avoid ID conflicts
          resetCounters();
          
          // Then update counters based on imported nodes
          updateDnnCounter(parsedData.nodes);
          
          // CRITICAL FIX: Clear existing graph completely before importing
          console.log('Clearing existing graph before import');
          
          // Clear using React state - ReactFlow will automatically sync
          console.log('Clearing state before import');
          setNodes([]);
          setEdges([]);
          
          // Reset viewport
          if (reactFlowInstance) {
            reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
          }
          
          // Set the imported nodes and edges with a delay
          setTimeout(() => {
            console.log('Setting imported nodes:', parsedData.nodes.length);
            
            // Ensure all nodes have the correct type set for our CustomNode component
            // but preserve the original data.type which determines the specific node component
            const processedNodes = parsedData.nodes.map((node: Node) => ({
              ...node,
              type: 'customNode', // ReactFlow type for component lookup
              data: {
                ...node.data,
                // Preserve data.type which StandardNodeWrapper uses to render specific nodes
                type: node.data?.type || 'generic'
              }
            }));
            
            console.log('Processed nodes with types:', processedNodes.map(n => ({ id: n.id, type: n.type, dataType: n.data?.type })));
            
            // Set nodes in React state - ReactFlow will sync automatically
            console.log('Setting nodes in React state');
            console.log('ReactFlow instance available:', !!reactFlowInstance);
            setNodes(processedNodes);
            
            // Wait longer for nodes to fully render before setting edges
            setTimeout(() => {
              console.log('Setting imported edges:', parsedData.edges.length);
              
              // Use only the imported edges - no auto-generation to prevent spurious edges
              console.log('Using imported edges without auto-generation to prevent spurious connections');
              console.log('Original imported edges count:', parsedData.edges.length);
              
              // Filter out any duplicate edges by ID to prevent spurious connections
              const uniqueEdges = parsedData.edges.filter((edge: any, index: number, arr: any[]) => 
                arr.findIndex((e: any) => e.id === edge.id) === index
              );
              
              console.log('Filtered edges count after duplicate removal:', uniqueEdges.length);
              setEdges(uniqueEdges);
            }, 300);
            
            // Dispatch event after setting edges
            setTimeout(() => {
              console.log('Dispatching graph-loaded event after import');
              window.dispatchEvent(new CustomEvent('graph-loaded'));
              
              // Wait for state to propagate, then fit view
              if (reactFlowInstance) {
                setTimeout(() => {
                  console.log('Fitting view for imported graph...');
                  
                  // Reset viewport first  
                  reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 0.5 });
                  
                  setTimeout(() => {
                    reactFlowInstance.fitView({ 
                      padding: 0.1,
                      includeHiddenNodes: true,
                      minZoom: 0.1,
                      maxZoom: 1.5,
                      duration: 1000
                    });
                  }, 300);
                }, 1000);
              }
            }, 500);
          }, 100);
          
          // Show import success toast with proper styling
          toast.success(`Graph imported successfully with ${parsedData.nodes.length} nodes and ${parsedData.edges.length} edges`, {
            style: {
              color: '#000000 !important',
              backgroundColor: '#ffffff !important',
              border: '1px solid #e0e0e0 !important',
              fontSize: '14px !important',
              fontWeight: '500 !important'
            },
            className: 'custom-success-toast'
          });
        } catch (error) {
          console.error('Error importing graph:', error);
          toast.error('Failed to import graph', {
            description: 'The file could not be parsed as valid JSON'
          });
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read file', {
          description: 'The file could not be read'
        });
      };
      
      reader.readAsText(file);
    },
    [setNodes, setEdges, reactFlowInstance]
  );

  return {
    exportGraph,
    importGraph
  };
};
