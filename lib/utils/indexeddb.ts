/**
 * IndexedDB Wrapper Utility
 * Provides a simple interface for IndexedDB operations
 */

export interface IDBConfig {
  name: string;
  version: number;
  stores: IDBStoreConfig[];
}

export interface IDBStoreConfig {
  name: string;
  keyPath: string;
  indexes?: IDBIndexConfig[];
}

export interface IDBIndexConfig {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
}

export class IndexedDBManager {
  private static instance: IndexedDBManager;
  private db: IDBDatabase | null = null;
  private config: IDBConfig;
  private readyPromise: Promise<IDBDatabase>;

  private constructor(config: IDBConfig) {
    this.config = config;
    this.readyPromise = this.init();
  }

  static getInstance(config?: IDBConfig): IndexedDBManager {
    // Check if we're on the server side
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB can only be used in the browser. Make sure to call this only in client components.');
    }

    if (!IndexedDBManager.instance) {
      if (!config) {
        throw new Error('IndexedDB config is required for first initialization');
      }
      IndexedDBManager.instance = new IndexedDBManager(config);
    }
    return IndexedDBManager.instance;
  }

  /**
   * Initialize IndexedDB
   */
  private async init(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      throw new Error('IndexedDB is not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  /**
   * Create stores and indexes
   */
  private createStores(db: IDBDatabase): void {
    this.config.stores.forEach((storeConfig) => {
      // Delete store if it exists (for migration)
      if (db.objectStoreNames.contains(storeConfig.name)) {
        db.deleteObjectStore(storeConfig.name);
      }

      const store = db.createObjectStore(storeConfig.name, {
        keyPath: storeConfig.keyPath,
      });

      // Create indexes
      if (storeConfig.indexes) {
        storeConfig.indexes.forEach((indexConfig) => {
          store.createIndex(indexConfig.name, indexConfig.keyPath, {
            unique: indexConfig.unique || false,
          });
        });
      }
    });
  }

  /**
   * Wait for database to be ready
   */
  async ready(): Promise<IDBDatabase> {
    if (this.db) {
      return Promise.resolve(this.db);
    }
    return this.readyPromise;
  }

  /**
   * Get all items from a store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all from ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Get a single item by key
   */
  async get<T>(storeName: string, key: string | number): Promise<T | undefined> {
    const db = await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get from ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Get items by index
   */
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: string | number
  ): Promise<T[]> {
    const db = await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get by index from ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Add an item
   */
  async add<T>(storeName: string, item: T): Promise<string | number> {
    const db = await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(request.result as string | number);
      };

      request.onerror = () => {
        reject(new Error(`Failed to add to ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Put (add or update) an item
   */
  async put<T>(storeName: string, item: T): Promise<string | number> {
    const db = await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(request.result as string | number);
      };

      request.onerror = () => {
        reject(new Error(`Failed to put to ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Put multiple items in a single transaction
   */
  async putAll<T>(storeName: string, items: T[]): Promise<void> {
    const db = await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      items.forEach((item) => {
        store.put(item);
      });

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error(`Failed to put all to ${storeName}: ${transaction.error}`));
      };
    });
  }

  /**
   * Delete an item by key
   */
  async delete(storeName: string, key: string | number): Promise<void> {
    const db = await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete from ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Clear all items from a store
   */
  async clear(storeName: string): Promise<void> {
    const db = await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Count items in a store
   */
  async count(storeName: string): Promise<number> {
    const db = await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to count ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

