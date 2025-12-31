import React, { useState, useEffect, useCallback } from 'react';

interface CachedData<T> {
  data: T;
  timestamp: number;
}

interface UseLocalStorageCacheOptions<T> {
  key: string;
  ttl?: number; // Time to live in milliseconds
  defaultValue: T;
}

export const useLocalStorageCache = <T>({
  key,
  ttl = 300000, // 5 minutes default
  defaultValue,
}: UseLocalStorageCacheOptions<T>) => {
  const [data, setData] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed: CachedData<T> = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if (now - parsed.timestamp < ttl) {
          setData(parsed.data);
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn(`Error reading from localStorage (${key}):`, error);
    }
  }, [key, ttl]);

  const updateCache = useCallback(
    (newData: T) => {
      try {
        const cacheItem: CachedData<T> = {
          data: newData,
          timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(cacheItem));
        setData(newData);
      } catch (error) {
        console.warn(`Error writing to localStorage (${key}):`, error);
      }
    },
    [key]
  );

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setData(defaultValue);
    } catch (error) {
      console.warn(`Error clearing localStorage (${key}):`, error);
    }
  }, [key, defaultValue]);

  return { data, updateCache, clearCache, isCached: !!localStorage.getItem(key) };
};

export const useMemoryCache = <T>(ttl: number = 300000) => {
  const cacheRef = React.useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const get = useCallback((key: string): T | null => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > ttl) {
      cacheRef.current.delete(key);
      return null;
    }

    return cached.data;
  }, [ttl]);

  const set = useCallback((key: string, data: T) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  const clear = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  return { get, set, clear };
};
