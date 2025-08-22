
import { Node } from '@xyflow/react';

export const createInitialNetworkNode = (): Node => ({
  id: 'network-1',
  type: 'customNode',
  position: { x: 250, y: 50 },
  data: {
    label: 'Network #1',
    type: 'network',
    description: 'Main network entry point',
    ensureVisible: true,
    forceVisible: true,
    visibilityEnforced: true,
    preventHiding: true
  },
  style: {
    visibility: 'visible',
    display: 'flex',
    opacity: 1,
    zIndex: 2000,
    background: '#f5f7ff',
    borderWidth: '2px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)'
  }
});
