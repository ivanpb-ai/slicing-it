import { Edge, MarkerType } from '@xyflow/react';

// Get initial edges
export const getInitialEdges = (): Edge[] => {
  return [
    {
      id: 'edge-1',
      source: 'network-1',
      target: 'cell-area-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'straight',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      data: {
        curvature: 0,
        shortened: true,
        shortenFactor: 0.95,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 8,
        height: 8,
        color: '#94a3b8',
      },
    },
    {
      id: 'edge-2',
      source: 'cell-area-1',
      target: 'rrp-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'straight',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      data: {
        curvature: 0,
        shortened: true, // Now we shorten ALL connections
        shortenFactor: 0.95,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 8,
        height: 8,
        color: '#94a3b8',
      },
    },
    {
      id: 'edge-3',
      source: 'rrp-1',
      target: 's-nssai-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'straight',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      data: {
        curvature: 0,
        shortened: true,
        shortenFactor: 0.95,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 8,
        height: 8,
        color: '#94a3b8',
      },
    },
    {
      id: 'edge-4',
      source: 's-nssai-1',
      target: 'dnn-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'straight',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      data: {
        curvature: 0,
        shortened: true,
        shortenFactor: 0.95,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 8,
        height: 8,
        color: '#94a3b8',
      },
    },
    {
      id: 'edge-5',
      source: 'dnn-1',
      target: '5qi-1',
      sourceHandle: 'bottom-source',
      targetHandle: 'top-target',
      type: 'straight',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      data: {
        curvature: 0,
        shortened: true,
        shortenFactor: 0.95,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 8,
        height: 8,
        color: '#94a3b8',
      },
    },
  ];
};
