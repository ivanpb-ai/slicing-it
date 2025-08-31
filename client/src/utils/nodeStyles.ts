
export const getBgColor = (nodeType: string): string => {
  switch (nodeType) {
    case "network":
      return "bg-indigo-50";
    case "cell-area":
      return "bg-blue-50";
    case "rrp":
      return "bg-green-50";
    case "rrpmember":
      return "bg-teal-50";
    case "s-nssai":
      return "bg-violet-50";
    case "dnn":
      return "bg-orange-50";
    case "fiveqi":
      return "bg-purple-50";
    default:
      return "bg-gray-50";
  }
};

export const getBorderColor = (nodeType: string): string => {
  switch (nodeType) {
    case "network":
      return "border-indigo-500";
    case "cell-area":
      return "border-blue-500";
    case "rrp":
      return "border-green-500";
    case "rrpmember":
      return "border-teal-500";
    case "s-nssai":
      return "border-violet-500";
    case "dnn":
      return "border-orange-500";
    case "fiveqi":
      return "border-purple-500";
    default:
      return "border-gray-200";
  }
};

export const getNodeShape = (nodeType: string): string => {
  switch (nodeType) {
    case "network":
      return "rounded-xl"; // Rectangle with rounded corners
    case "cell-area":
      return ""; // Hexagon shape (handled by CSS clip-path)
    case "rrp":
      return ""; // Pentagon shape (handled by CSS clip-path)
    case "rrpmember":
      return "rounded-full"; // Circle
    case "s-nssai":
      return ""; // Hexagon shape (handled by CSS clip-path)
    case "dnn":
      return ""; // Diamond shape (handled by CSS clip-path)
    case "fiveqi":
      return ""; // Octagon shape (handled by CSS clip-path)
    default:
      return "rounded-lg";
  }
};

export const getPadding = (nodeType: string): string => {
  switch (nodeType) {
    case "network":
      return "p-4";
    case "cell-area":
      return "p-3";
    case "rrp":
      return "p-4";
    case "rrpmember":
      return "p-4";
    case "s-nssai":
      return "p-4";
    case "dnn":
      return "p-4";
    case "fiveqi":
      return "p-4";
    default:
      return "p-3";
  }
};

export const getWidth = (nodeType: string, rrpPercentage?: number): string => {
  switch (nodeType) {
    case "network":
      return "min-w-[200px]";
    case "cell-area":
      return "min-w-[150px]";
    case "rrp":
      const baseWidth = 200; 
      const percentage = rrpPercentage || 100;
      const scaledWidth = Math.max(baseWidth * (percentage / 100), 120);
      return `min-w-[${scaledWidth}px]`;
    case "rrpmember":
      return "min-w-[120px]";
    case "s-nssai":
      return "min-w-[180px]";
    case "dnn":
      return "min-w-[200px]";
    case "fiveqi":
      return "min-w-[160px]";
    default:
      return "min-w-[150px]";
  }
};

// Additional utility for special shapes that need clip-path
export const getClipPath = (nodeType: string): string => {
  // Removed infinite loop console.log
  switch (nodeType) {
    case "network":         // Rectangle with rounded corners (approximation; adjust radius as needed)
      return "inset(0% round 16px)";
    case "cell-area":
      return "circle(50%)"; // Circle shape
    case "s-nssai":
      return "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"; // Octagon
    case "rrp":
      return "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"; // Pentagon
    case "dnn":
      return "polygon(50% 0%, 100% 50%, 100% 50%, 50%)"; // Diamond
    case "fiveqi":
      return "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"; // Octagon
    default:
      return "none";
  }
};
