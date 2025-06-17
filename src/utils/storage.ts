const DB_NAME = 'tetris-game';
const STORE_NAME = 'player';
const PLAYER_NAME_KEY = 'playerName';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject('Error opening database');
    
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const getPlayerName = async (): Promise<string | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(PLAYER_NAME_KEY);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error getting player name:', error);
    return null;
  }
};

export const setPlayerName = async (name: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(name, PLAYER_NAME_KEY);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error saving player name');
    });
  } catch (error) {
    console.error('Error setting player name:', error);
    throw error;
  }
};

export const clearPlayerName = async (): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(PLAYER_NAME_KEY);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error clearing player name');
    });
  } catch (error) {
    console.error('Error clearing player name:', error);
    throw error;
  }
};
