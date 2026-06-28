import type { Score } from "~/types/score"
import { selectTopScores } from "~/utils/helpers/topScores"

export const useFetchMyScores = async (count: number = 15, email: string) => {
  const { getDataByProperty } = useIndexedDB()

  const storedScores = (await getDataByProperty(
    "highScores",
    "playeremail",
    email
  )) as Score[] | undefined

  const data = selectTopScores(storedScores ?? [], count)

  return { data }
}
