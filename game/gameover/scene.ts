import type { AudioPlay } from "kaplay"

const eventEmitter = useEventEmitter()

const GAMEOVER_SCENE = "gameover"

let gameOverTime = 0
let score = 0

// @ts-ignore
eventEmitter.on("gameover", async ({ gameScore }: { gameScore: number }) => {
  score = gameScore
})

export default async function setGameOverScene(
  mainMenuMusic: AudioPlay,
  gameMusic: AudioPlay
) {
  scene(GAMEOVER_SCENE, () => setScene(mainMenuMusic, gameMusic))
}

function setScene(mainMenuMusic: AudioPlay, gameMusic: AudioPlay) {
  gameMusic.paused = true

  mainMenuMusic.paused = false
  mainMenuMusic.volume = 0.25
  mainMenuMusic.loop = true

  useTimeBasedBG();

  addTitle()
  addGoBackButton()
  addFinalScore(score)
  onKeyPress("escape", () => {
    go("splash")
    eventEmitter.emit("reset-game")
  })

  onUpdate(() => {
    gameOverTime += dt()
  })
}

function addTitle() {
  add([
    text("Game Over", {
      font: "arcade",
      size: 48,
    }),
    pos(width() / 2, 64),
    anchor("center"),
  ])
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
    color(WHITE),
  ])

  button.onClick(() => {
    go("splash")
    eventEmitter.emit("reset-game")
  })
}

function addFinalScore(score: number) {
  add([
    text(`Thanks for playing! Your score: ${Math.floor(score)}`, {
      font: "arcade",
      width: width() / 2,
      align: "center",
      transform: (idx: number, ch: string) => ({
        // make the text blink by changing opacity over time
        opacity: Math.abs(Math.sin(gameOverTime * 2)),
      }),
    }),
    pos(width() / 2, height() / 2 + 32),
    anchor("center"),
  ])
}
