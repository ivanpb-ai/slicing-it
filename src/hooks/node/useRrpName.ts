import { getNextRrpId } from '../../utils/flowData/idCounters';
import { useState, useCallback, useEffect } from "react";
import { NodeData } from "../../types/nodeTypes";

export const useRrpName = (
  data: NodeData,
  onRrpNameChange?: (newName: string) => void
) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [rrpName, setRrpName] = useState(data.rrpName || 'Enter RRP name');

  // Sync with external changes
  useEffect(() => {
    setRrpName(data.rrpName || 'Enter RRP name');
  }, [data.rrpName]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newRrpName = getNextRrpId(e.target.value);
    setRrpName(newRrpName);
    if (onRrpNameChange) onRrpNameChange(newRrpName);
    // Do NOT mutate data directly here
  }, [onRrpNameChange]);

  const handleNameBlur = useCallback(() => {
    setIsEditingName(false);
  }, []);

  const handleNameClick = useCallback(() => {
    setIsEditingName(true);
  }, []);

  return {
    isEditingName,
    rrpName,
    handleNameChange,
    handleNameBlur,
    handleNameClick
  };
};
