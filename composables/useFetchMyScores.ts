import type { Score } from "~/types"

export const useFetchMyScores = async (count: number = 15, email: string) => {
  const { getData } = useIndexedDB()

  let data = (await getData("highScores")) as Score[]

  // sort by highscore
  data = data.sort((a: Score, b: Score) => b.highscore - a.highscore)

  // limit to count
  data = data.slice(0, count)

  return { data }
}
