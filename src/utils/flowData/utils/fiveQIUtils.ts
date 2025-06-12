
import { QoSValues } from '@/types/nodeTypes';
import { fiveQIValues } from '../data/fiveQIData';

/**
 * Get a random 5QI value
 * @returns A random QoSValues object
 */
export const getRandomFiveQIValue = (): QoSValues => {
  return fiveQIValues[Math.floor(Math.random() * fiveQIValues.length)];
};

/**
 * Get a specific 5QI value by ID
 * @param id The 5QI ID to look up
 * @returns The QoSValues object for the given ID, or null if not found
 */
export const getFiveQIValueById = (id: string): QoSValues | null => {
  if (!id) {
    console.warn("getFiveQIValueById called with empty ID");
    return null;
  }
  
  console.log(`Looking up 5QI with ID: "${id}"`);
  
  // Normalize the ID to a string for consistent comparison
  const normalizedId = String(id).trim();
  
  // Find the exact match with normalized comparison
  const match = fiveQIValues.find(qos => String(qos.value).trim() === normalizedId);
  
  if (match) {
    console.log(`Found matching 5QI for ID "${id}":`, match);
    // Return a deep copy to avoid reference issues
    const copy = JSON.parse(JSON.stringify(match));
    // Ensure the value is exactly the ID that was requested
    copy.value = normalizedId;
    return copy;
  }
  
  console.warn(`No matching 5QI found for ID "${id}"`);
  return null; // Return null if not found
};

/**
 * Get service name from 5QI value for naming DNN nodes
 * @param fiveQIValue The 5QI value to get the service name for
 * @returns A simplified service name suitable for use as a DNN name
 */
export const getServiceNameFrom5QI = (fiveQIValue?: string): string => {
  if (!fiveQIValue) return 'Unknown Service';
  
  const qos = fiveQIValues.find(q => q.value === fiveQIValue);
  if (!qos) return 'Unknown Service';
  
  // Get the service name and format it for use as a DNN name
  const serviceName = qos.service;
  
  // Extract the main part of the service description (before any commas or special chars)
  let simplifiedName = serviceName.split(',')[0].split('(')[0].trim();
  
  // Convert to lowercase and replace spaces with hyphens
  simplifiedName = simplifiedName.toLowerCase().replace(/\s+/g, '-');
  
  return simplifiedName;
};
