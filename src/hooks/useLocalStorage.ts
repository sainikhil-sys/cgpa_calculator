import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error reading localStorage key:", key, error);
    }
    setIsInitialized(true);
  }, [key]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing localStorage key:", key, error);
    }
  }, [key, value, isInitialized]);

  return [value, setValue, isInitialized];
}
