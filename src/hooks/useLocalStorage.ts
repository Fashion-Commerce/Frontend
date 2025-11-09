/**
 * useLocalStorage Hook
 * Custom hook để sync state với localStorage
 * Theo coding standards - hooks pattern
 */

import { useState, useEffect, useCallback } from "react";

/**
 * Hook để sync state với localStorage
 * @param key - LocalStorage key
 * @param initialValue - Giá trị khởi tạo
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State để lưu giá trị
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Hàm để set value
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Cho phép value là function để update state
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    },
    [key, storedValue],
  );

  // Hàm để xóa value
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
