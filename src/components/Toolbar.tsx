
import ToolbarContainer from "./toolbar/ToolbarContainer";

interface ToolbarProps {
  onAddNode: (type: "network" | "cell-area" | "rrp" | "s-nssai" | "dnn" | "5qi", fiveQIId?: string) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onClearCanvas: () => void;
  onInitializeCanvas: () => void;
  onArrangeLayout?: () => void;
  hasSelectedElements: boolean;
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  return <ToolbarContainer {...props} />;
};

export default Toolbar;
