import type { AudioPlay, GameObj } from "kaplay"

const eventEmitter = useEventEmitter()

let sessionId = ""

// @ts-ignore
eventEmitter.on("session-created", (session_id: string) => {
  console.log("Session created:", session_id)
  sessionId = session_id
})

eventEmitter.on("reset-game", () => {
  resetGame()
})

const GAME_SCENE = "game"

let FLOOR_HEIGHT = 0
const JUMP_FORCE = 700
let combo = 0
let insanityMode = false
let insanityModeTimer = 15

let playTime = 0

export default function setGameScene(
  mainMenuMusic: AudioPlay,
  gameMusic: AudioPlay,
  version: string,
  floorHeight: number,
  startTime: Date | null,
  score: number,
  mountainWidth: () => number,
  mountainX: () => number
) {
  scene(GAME_SCENE, () =>
    setScene(
      mainMenuMusic,
      gameMusic,
      version,
      floorHeight,
      startTime,
      score,
      mountainWidth,
      mountainX
    )
  )
}

function resetGame() {
  playTime = 0
}

function setScene(
  mainMenuMusic: AudioPlay,
  gameMusic: AudioPlay,
  version: string,
  floorHeight: number,
  startTime: Date | null,
  score: number,
  mountainWidth: () => number,
  mountainX: () => number
) {
  FLOOR_HEIGHT = floorHeight

  eventEmitter.emit("gamestart", {
    score: 0,
    time: 0,
    session_id: null,
    session_event_type: "START",
  })

  let lastEmittedMinute = -1
  startTime = new Date()

  const SHAKE_FACTOR = insanityMode ? 12 : 6

  let jumpCount = 0
  const jump = () => {
    jumpCount++
    if (player.isGrounded()) {
      player.jump(JUMP_FORCE)
    } else {
      player.doubleJump(JUMP_FORCE * 0.8)
    }

    if (player.isJumping()) {
      player.play("jump")
      play("jump")
    }
  }

  gameMusic.paused = false
  gameMusic.volume = 0.25
  gameMusic.loop = true
  mainMenuMusic.paused = true

  setGravity(1100)

  const { versionLabel, scoreLabel, comboLabel } = addHeaderText(
    version,
    score,
    combo,
    insanityMode
  )

  spawnCloud()
  spawnTree()
  spawnEnemy()
  spawnGround()

  spawnMountain(mountainWidth, mountainX)

  const player = spawnDodo()

  player.onCollide("hunter", async (e, col) => {
    if (!col?.isBottom()) {
      if (col?.isLeft()) {
      } else {
        shake(SHAKE_FACTOR)
        play("crow")

        go("gameover")
        eventEmitter.emit("gameover", {
          playername: localStorage.getItem("name"),
          playeremail: localStorage.getItem("email"),
          gameScore: Math.floor(score),
          time: Math.floor(playTime),
          startTime: startTime,
          session_event_type: "END",
          session_id: sessionId,
        })
        gameMusic.stop()
      }
    } else {
      player.jump(JUMP_FORCE * 0.75)
      player.play("jump")
      shake(SHAKE_FACTOR)
      destroy(e)
      eventEmitter.emit("hunter-wrekked", {
        position: player.pos,
        insanityMode,
      })
      combo == 19 ? combo : combo++

      score += insanityMode ? 500 : 100
    }
  })

  player.onGround(() => {
    player.play("walk")
  })

  onKeyPress("space", jump)

  onTouchStart((pos, t) => {
    jump()
  })

  // increment score every frame
  onUpdate(() => {
    score += combo + 1

    playTime += dt()
    scoreLabel.text = `Score: ${Math.floor(score)} / Time: ${Math.floor(
      playTime
    )}`

    comboLabel.text = `Combo: ${insanityMode ? "MAX" : "x" + (combo + 1)}`

    if (combo >= 19 && !insanityMode) {
      insanityMode = true
    }

    if (insanityMode) {
      insanityModeTimer -= dt()
      if (insanityModeTimer <= 0) {
        insanityMode = false
        insanityModeTimer = 15
        combo = 0
      }
    }

    // event emit minuteover after every minute once for one frame
    if (Math.floor(playTime) % 60 === 0 && Math.floor(playTime) !== 0) {
      const currentMinute = Math.floor(playTime / 60)
      // Check if the current minute is different from the last emitted minute
      if (currentMinute !== lastEmittedMinute) {
        eventEmitter.emit("minuteover", {
          score: score,
          time: Math.floor(playTime),
          session_id: sessionId,
          session_event_type: "LOG",
        })
        // Update the last emitted minute
        lastEmittedMinute = currentMinute
      }
    }
  })
}

