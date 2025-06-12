
import { Handle, Position } from '@xyflow/react';
import { NodeHandlesProps } from '@/types/nodeComponents';

export const NodeHandles = ({ position = 'top', type = 'source' }: NodeHandlesProps) => (
  <Handle
    type={type}
    position={position === 'top' ? Position.Top : Position.Bottom}
    className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !opacity-100 !z-50 !block !visible"
    id={position === 'top' ? (type === 'source' ? 'top-source' : 'top-target') : (type === 'source' ? 'bottom-source' : 'bottom-target')}
    isConnectable={true}
    style={{
      ...(position === 'top' ? { top: -8 } : { bottom: -8 }),
      zIndex: 50,
      visibility: 'visible',
      display: 'block',
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)'
    }}
  />
);
