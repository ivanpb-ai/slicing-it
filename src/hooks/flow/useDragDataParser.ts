
export const parseDragData = (dragDataString: string) => {
  console.log('parseDragData: Processing drag data:', dragDataString);
  
  try {
    // Try to parse as JSON first
    const parsedData = JSON.parse(dragDataString);
    
    if (parsedData && parsedData.type) {
      console.log('parseDragData: Successfully parsed JSON drag data:', parsedData);
      return {
        nodeType: parsedData.type,
        fiveQIId: parsedData.fiveQIId
      };
    }
  } catch (error) {
    console.log('parseDragData: Not JSON format, trying string parsing');
  }
  
  // Handle 5qi:ID format
  if (dragDataString.includes('5qi:')) {
    const parts = dragDataString.split(':');
    if (parts.length >= 2) {
      const fiveQIId = parts[1];
      console.log('parseDragData: Parsed 5QI format - ID:', fiveQIId);
      return {
        nodeType: '5qi',
        fiveQIId: fiveQIId
      };
    }
  }
  
  // Handle other node types with : separator
  if (dragDataString.includes(':')) {
    const parts = dragDataString.split(':');
    if (parts.length >= 2) {
      console.log('parseDragData: Parsed general format:', parts[0], parts[1]);
      return {
        nodeType: parts[0],
        fiveQIId: parts[1]
      };
    }
  }
  
  // Simple node type only
  console.log('parseDragData: Using simple node type:', dragDataString);
  return {
    nodeType: dragDataString,
    fiveQIId: undefined
  };
};
