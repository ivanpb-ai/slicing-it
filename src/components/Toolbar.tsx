
import ToolbarContainer from "./toolbar/ToolbarContainer";
import { LayoutType } from "@/utils/flowData/layouts";

interface ToolbarProps {
  onAddNode: (type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn" | "fiveqi", fiveQIId?: string) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onClearCanvas: () => void;
  onInitializeCanvas: () => void;
  onArrangeLayout?: (layoutType: LayoutType) => void;
  hasSelectedElements: boolean;
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  return <ToolbarContainer {...props} />;
};

export default Toolbar;
