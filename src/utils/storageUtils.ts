const STORAGE_UNAVAILABLE_ERROR = 'localStorage is not available in this environment';

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getItem<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) {
    throw new Error(STORAGE_UNAVAILABLE_ERROR);
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }
    throw error;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isLocalStorageAvailable()) {
    throw new Error(STORAGE_UNAVAILABLE_ERROR);
  }
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    throw new Error(
      `Failed to save item to localStorage for key "${key}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function removeItem(key: string): void {
  if (!isLocalStorageAvailable()) {
    throw new Error(STORAGE_UNAVAILABLE_ERROR);
  }
  try {
    localStorage.removeItem(key);
  } catch (error) {
    throw new Error(
      `Failed to remove item from localStorage for key "${key}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function clearAll(): void {
  if (!isLocalStorageAvailable()) {
    throw new Error(STORAGE_UNAVAILABLE_ERROR);
  }
  try {
    localStorage.clear();
  } catch (error) {
    throw new Error(
      `Failed to clear localStorage: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}