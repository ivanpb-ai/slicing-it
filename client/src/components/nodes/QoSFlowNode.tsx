import { useState, memo } from "react";
import { NodeData } from "../../types/nodeTypes";
import { Badge } from "../../components/ui/badge";
import { Handle, Position } from "@xyflow/react";
import { useNodeEditorContext } from "../../contexts/NodeEditorContext";

interface QoSFlowNodeProps {
  id: string;
  data: NodeData;
}

const QoSFlowNode = memo(({ id, data }: QoSFlowNodeProps) => {
  // Use state to track name and default checkbox
  const [qosFlowName, setQosFlowName] = useState(data.qosFlowName || '');
  const [isDefault, setIsDefault] = useState(data.isDefault || false);

  // Get node editor context for updating node data
  const { updateNodeData } = useNodeEditorContext();

  // Handle name change
  const handleNameChange = (newName: string) => {
    setQosFlowName(newName);
    if (updateNodeData && id) {
      updateNodeData(id, { ...data, qosFlowName: newName });
    }
  };

  // Handle default checkbox change
  const handleDefaultChange = (checked: boolean) => {
    setIsDefault(checked);
    if (updateNodeData && id) {
      updateNodeData(id, { ...data, isDefault: checked });
    }
  };

  // Extract QoS flow ID for display
  const qosFlowId = data.qosFlowId || data.id;

  return (
    <div className="w-full h-full flex flex-col items-center relative">
      {/* Input handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !opacity-100 !z-50"
        style={{ top: -8 }}
        isConnectable={true}
      />

      {/* Output handle at the bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !opacity-100 !z-50"
        style={{ bottom: -8 }}
        isConnectable={true}
      />

      <div className="text-xs text-gray-600 mt-1 text-center">
        {/* Header */}
        <div className="w-full bg-cyan-100 border-b border-cyan-200 px-2 py-1 mb-2 rounded-t">
          <div className="text-sm font-semibold text-cyan-800 text-center">QoS Flow</div>
        </div>

        {/* Display QoS Flow ID badge */}
        <Badge className="bg-cyan-500 text-white hover:bg-cyan-600 mb-2 px-4 py-2 text-sm font-semibold rounded-full">
          QoS Flow: {qosFlowId}
        </Badge>
        
        {/* Editable name field */}
        <div className="mt-2 mb-3">
          <label className="text-xs font-semibold text-cyan-800 block mb-1">Name</label>
          <input
            type="text"
            value={qosFlowName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter QoS Flow name"
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        
        {/* Default checkbox */}
        <div className="mt-3 flex items-center justify-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => handleDefaultChange(e.target.checked)}
              className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-cyan-800">Default</span>
          </label>
        </div>
      </div>
    </div>
  );
});

export default QoSFlowNode;