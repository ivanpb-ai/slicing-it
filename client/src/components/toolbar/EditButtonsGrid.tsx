
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import ActionButton from "./buttons/ActionButton";
import { Trash, CopyPlus } from "lucide-react";

interface EditButtonsGridProps {
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  hasSelectedElements: boolean;
}

const EditButtonsGrid: React.FC<EditButtonsGridProps> = ({
  onDeleteSelected,
  onDuplicateSelected,
  hasSelectedElements
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <TooltipProvider>
        <ActionButton 
          label="Delete"
          icon={Trash}
          iconColor="text-red-500"
          tooltipTitle="Delete Selected"
          tooltipDescription="Remove selected nodes or connections"
          onClick={onDeleteSelected}
          disabled={!hasSelectedElements}
        />

        <ActionButton 
          label="Duplicate"
          icon={CopyPlus}
          iconColor="text-amber-500"
          tooltipTitle="Duplicate Selected"
          tooltipDescription="Create a copy of selected nodes"
          onClick={onDuplicateSelected}
          disabled={!hasSelectedElements}
        />
      </TooltipProvider>
    </div>
  );
};

export default EditButtonsGrid;
