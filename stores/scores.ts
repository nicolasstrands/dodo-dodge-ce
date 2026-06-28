import type { Score } from "~/types/score"

export const useScoreStore = defineStore("useScoreStore", () => {
  const highscores = ref<Score[]>([])
  const personalHighScores = ref<Score[]>([])

  return {
    highscores,
    personalHighScores,
  }
})
