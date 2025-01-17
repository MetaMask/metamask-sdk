import { SessionData, StoredSession } from "./types";

/**
 * Gets stored session data from storage
 */
export const getStoredSession = (storageKey: string): StoredSession | null => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as StoredSession;
  } catch (error) {
    console.error('Failed to parse stored session:', error);
    return null;
  }
};

/**
 * Stores session data in storage
 */
export const storeSession = (
  storageKey: string,
  sessionData: SessionData,
  extensionId: string,
): void => {
  try {
    const dataToStore: StoredSession = {
      sessionId: sessionData.sessionId,
      extensionId,
      expiry: sessionData.expiry,
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Failed to store session:', error);
  }
};
