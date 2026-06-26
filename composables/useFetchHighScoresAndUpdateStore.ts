import type { Score } from "~/types"
import { measureAsync } from "~/utils/measureAsync"

export default async function useFetchHighScoresAndUpdateStore() {
  const store = useScoreStore()
  const { data } = await measureAsync("highscores:fetch", async () =>
    useHighScores()
  )
  if (!data) {
    alert("No data found!")
    return
  }

  await measureAsync("highscores:store-update", async () => {
    store.highscores = data
    return null
  })
  return store.highscores || ([] as Score[])
}
