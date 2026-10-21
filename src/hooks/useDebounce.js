import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce fast-changing values (like search inputs)
 * @param {any} value - The input value to debounce
 * @param {number} delay - Delay in milliseconds (default 400ms)
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Start a timer whenever value changes
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel timer if value changes again before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
