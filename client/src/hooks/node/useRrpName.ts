import { useState, useCallback, useEffect } from "react";
import { NodeData } from "../../types/nodeTypes";

export const useRrpName = (
  data: NodeData,
  onRrpNameChange?: (newName: string) => void
) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [rrpName, setRrpName] = useState(data.rrpName || "Enter RRP name");

  // If the node data.rrpName changes from outside, update local state
  useEffect(() => {
    setRrpName(data.rrpName || "Enter RRP name");
  }, [data.rrpName]);

  // On input change, update controlled local state
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRrpName(e.target.value);
  }, []);

  // On blur (or save), propagate to parent if callback provided
  const handleNameBlur = useCallback(() => {
    setIsEditingName(false);
    if (onRrpNameChange) {
      onRrpNameChange(rrpName.trim());
    }
  }, [onRrpNameChange, rrpName]);

  // Handle click to enter editing mode
  const handleNameClick = useCallback(() => {
    setIsEditingName(true);
  }, []);

  return {
    isEditingName,
    rrpName,
    handleNameChange,
    handleNameBlur,
    handleNameClick,
  };
};
