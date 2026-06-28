import type { Score } from "~/types/score"

export function selectTopScores(scores: Score[], count: number): Score[] {
  if (!Array.isArray(scores) || count <= 0) {
    return []
  }

  const topScores: Score[] = []

  for (const score of scores) {
    let insertAt = -1

    for (let i = 0; i < topScores.length; i += 1) {
      const existingScore = topScores[i]
      if (existingScore && score.highscore > existingScore.highscore) {
        insertAt = i
        break
      }
    }

    if (insertAt === -1) {
      if (topScores.length < count) {
        topScores.push(score)
      }
      continue
    }

    topScores.splice(insertAt, 0, score)
    if (topScores.length > count) {
      topScores.length = count
    }
  }

  return topScores
}
