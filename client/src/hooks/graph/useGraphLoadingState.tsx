
import { useRef, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export const useGraphLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Make sure state and ref stay in sync
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);
  
  // Set loading state while ensuring ref and state are in sync
  const setLoading = useCallback((loading: boolean) => {
    console.log(`Setting loading state to: ${loading ? 'loading' : 'not loading'}`);
    setIsLoading(loading);
    isLoadingRef.current = loading;
    
    if (!loading) {
      // Clear any existing timeout when loading completes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        console.log('Cleared loading timeout as loading completed successfully');
      }
      
      // Dispatch an event to notify the application that loading has completed
      window.dispatchEvent(new CustomEvent('loading-completed'));
    }
  }, []);
  
  // Force reset loading state - useful for recovering from errors or stuck states
  const resetLoadingState = useCallback(() => {
    console.log('Forcibly resetting loading state to false');
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      console.log('Cleared existing timeout during reset');
    }
    
    setIsLoading(false);
    isLoadingRef.current = false;
    
    // Dispatch an event to notify the application that loading has been reset
    window.dispatchEvent(new CustomEvent('loading-reset'));
    
    // ADDED: Force a timeout reset notification to any components listening
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('loading-timeout'));
    }, 100);
  }, []);
  
  // Auto-reset loading state after timeout to prevent getting stuck in loading state
  useEffect(() => {
    // Clear any existing timeout when loading state changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (isLoading) {
      // Set a 20 second timeout to avoid getting stuck (reduced from 30s)
      console.log('Setting 20 second loading timeout');
      timeoutRef.current = setTimeout(() => {
        console.log('Loading timeout reached, auto-resetting loading state');
        setIsLoading(false);
        isLoadingRef.current = false;
        
        // Check for any nodes in DOM after timeout
        const nodesInDOM = document.querySelectorAll('.react-flow__node').length;
        console.log('Nodes in DOM after timeout:', nodesInDOM);
        
        // Only show error toast if no nodes were loaded
        if (nodesInDOM === 0) {
          toast.error('Loading operation timed out. Please try again.');
        } else {
          // If we have nodes, it probably worked despite the timeout
          toast.info('Loading completed, but took longer than expected.');
        }
        
        // Dispatch an event to notify the application that loading has timed out
        window.dispatchEvent(new CustomEvent('loading-timeout'));
      }, 20000); // Reduced from 30s to 20s for better responsiveness
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading]);
  
  // Add a cleanup effect to reset loading state when component unmounts
  useEffect(() => {
    return () => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // This ensures we don't leave the app in a loading state if a component unmounts
      if (isLoadingRef.current) {
        console.log('Component unmounting while still loading, resetting state');
        isLoadingRef.current = false;
      }
    };
  }, []);
  
  return {
    isLoading,
    isLoadingRef,
    setLoading,
    resetLoadingState
  };
};
