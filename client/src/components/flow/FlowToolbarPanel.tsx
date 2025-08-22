
import React from 'react';
import Toolbar from '@/components/Toolbar';
import { toast } from 'sonner';

interface FlowToolbarPanelProps {
  onAddNode: (type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn" | "fiveqi", fiveQIId?: string) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onClearCanvas: () => void;
  onInitializeCanvas: () => void;
  onArrangeLayout?: () => void;
  hasSelectedElements: boolean;
}

const FlowToolbarPanel: React.FC<FlowToolbarPanelProps> = ({
  onAddNode,
  onDeleteSelected,
  onDuplicateSelected,
  onClearCanvas,
  hasSelectedElements,
  onInitializeCanvas,
  onArrangeLayout
}) => {
  return (
    <Toolbar
      onAddNode={onAddNode}
      onDeleteSelected={onDeleteSelected}
      onDuplicateSelected={onDuplicateSelected}
      onClearCanvas={onClearCanvas}
      onInitializeCanvas={onInitializeCanvas}
      onArrangeLayout={onArrangeLayout}
      hasSelectedElements={hasSelectedElements}
    />
  );
};

export default FlowToolbarPanel;
