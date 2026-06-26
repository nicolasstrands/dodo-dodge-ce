import type { Score } from "~/types"

export const useHighScores = async (count: number = 15) => {
  const { getTopByIndex } = useIndexedDB()

  const data = (await getTopByIndex("highScores", count)) as Score[]

  return { data }
}
