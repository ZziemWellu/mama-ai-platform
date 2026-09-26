// A small hand-rolled IndexedDB wrapper — the only operations this needs are add/list/delete on one
// object store, which doesn't justify pulling in the `idb` package as a new dependency. Backs the
// real "queued while offline" state that OfflineSyncIndicator used to fake with a hardcoded number.
const DB_NAME = "mama-ai-offline";
const DB_VERSION = 1;
const STORE_NAME = "queue";

export type QueueKind = "assessment";

export interface QueueItem {
  id: number;
  kind: QueueKind;
  payload: unknown;
  queuedAt: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueue(kind: QueueKind, payload: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({ kind, payload, queuedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPending(): Promise<QueueItem[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as QueueItem[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingCount(): Promise<number> {
  try {
    const items = await getPending();
    return items.length;
  } catch {
    // IndexedDB unavailable (private browsing, blocked storage) — treat as "nothing queued" rather
    // than crash the indicator.
    return 0;
  }
}

export async function removeFromQueue(id: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
