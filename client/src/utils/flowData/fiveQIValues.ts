
// This file is now a facade that re-exports everything from the new files
// for backward compatibility
import { fiveQIValues } from './data/fiveQIData';
import { 
  getRandomFiveQIValue, 
  getFiveQIValueById, 
  getServiceNameFrom5QI 
} from './utils/fiveQIUtils';

// Re-export everything
export {
  fiveQIValues,
  getRandomFiveQIValue,
  getFiveQIValueById,
  getServiceNameFrom5QI
};
