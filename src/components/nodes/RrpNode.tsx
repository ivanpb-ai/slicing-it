import React from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeProps } from "@xyflow/react";
import { NodeData, NodeType } from "../../types/nodeTypes";
import { useRrpPlmn } from "../../hooks/node/useRrpPlmn";
import { useRrpName } from "../../hooks/node/useRrpName";

/**
 * RrpNode component
 * - Editable rrpName (click div → input)
 * - Editable PLMN (add RRPmember, input behaves the same)
 * - Connection handles on top/bottom
 * - Callbacks for persisting rrpName upward
 */
export const RrpNode: React.FC<NodeProps<NodeData>> = ({ id, data }) => {
  // ---- Name Editing ----
  // Parent callback to persist rrpName change
  const handlePersistRrpName = React.useCallback(
    (newName: string) => {
      // TODO: Call upstream function (e.g. onNodeDataChange) to persist new rrpName
      // Example (if using context or passed update method):
      // updateNodeData(id, { ...data, rrpName: newName });
      // For now, log:
      console.log(`Persist RRP name for node ${id}:`, newName);
    },
    [id, data]
  );

  const {
    isEditingName,
    rrpName,
    handleNameChange,
    handleNameBlur,
    handleNameClick,
  } = useRrpName(data, handlePersistRrpName);

  // ---- PLMN Editing & Management ----
  // You must pass in your `createChildNode` function,
  // typically fetched from context, hook, or props.
  // Below is a placeholder that does nothing,
  // replace this with your actual creation function!
  const createChildNode = React.useCallback(
    (
      type: NodeType,
      position: { x: number; y: number },
      parentId: string,
      fiveQIId?: string
    ) => {
      // Example:
      // return actuallyCreateNode(type, position, parentId, fiveQIId);
      console.log("createChildNode called", type, position, parentId, fiveQIId);
      return null;
    },
    []
  );

  const {
    isEditingPLMN,
    plmn,
    handlePLMNChange,
    handlePLMNBlur,
    handlePLMNClick,
  } = useRrpPlmn(data, createChildNode);

  // ---- Render Node ----
  return (
    <div
      className="bg-white border-2 border-blue-500 rounded-xl shadow-md px-4 py-2 flex flex-col gap-1 items-center min-w-[180px] relative"
      style={{ minHeight: 80, minWidth: 180 }}
    >
      {/* Handle at Top (target) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !z-50"
        style={{ top: -8 }}
      />

{/* Header with RRP ID (restored) */}
<div className="w-full text-center text-xs text-gray-500 font-mono my-1 select-none">
  {data.rrpId
    ? `RRP ID: ${data.rrpId}`
    : data.nodeId
    ? `Node ID: ${data.nodeId}`
    : "RRP Node"}
</div>

      {/* RRP Name (editable) */}
      <div className="w-full text-center font-bold text-lg mb-2">
        {isEditingName ? (
          <input
            className="w-full px-1 py-0.5 border rounded"
            value={rrpName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            autoFocus
            maxLength={48}
            placeholder="Enter RRP name"
          />
        ) : (
          <span
            tabIndex={0}
            className="cursor-pointer outline-none focus:ring"
            onClick={handleNameClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleNameClick();
            }}
            title="Click to edit RRP name"
          >
            {rrpName || "Click to set RRP name"}
          </span>
        )}
      </div>

      {/* PLMN (editable/addable) */}
      <div className="w-full flex items-center gap-1">
        <span className="text-xs text-gray-500">PLMN</span>
        {isEditingPLMN ? (
          <input
            className="w-24 px-1 py-0.5 border rounded"
            value={plmn}
            onChange={handlePLMNChange}
            onBlur={handlePLMNBlur}
            autoFocus
            maxLength={12}
            placeholder="Enter PLMN"
          />
        ) : (
          <span
            tabIndex={0}
            className="ml-1 cursor-pointer outline-none hover:underline focus:ring text-blue-600 text-xs"
            onClick={handlePLMNClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handlePLMNClick();
            }}
            title="Click to add PLMN and create RRP member"
          >
            {plmn ? plmn : "Add PLMN (creates RRPmember)"}
          </span>
        )}
      </div>

      {/* Handle at Bottom (source) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !z-50"
        style={{ bottom: -8 }}
        isConnectable={true}
      />
    </div>
  );
};

export default RrpNode;
