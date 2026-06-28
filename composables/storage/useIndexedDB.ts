let dbPromise: Promise<IDBDatabase> | null = null

const HIGH_SCORES_STORE = "highScores"
const PLAYER_EMAIL_INDEX = "playeremail"
const HIGH_SCORE_INDEX = "highscore"

export function useIndexedDB() {
  const dbName = "dodoDodgeDB"
  const dbVersion = 2

  const ensureHighScoreIndexes = (store: IDBObjectStore) => {
    if (!store.indexNames.contains(PLAYER_EMAIL_INDEX)) {
      store.createIndex(PLAYER_EMAIL_INDEX, PLAYER_EMAIL_INDEX, {
        unique: false,
      })
    }

    if (!store.indexNames.contains(HIGH_SCORE_INDEX)) {
      store.createIndex(HIGH_SCORE_INDEX, HIGH_SCORE_INDEX, {
        unique: false,
      })
    }
  }

  const openDB: () => Promise<IDBDatabase> = () => {
    if (dbPromise) {
      return dbPromise
    }

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion)

      request.onerror = (event) => {
        console.error("Database error:", (event.target as IDBRequest).error)
        dbPromise = null
        reject((event.target as IDBRequest).error)
      }

      request.onsuccess = (event) => {
        const db = (event.target as IDBRequest).result as IDBDatabase
        db.onclose = () => {
          dbPromise = null
        }
        resolve(db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result as IDBDatabase
        const transaction = (event.target as IDBOpenDBRequest).transaction

        if (!db.objectStoreNames.contains("gameLogs")) {
          db.createObjectStore("gameLogs", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains(HIGH_SCORES_STORE)) {
          const scoreStore = db.createObjectStore(HIGH_SCORES_STORE, {
            keyPath: "id",
          })
          ensureHighScoreIndexes(scoreStore)
        } else if (transaction) {
          const scoreStore = transaction.objectStore(HIGH_SCORES_STORE)
          ensureHighScoreIndexes(scoreStore)
        }
      }
    })

    return dbPromise
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

    if (
      storeName === HIGH_SCORES_STORE &&
      property === PLAYER_EMAIL_INDEX &&
      db
        .transaction([storeName], "readonly")
        .objectStore(storeName)
        .indexNames.contains(property)
    ) {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly")
        const store = transaction.objectStore(storeName)
        const request = store.index(property).getAll(value)

        request.onsuccess = (event) => {
          resolve((event.target as IDBRequest).result)
        }

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error)
        }
      })
    }

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

  const getTopByIndex = async (storeName: string, count: number) => {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)

      if (!store.indexNames.contains(HIGH_SCORE_INDEX)) {
        const request = store.getAll()
        request.onsuccess = (event) => {
          const allData = (event.target as IDBRequest).result as Array<
            Record<string, number>
          >
          const sorted = allData
            .slice()
            .sort((a, b) => (b[HIGH_SCORE_INDEX] || 0) - (a[HIGH_SCORE_INDEX] || 0))
            .slice(0, count)
          resolve(sorted)
        }

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error)
        }
        return
      }

      const index = store.index(HIGH_SCORE_INDEX)
      const request = index.openCursor(null, "prev")
      const results: unknown[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest)
          .result as IDBCursorWithValue | null

        if (cursor && results.length < count) {
          results.push(cursor.value)
          cursor.continue()
          return
        }

        resolve(results)
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
    getTopByIndex,
    clearStore,
  }
}
