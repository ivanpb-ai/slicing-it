import { useState, useCallback, useRef } from 'react';
import { Node, Edge, Connection, addEdge, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { NodeType } from '@/types/nodeTypes';
import { useNodeCreation } from './node/useNodeCreation';
import { useSimpleChildNodeCreation } from './node/useSimpleChildNodeCreation';
import { useEdgeCreation } from './edge/useEdgeCreation';
import { useNodeSelection } from './node/useNodeSelection';
import { useNodeDuplication } from './node/useNodeDuplication';
import { resetCounters, updateDnnCounter } from '@/utils/flowData/idCounters';

// Enhanced mats1 graph data with more realistic network configuration and proper spacing
const MATS1_EXAMPLE_GRAPH = {
  nodes: [
    {
      id: 'network-1',
      type: 'customNode',
      position: { x: 400, y: 50 },
      data: {
        type: 'network',
        label: 'NETWORK Node',
        nodeId: 'network-1',
        networkName: 'Core Network MATS1',
        networkType: '5G SA',
        plmnId: '310410'
      }
    },
    {
      id: 'cell-area-1',
      type: 'customNode',
      position: { x: 200, y: 250 },
      data: {
        type: 'cell-area',
        label: 'CELL-AREA Node',
        cellAreaId: 1,
        cellAreaDescription: 'TAC 100',
        nodeId: 'cell-area-1',
        trackingAreaCode: '100',
        gNBIds: ['1001', '1002', '1003'],
        cellCount: 12
      }
    },
    {
      id: 'cell-area-2',
      type: 'customNode',
      position: { x: 600, y: 250 },
      data: {
        type: 'cell-area',
        label: 'CELL-AREA Node',
        cellAreaId: 2,
        cellAreaDescription: 'TAC 200',
        nodeId: 'cell-area-2',
        trackingAreaCode: '200',
        gNBIds: ['2001', '2002', '2003'],
        cellCount: 8
      }
    },
    {
      id: 'rrp-1',
      type: 'customNode',
      position: { x: 200, y: 450 },
      data: {
        type: 'rrp',
        label: 'RRP Node',
        rrpPercentage: 100,
        nodeId: 'rrp-1',
        rrpName: 'RRP_Enterprise',
        rrpId: 'rrp-001',
        priority: 1,
        bands: [
          { band: 'n78', frequency: '3.5GHz', bandwidth: '100MHz' },
          { band: 'n77', frequency: '3.7GHz', bandwidth: '80MHz' }
        ],
        plmnValues: ['310410', '310411']
      }
    },
    {
      id: 'rrp-2',
      type: 'customNode',
      position: { x: 600, y: 450 },
      data: {
        type: 'rrp',
        label: 'RRP Node',
        rrpPercentage: 80,
        nodeId: 'rrp-2',
        rrpName: 'RRP_Consumer',
        rrpId: 'rrp-002',
        priority: 2,
        bands: [
          { band: 'n78', frequency: '3.5GHz', bandwidth: '60MHz' },
          { band: 'n1', frequency: '2.1GHz', bandwidth: '20MHz' }
        ],
        plmnValues: ['310410']
      }
    },
    // RRP Member nodes for RRP-1 with proper spacing
    {
      id: 'rrpmember-1',
      type: 'customNode',
      position: { x: 100, y: 650 },
      data: {
        type: 'rrpmember',
        label: 'RRP Member',
        nodeId: 'rrpmember-1',
        parentId: 'rrp-1',
        plmnValue: '310410'
      }
    },
    {
      id: 'rrpmember-2',
      type: 'customNode',
      position: { x: 300, y: 650 },
      data: {
        type: 'rrpmember',
        label: 'RRP Member',
        nodeId: 'rrpmember-2',
        parentId: 'rrp-1',
        plmnValue: '310411'
      }
    },
    // RRP Member node for RRP-2
    {
      id: 'rrpmember-3',
      type: 'customNode',
      position: { x: 600, y: 650 },
      data: {
        type: 'rrpmember',
        label: 'RRP Member',
        nodeId: 'rrpmember-3',
        parentId: 'rrp-2',
        plmnValue: '310410'
      }
    },
    // S-NSSAI nodes with proper vertical spacing (increased gap from RRP members)
    {
      id: 's-nssai-1',
      type: 'customNode',
      position: { x: 100, y: 850 },
      data: {
        type: 's-nssai',
        label: 'S-NSSAI Node',
        snssaiId: 1,
        nodeId: 's-nssai-1',
        sliceType: 'eMBB',
        serviceDifferentiator: '001',
        sst: '1',
        sd: '000001',
        description: 'Enhanced Mobile Broadband Enterprise'
      }
    },
    {
      id: 's-nssai-2',
      type: 'customNode',
      position: { x: 400, y: 850 },
      data: {
        type: 's-nssai',
        label: 'S-NSSAI Node',
        snssaiId: 2,
        nodeId: 's-nssai-2',
        sliceType: 'URLLC',
        serviceDifferentiator: '002',
        sst: '2',
        sd: '000002',
        description: 'Ultra-Reliable Low Latency Communications'
      }
    },
    {
      id: 's-nssai-3',
      type: 'customNode',
      position: { x: 700, y: 850 },
      data: {
        type: 's-nssai',
        label: 'S-NSSAI Node',
        snssaiId: 3,
        nodeId: 's-nssai-3',
        sliceType: 'mIoT',
        serviceDifferentiator: '003',
        sst: '3',
        sd: '000003',
        description: 'Massive IoT Services'
      }
    },
    // DNN nodes positioned properly below their parent S-NSSAI nodes
    {
      id: 'dnn-1',
      type: 'customNode',
      position: { x: 50, y: 1100 },
      data: {
        type: 'dnn',
        label: 'DNN Node',
        dnnId: 1,
        nodeId: 'dnn-1',
        parentId: 's-nssai-1',
        dnnName: 'enterprise.mnc410.mcc310.gprs',
        apnName: 'enterprise',
        ipVersion: 'IPv4v6',
        dnaiList: ['enterprise-edge-1', 'enterprise-edge-2']
      }
    },
    {
      id: 'dnn-2',
      type: 'customNode',
      position: { x: 150, y: 1100 },
      data: {
        type: 'dnn',
        label: 'DNN Node',
        dnnId: 2,
        nodeId: 'dnn-2',
        parentId: 's-nssai-1',
        dnnName: 'internet.mnc410.mcc310.gprs',
        apnName: 'internet',
        ipVersion: 'IPv4v6',
        dnaiList: ['internet-edge-1']
      }
    },
    {
      id: 'dnn-3',
      type: 'customNode',
      position: { x: 700, y: 1100 },
      data: {
        type: 'dnn',
        label: 'DNN Node',
        dnnId: 3,
        nodeId: 'dnn-3',
        parentId: 's-nssai-3',
        dnnName: 'iot.mnc410.mcc310.gprs',
        apnName: 'iot',
        ipVersion: 'IPv4',
        dnaiList: ['iot-edge-1', 'iot-edge-2', 'iot-edge-3']
      }
    },
    {
      id: 'dnn-4',
      type: 'customNode',
      position: { x: 400, y: 1100 },
      data: {
        type: 'dnn',
        label: 'DNN Node',
        dnnId: 4,
        nodeId: 'dnn-4',
        parentId: 's-nssai-2',
        dnnName: 'urllc.mnc410.mcc310.gprs',
        apnName: 'urllc',
        ipVersion: 'IPv4v6',
        dnaiList: ['urllc-edge-1']
      }
    },
    // 5QI nodes with proper spacing to prevent overlap (positioned below DNN nodes)
    {
      id: '5qi-1',
      type: 'customNode',
      position: { x: 0, y: 1350 },
      data: {
        type: '5qi',
        label: '5QI Node',
        fiveQIId: '1',
        nodeId: '5qi-1',
        qciDescription: 'Conversational Voice',
        priority: 20,
        packetDelayBudget: '100ms',
        packetErrorRate: '10^-2',
        resourceType: 'GBR'
      }
    },
    {
      id: '5qi-2',
      type: 'customNode',
      position: { x: 100, y: 1350 },
      data: {
        type: '5qi',
        label: '5QI Node',
        fiveQIId: '2',
        nodeId: '5qi-2',
        qciDescription: 'Conversational Video',
        priority: 40,
        packetDelayBudget: '150ms',
        packetErrorRate: '10^-3',
        resourceType: 'GBR'
      }
    },
    {
      id: '5qi-3',
      type: 'customNode',
      position: { x: 200, y: 1350 },
      data: {
        type: '5qi',
        label: '5QI Node',
        fiveQIId: '5',
        nodeId: '5qi-3',
        qciDescription: 'IMS Signalling',
        priority: 10,
        packetDelayBudget: '100ms',
        packetErrorRate: '10^-6',
        resourceType: 'Non-GBR'
      }
    },
    {
      id: '5qi-4',
      type: 'customNode',
      position: { x: 350, y: 1350 },
      data: {
        type: '5qi',
        label: '5QI Node',
        fiveQIId: '6',
        nodeId: '5qi-4',
        qciDescription: 'Video Streaming',
        priority: 60,
        packetDelayBudget: '300ms',
        packetErrorRate: '10^-6',
        resourceType: 'Non-GBR'
      }
    },
    {
      id: '5qi-5',
      type: 'customNode',
      position: { x: 450, y: 1350 },
      data: {
        type: '5qi',
        label: '5QI Node',
        fiveQIId: '7',
        nodeId: '5qi-5',
        qciDescription: 'Voice/Video/Gaming',
        priority: 70,
        packetDelayBudget: '100ms',
        packetErrorRate: '10^-3',
        resourceType: 'Non-GBR'
      }
    },
    {
      id: '5qi-6',
      type: 'customNode',
      position: { x: 650, y: 1350 },
      data: {
        type: '5qi',
        label: '5QI Node',
        fiveQIId: '8',
        nodeId: '5qi-6',
        qciDescription: 'Video Streaming TCP',
        priority: 80,
        packetDelayBudget: '300ms',
        packetErrorRate: '10^-6',
        resourceType: 'Non-GBR'
      }
    },
    {
      id: '5qi-7',
      type: 'customNode',
      position: { x: 750, y: 1350 },
      data: {
        type: '5qi',
        label: '5QI Node',
        fiveQIId: '9',
        nodeId: '5qi-7',
        qciDescription: 'Web Browsing',
        priority: 90,
        packetDelayBudget: '300ms',
        packetErrorRate: '10^-6',
        resourceType: 'Non-GBR'
      }
    },
    {
      id: '5qi-8',
      type: 'customNode',
      position: { x: 350, y: 1450 },
      data: {
        type: '5qi',
        label: '5QI Node',
        fiveQIId: '82',
        nodeId: '5qi-8',
        qciDescription: 'Low Latency eMBB',
        priority: 19,
        packetDelayBudget: '10ms',
        packetErrorRate: '10^-4',
        resourceType: 'Non-GBR'
      }
    }
  ],
  edges: [
    // Network to Cell Areas
    {
      id: 'network-1-cell-area-1',
      source: 'network-1',
      target: 'cell-area-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'network-1-cell-area-2',
      source: 'network-1',
      target: 'cell-area-2',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    // Cell Areas to RRPs
    {
      id: 'cell-area-1-rrp-1',
      source: 'cell-area-1',
      target: 'rrp-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'cell-area-2-rrp-2',
      source: 'cell-area-2',
      target: 'rrp-2',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    // RRPs to RRP Members
    {
      id: 'rrp-1-rrpmember-1',
      source: 'rrp-1',
      target: 'rrpmember-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'rrp-1-rrpmember-2',
      source: 'rrp-1',
      target: 'rrpmember-2',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'rrp-2-rrpmember-3',
      source: 'rrp-2',
      target: 'rrpmember-3',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    // RRP Members to S-NSSAIs (FIXED: Now connects from RRP members instead of RRPs)
    {
      id: 'rrpmember-1-s-nssai-1',
      source: 'rrpmember-1',
      target: 's-nssai-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'rrpmember-2-s-nssai-3',
      source: 'rrpmember-2',
      target: 's-nssai-3',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'rrpmember-3-s-nssai-2',
      source: 'rrpmember-3',
      target: 's-nssai-2',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    // S-NSSAIs to DNNs
    {
      id: 's-nssai-1-dnn-1',
      source: 's-nssai-1',
      target: 'dnn-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 's-nssai-1-dnn-2',
      source: 's-nssai-1',
      target: 'dnn-2',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 's-nssai-2-dnn-4',
      source: 's-nssai-2',
      target: 'dnn-4',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 's-nssai-3-dnn-3',
      source: 's-nssai-3',
      target: 'dnn-3',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    // DNNs to 5QIs
    {
      id: 'dnn-1-5qi-1',
      source: 'dnn-1',
      target: '5qi-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'dnn-1-5qi-2',
      source: 'dnn-1',
      target: '5qi-2',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'dnn-1-5qi-3',
      source: 'dnn-1',
      target: '5qi-3',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'dnn-2-5qi-4',
      source: 'dnn-2',
      target: '5qi-4',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'dnn-2-5qi-5',
      source: 'dnn-2',
      target: '5qi-5',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'dnn-3-5qi-6',
      source: 'dnn-3',
      target: '5qi-6',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'dnn-4-5qi-7',
      source: 'dnn-4',
      target: '5qi-7',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    },
    {
      id: 'dnn-4-5qi-8',
      source: 'dnn-4',
      target: '5qi-8',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'default',
      style: { stroke: '#2563eb', strokeWidth: 3 }
    }
  ]
};

export const useNodeEditor = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const reactFlowInstance = useReactFlow();

  // Node creation hooks
  const { createNode } = useNodeCreation(setNodes);
  const { addEdgeWithHandles } = useEdgeCreation(setEdges);
  const { createChildNode } = useSimpleChildNodeCreation(setNodes, addEdgeWithHandles);
  
  // Selection and duplication hooks
  const { selectedElements, handleSelectionChange } = useNodeSelection();
  const { duplicateSelected } = useNodeDuplication(nodes, edges, setNodes, setEdges, selectedElements);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const updatedNodes = nds.map(node => {
        const change = changes.find((c: any) => c.id === node.id);
        if (change) {
          if (change.type === 'position' && change.position) {
            return { ...node, position: change.position };
          }
          if (change.type === 'select') {
            return { ...node, selected: change.selected };
          }
          if (change.type === 'remove') {
            return null;
          }
        }
        return node;
      }).filter(Boolean) as Node[];
      
      return updatedNodes;
    });
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      const updatedEdges = eds.map(edge => {
        const change = changes.find((c: any) => c.id === edge.id);
        if (change) {
          if (change.type === 'select') {
            return { ...edge, selected: change.selected };
          }
          if (change.type === 'remove') {
            return null;
          }
        }
        return edge;
      }).filter(Boolean) as Edge[];
      
      return updatedEdges;
    });
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const onSelectionChange = useCallback((params: any) => {
    handleSelectionChange(params);
  }, [handleSelectionChange]);

  const addNode = useCallback((type: NodeType, position: { x: number; y: number }, fiveQIId?: string) => {
    console.log(`useNodeEditor: Adding ${type} node at position:`, position);
    createNode(type, position, fiveQIId);
  }, [createNode]);

  const deleteSelected = useCallback(() => {
    if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) {
      toast.error('No elements selected for deletion');
      return;
    }

    const selectedNodeIds = selectedElements.nodes.map(n => n.id);
    const selectedEdgeIds = selectedElements.edges.map(e => e.id);

    // Remove selected nodes
    setNodes(prevNodes => 
      prevNodes.filter(node => !selectedNodeIds.includes(node.id))
    );

    // Remove selected edges
    setEdges(prevEdges => 
      prevEdges.filter(edge => !selectedEdgeIds.includes(edge.id))
    );

    toast.success(`Deleted ${selectedElements.nodes.length} nodes and ${selectedElements.edges.length} edges`);
  }, [selectedElements]);

  const duplicateSelectedNodes = useCallback(() => {
    duplicateSelected();
  }, [duplicateSelected]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    resetCounters();
    
    if (reactFlowInstance) {
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
    }
    
    toast.success('Canvas cleared');
  }, [reactFlowInstance]);

  // Initialize canvas with hardcoded mats1 graph
  const initializeCanvas = useCallback(() => {
    console.log('useNodeEditor: Initializing canvas with hardcoded mats1 graph');
    
    try {
      const graphData = MATS1_EXAMPLE_GRAPH;
      
      console.log(`Loading mats1 graph with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);
      
      // Reset counters before loading
      resetCounters();
      updateDnnCounter(graphData.nodes);
      
      // Clear existing state first
      setNodes([]);
      setEdges([]);
      
      // Reset viewport
      if (reactFlowInstance) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      }
      
      // Set nodes first
      setTimeout(() => {
        setNodes(graphData.nodes || []);
        
        // Then set edges with delay to ensure nodes are rendered
        setTimeout(() => {
          setEdges(graphData.edges || []);
          
          // Fit view after loading
          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({ padding: 0.2 });
            }
            toast.success('Example graph (mats1) loaded successfully');
          }, 200);
        }, 100);
      }, 50);
      
    } catch (error) {
      console.error('Error loading mats1 graph:', error);
      toast.error('Failed to load example graph');
    }
  }, [reactFlowInstance]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    selectedElements,
    addNode,
    createChildNode,
    deleteSelected,
    duplicateSelected: duplicateSelectedNodes,
    clearCanvas,
    initializeCanvas
  };
};
