
import { Network, RadioTower, Router, Key, Database, BarChart } from "lucide-react";

type NodeIconProps = {
  nodeType: string;
};

const NodeIcon = ({ nodeType }: NodeIconProps) => {
  switch (nodeType) {
    case "network":
      return <Network className="h-4 w-4 text-indigo-500" />;
    case "cell-area":
      return <RadioTower className="h-4 w-4 text-blue-500" />;
    case "rrp":
      return <Router className="h-4 w-4 text-green-500" />;
    case "s-nssai":
      return <Key className="h-4 w-4 text-amber-500" />;
    case "dnn":
      return <Database className="h-4 w-4 text-red-500" />;
    case "5qi":
      return <BarChart className="h-4 w-4 text-purple-500" />;
    default:
      return <Network className="h-4 w-4 text-gray-500" />;
  }
};

export default NodeIcon;
