export function useIndexedDB() {
  const dbName = "dodoDodgeDB"
  const dbVersion = 1

  const openDB: () => Promise<IDBDatabase> = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion)

      request.onerror = (event) => {
        console.error("Database error:", (event.target as IDBRequest).error)
        reject((event.target as IDBRequest).error)
      }

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as IDBDatabase)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result as IDBDatabase

        if (!db.objectStoreNames.contains("gameLogs")) {
          db.createObjectStore("gameLogs", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("highScores")) {
          db.createObjectStore("highScores", { keyPath: "id" })
        }
      }
    })
  }

  const addData = async (storeName: string, data: any) => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => {
        resolve({ success: true })
      }

      request.onerror = (event) => {
        reject({ success: false, error: (event.target as IDBRequest).error })
      }
    })
  }

  const getData = async (storeName: string) => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result)
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }

  const getDataByProperty = async (
    storeName: string,
    property: string,
    value: string
  ) => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.openCursor()
      const results: any[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest)
          .result as IDBCursorWithValue | null
        if (cursor) {
          if (cursor.value[property] === value) {
            results.push(cursor.value)
          }
          cursor.continue()
        } else {
          resolve(results)
        }
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }
    })
  }

  const clearStore = async (storeName: string) => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => {
        resolve({ success: true })
      }

      request.onerror = (event) => {
        reject({ success: false, error: (event.target as IDBRequest).error })
      }
    })
  }

  return {
    addData,
    getData,
    getDataByProperty,
    clearStore,
  }
}
