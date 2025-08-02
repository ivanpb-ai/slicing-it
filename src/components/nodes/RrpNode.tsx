import React, { memo, useCallback } from "react";
import { NodeData } from "../../types/nodeTypes";
import { useRrpPlmn } from "../../hooks/node/useRrpPlmn";
import { useRrpBands } from "../../hooks/node/useRrpBands";
import { useRrpName } from "../../hooks/node/useRrpName";
import { useNodeEditorContext } from "../../contexts/NodeEditorContext";
import { RrpBands } from "./rrp/RrpBands";
import { Handle, Position } from "@xyflow/react";

interface RrpNodeProps {
  id: string;
  data: NodeData;
}

const RrpNode = memo(({ id, data }: RrpNodeProps) => {
  // Callbacks from your editor context (must update node data upstream)
  const { createChildNode, updateNodeData } = useNodeEditorContext();

  // Use rrpName hook; pass callback to persist new name
  const {
    isEditingName,
    rrpName,
    handleNameChange,
    handleNameBlur,
    handleNameClick,
  } = useRrpName(
    data,
    useCallback(
      (newName) => {
        updateNodeData(id, { ...data, rrpName: newName });
      },
      [id, data, updateNodeData]
    )
  );

  // PLMN logic (creates RRP member nodes)
  const {
    isEditingPLMN,
    plmn,
    handlePLMNChange,
    handlePLMNBlur,
    handlePLMNClick,
  } = useRrpPlmn(data, createChildNode);

  // Bands logic (can be passed as props into <RrpBands /> below)
  const {
    rrpBands,
    editingBandIndex,
    editingField,
    editValue,
    handleAddBand,
    handleBandFieldEdit,
    handleBandFieldChange,
    handleBandFieldBlur,
    handleRemoveBand
  } = useRrpBands(data);

  return (
     <div>
      <div className="w-full bg-green-100 border-b border-green-200 px-2 py-1 mb-2 rounded-t">
        <div className="text-sm font-semibold text-green-800 text-center">{data.nodeId}</div>
      </div>

      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!w-4 !h-4 !border-2 !rounded-full !border-white !bg-blue-500 !z-50"
        style={{ top: -8 }}
      />

      {/* Header with RRP ID */}
      <div className="w-full text-center text-xs text-gray-500 font-bold my-1 select-none">
        {data.rrpId
          ? `RRP #${data.rrpId}`
          : data.nodeId
          ? `Node ID: ${data.nodeId}`
          : "RRP Node"}
      </div>

      {/* RRP Name field (editable) */}
      <div className="w-full text-center font-mono text-lg mb-2">
        {isEditingName ? (
          <input
            className="w-full px-1 py-0.5 border rounded"
            value={rrpName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            autoFocus
            maxLength={48}
            placeholder="Enter RRP name"
            type="text"
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
            type="text"
          />
        ) : (
          <span
            tabIndex={0}
            className="ml-1 cursor-pointer outline-none hover:underline focus:ring text-blue-600 text-xs"
            onClick={handlePLMNClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handlePLMNClick();
            }}
            title="Click to add PLMN and create RRPmember"
          >
            {plmn ? plmn : "Add PLMN (creates RRPmember)"}
          </span>
        )}
      </div>

      {/* Bands editor */}
      <RrpBands
        bands={rrpBands}
        editingBandIndex={editingBandIndex}
        editingField={editingField}
        editValue={editValue}
        onFieldEdit={handleBandFieldEdit}
        onFieldChange={handleBandFieldChange}
        onFieldBlur={handleBandFieldBlur}
        onRemove={handleRemoveBand}
        onAdd={handleAddBand}
      />

      {/* Bottom Handle */}
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
});

export default RrpNode;
