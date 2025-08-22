
import React from "react";
import { Button } from "@/components/ui/button";
import { GripHorizontal } from "lucide-react";

interface ToolbarHeaderProps {
  onDragStart: (e: React.MouseEvent) => void;
}

const ToolbarHeader: React.FC<ToolbarHeaderProps> = ({ onDragStart }) => {
  return (
    <div className="flex justify-between items-center mb-1 cursor-move" onMouseDown={onDragStart}>
      <div className="text-xs font-medium text-gray-700">Add Network Elements</div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 cursor-grab"
        onMouseDown={onDragStart}
      >
        <GripHorizontal className="h-5 w-5 text-gray-500" />
      </Button>
    </div>
  );
};

export default ToolbarHeader;
