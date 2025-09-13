
import React, { useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import NodeButton from "./buttons/NodeButton";
import FiveQINodeButton from "./buttons/FiveQINodeButton";
import { 
  Network, 
  RadioTower, 
  BarChart, 
  Workflow, 
  Share2, 
  Gauge,
  Database 
} from "lucide-react";

interface NodeButtonsGridProps {
  onAddNode: (type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn" | "qosflow" | "fiveqi", fiveQIId?: string) => void;
}

const NodeButtonsGrid: React.FC<NodeButtonsGridProps> = ({ onAddNode }) => {
  // Add a dedicated handler for 5QI nodes to ensure the ID is properly passed
  const handle5QINodeSelection = useCallback((fiveQIId: string) => {
    console.log(`Toolbar: Selected 5QI with ID: ${fiveQIId}`);
    // Make this an explicit string to ensure consistency
    const validId = String(fiveQIId);
    onAddNode("fiveqi", validId);
  }, [onAddNode]);

  return (
    <div className="grid grid-cols-3 gap-2">
      <TooltipProvider>
        <NodeButton 
          type="network"
          label="Network"
          icon={Network}
          iconColor="text-indigo-500"
          tooltipTitle="Network Node"
          tooltipDescription="Main network entry point (only one allowed)"
          onAddNode={onAddNode}
        />

        <NodeButton 
          type="cell-area"
          label="TAC"
          icon={RadioTower}
          iconColor="text-blue-500"
          tooltipTitle="TAC"
          tooltipDescription="Physical coverage area that connects to Network"
          onAddNode={onAddNode}
        />

        <NodeButton 
          type="rrp"
          label="RRP"
          icon={BarChart}
          iconColor="text-green-500"
          tooltipTitle="RRP Node"
          tooltipDescription="Radio Resource Partition - connects to Cell Area"
          onAddNode={onAddNode}
        />

        <NodeButton 
          type="s-nssai"
          label="S-NSSAI"
          icon={Workflow}
          iconColor="text-violet-500"
          tooltipTitle="S-NSSAI"
          tooltipDescription="Network Slice Selection - connects to RRP"
          onAddNode={onAddNode}
        />

        <NodeButton 
          type="dnn"
          label="DNN"
          icon={Share2}
          iconColor="text-orange-500"
          tooltipTitle="DNN Node"
          tooltipDescription="Data Network Name - connects to S-NSSAI"
          onAddNode={onAddNode}
        />

        <NodeButton 
          type="qosflow"
          label="QoS Flow"
          icon={Gauge}
          iconColor="text-cyan-500"
          tooltipTitle="QoS Flow Node"
          tooltipDescription="Quality of Service Flow - connects to DNN"
          onAddNode={onAddNode}
        />

        <FiveQINodeButton 
          icon={Database}
          iconColor="text-pink-500"
          onSelect={handle5QINodeSelection}
        />
      </TooltipProvider>
    </div>
  );
};

export default NodeButtonsGrid;
