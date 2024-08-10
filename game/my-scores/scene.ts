import type { Score } from "~/types"
import { MY_SCORES_UPPDATED } from "../event-names"

export const MY_SCORE_SCENE_NAME = "my-score"

const eventEmitter = useEventEmitter()

// @ts-expect-error
eventEmitter.on(MY_SCORES_UPPDATED, (scores: Score[]) => {
  showScores(scores)
})

export default async function setMyScoresScene() {
  scene(MY_SCORE_SCENE_NAME, () => setScene())
}

function setScene() {
  useTimeBasedBG();
  addTitle()
  addGoBackButton()
  onKeyPress("escape", () => {
    go("splash")
  })
}

function addTitle() {
  add([
    text("My Scores", {
      font: "arcade",
      size: 48,
    }),
    pos(width() / 2, 64),
    anchor("center"),
  ])
}

function showScores(highscores: Score[] = []) {
  const scores = highscores

  scores.forEach((score, index) => {
    add([
      text(`${index + 1}. ${score.playername} - ${score.highscore}`, {
        font: "arcade",
        size: 24,
      }),
      pos(width() / 2, 128 + index * 32),
      anchor("center"),
    ])
  })
}

function addGoBackButton() {
  const button = add([
    text("Go back or press Esc", {
      font: "arcade",
      size: 24,
    }),
    pos(width() / 2, height() - 64),
    anchor("center"),
    area(),
  ])

  button.onClick(() => {
    go("splash")
  })
}
