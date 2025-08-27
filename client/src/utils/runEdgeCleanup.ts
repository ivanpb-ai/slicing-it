
import { removeOrphanedEdges } from '../utils/edgeCleanup';

export const runEdgeCleanup = (nodes, edges, setEdges) => {
  const cleanEdges = removeOrphanedEdges(edges, nodes);
  if (cleanEdges.length !== edges.length) {
    setEdges(cleanEdges);
    console.log('Removed', edges.length - cleanEdges.length, 'orphaned edges');
    return edges.length - cleanEdges.length;
  }
  return 0;
};
