import type { Score } from "~/types"

export default async function useFetchHighScoresAndUpdateStore() {
  const store = useScoreStore()
  const { data } = await useHighScores()
  if (!data) {
    alert("No data found!")
    return
  }

  store.highscores = data
  return store.highscores || ([] as Score[])
}