function addHeaderText(
  version: string,
  score: number,
  combo: number,
  insanityMode: boolean
) {
  const versionLabel = add([
    text(`v${version}`, {
      font: "arcade",
      size: 16,
      align: "right",
      width: width() - 48,
    }),
    pos(24, 24),
    z(100),
    fixed(),
  ])

  const scoreLabel = add([
    text(`Score: ${score}`, {
      font: "arcade",
      size: 24,
      align: "right",
    }),
    pos(24, 24),
    z(100),
    fixed(),
  ])

  const comboLabel = add([
    text(`Combo: ${insanityMode ? "MAX" : "x" + (combo + 1)}`, {
      font: "arcade",
      size: 24,
      align: "right",
    }),
    pos(24, 48),
    z(100),
    fixed(),
  ])

  return { versionLabel, scoreLabel, comboLabel }
}

const spawnDodo = () => {
  const player = add([
    sprite("dodo"),
    pos(width() / 8, height() / 2),
    rotate(0),
    anchor("center"),
    area({ scale: vec2(0.65, 1), offset: vec2(10, 0) }),
    body(),
    doubleJump(1),
    z(10),
    scale(isPlatformMobile() ? 0.6 : 0.75),
  ])

  player.flipX = true

  player.play("walk")

  return player
}

const spawnGround = () => {
  add([
    sprite("ground", {
      tiled: true,
      width: width() * 1.5,
      height: FLOOR_HEIGHT,
      frame: 0,
      anim: "move",
    }),
    area(),
    outline(1),
    pos(0, height() - FLOOR_HEIGHT * 2),
    body({ isStatic: true }),
    z(5),
    scale(0.75),
  ])
}

const spawnCloud = () => {
  const cloud = add([
    sprite("clouds"),
    pos(width() + 100, rand(0, height() / 2)),
    z(4),
    move(LEFT, 30),
    // scale as random number between 0.5 and 0.75
    scale(rand(0.5, 0.75)),
    offscreen({ destroy: true, hide: false }),
    opacity(rand(0.5, 1)),
  ])

  // randomly flip the cloud
  if (Math.random() > 0.5) {
    cloud.flipX = true
  }

  wait(rand(1, 7), spawnCloud)
}

const spawnTree = () => {
  const tree = add([
    sprite("trees", {
      frame: 1,
    }),
    move(LEFT, 60),
    area(),
    pos(width() + 100, height() - FLOOR_HEIGHT * 7), // Adjust position based on index
    z(4),
    offscreen({ destroy: true, hide: false }),
    opacity(1),
  ])

  wait(7, spawnTree)
}

function spawnMountain(mountainWidth: () => number, mountainX: () => number) {
  add([
    sprite("mountains", {
      width: mountainWidth(),
      height: mountainWidth() / 2,
    }),
    pos(mountainX(), height() / 2 - FLOOR_HEIGHT * 1),
    opacity(0.9),
    z(3),
  ])
}

const spawnEnemy = () => {
  const enemyHunterProps: any[] = []

  if (insanityMode) {
    enemyHunterProps.push(
      shader("saturate", () => ({
        u_time: time() % 1,
        u_color: RED,
      }))
    )
  }

  const enemyHunter = add([
    sprite("hunter"),
    pos(width(), height() - FLOOR_HEIGHT * 2 - 16),
    rotate(0),
    area({ scale: vec2(0.7, 1), offset: vec2(25, 0) }),
    anchor("botleft"),
    body(),
    offscreen({ destroy: true, hide: false }),
    move(LEFT, 240), // Keep speed constant
    z(10),
    scale(isPlatformMobile() ? 0.6 : 0.75),
    ...enemyHunterProps,
    "hunter",
  ])

  enemyHunter.flipX = false

  enemyHunter.play("walk")

  // Adjust spawn rate based on time, with a minimum delay to prevent too frequent spawns
  const minSpawnDelay = 1 // Minimum spawn delay in seconds
  const maxSpawnDelay = 7 // Maximum spawn delay at the start of the game
  const timeFactor = 0.007 // Adjust this to control how quickly the spawn rate increases
  const spawnDelay = Math.max(
    minSpawnDelay,
    maxSpawnDelay - timeFactor * Math.floor(playTime)
  )

  enemyHunter.onExitScreen(() => {
    combo = 0
    console.log("Combo reset")
    console.log(combo)
  })

  if (insanityMode) {
    wait(1.5, spawnEnemy)
  } else {
    wait(rand(1, spawnDelay), spawnEnemy)
  }
}
