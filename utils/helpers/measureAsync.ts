export async function measureAsync<T>(
  label: string,
  run: () => Promise<T>
): Promise<T> {
  if (!import.meta.dev || typeof performance === "undefined") {
    return run()
  }

  const start = performance.now()
  const result = await run()
  const duration = performance.now() - start
  console.log(`[perf] ${label}: ${duration.toFixed(2)}ms`)
  return result
}
