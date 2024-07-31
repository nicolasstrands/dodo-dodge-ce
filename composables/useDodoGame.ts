import kaplay, { type Vec2 } from "kaplay"
import { useStorage } from "@vueuse/core"
import {
  MY_SCORES_UPPDATED as MY_SCORES_UPDATED,
  REGISTRATION_SUBMITTED,
  RELOAD_MY_SCORES,
} from "~/game/event-names"
import setLeaderboardScene from "~/game/leaderboard/scene"
import setMyScoresScene from "~/game/my-scores/scene"
import setRegistrationScene from "~/game/registration/scene"
import { konamiCodePlugin } from "../game/konami"
import setMainMenuScene from "../game/main-menu/scene"
import loadSprites from "../game/sprites"
import loadSounds from "../game/sounds"
import setGameScene from "../game/the-game-duh/scene"
import setGameOverScene from "../game/gameover/scene"

const storedName =
  (import.meta.client &&
    useStorage("name", localStorage.getItem("name"), localStorage)) ||
  ref("")
const storedEmail =
  (import.meta.client &&
    useStorage("email", localStorage.getItem("email"), localStorage)) ||
  ref("")

let sessionId = ""

const eventEmitter = useEventEmitter()

// @ts-ignore
eventEmitter.on(
  "gamestart",
  async ({
    score,
    time,
    session_id,
    session_event_type,
  }: {
    score: number
    time: number
    session_id: string
    session_event_type: string
  }) => {
    console.log("gamestart")
    const response = await useAddSessionLog({
      score: Math.floor(score),
      playername: storedName.value as string,
      time,
      session_event_type,
      session_id,
    })

    console.log("response", response)

    if (response.session_id) {
      sessionId = response.session_id
      eventEmitter.emit("session-created", response.session_id)
    }
  }
)

// @ts-ignore
eventEmitter.on(
  "minuteover",
  async ({
    score,
    time,
    session_id,
    session_event_type,
  }: {
    score: number
    time: number
    session_id: string
    session_event_type: string
  }) => {
    console.log("minuteover")

    const response = await useAddSessionLog({
      score: Math.floor(score),
      playername: storedName.value as string,
      time,
      session_event_type,
      session_id,
    })

    console.log("response", response)
  }
)

// @ts-ignore
eventEmitter.on(
  "gameover",
  async ({
    gameScore,
    time,
    startTime,
    session_event_type,
    session_id,
  }: {
    gameScore: number
    time: number
    startTime: Date
    session_event_type: string
    session_id: string
  }) => {
    console.log(gameScore, time, startTime, session_event_type, session_id)

    score = gameScore
    const logResponse = await useAddSessionLog({
      score: Math.floor(score),
      playername: storedName.value as string,
      time,
      session_event_type,
      session_id,
    })

    console.log("response", logResponse)

    if (logResponse.data === "ok") {
      const response = await useAddNewHighScore({
        highscore: Math.floor(score),
        playername: storedName.value as string,
        time,
        startTime,
        session_id,
      })

      console.log("response", response)

      // reinit session id
      sessionId = ""
    }
  }
)

eventEmitter.on("reload-highscores", async () => {
  console.log("reloading highscores...")
  const scores = await useFetchHighScoresAndUpdateStore()
  eventEmitter.emit("highscores-updated", scores)
  console.log("highscores-updated")
})

eventEmitter.on(RELOAD_MY_SCORES, async () => {
  console.log("reloading my scores...")
  const { data: scores, error } = await useFetchMyScoresAndUpdateStore()
  if (error) {
    console.error(error)
    return
  }
  eventEmitter.emit(MY_SCORES_UPDATED, scores)
  console.log(MY_SCORES_UPDATED)
})

eventEmitter.on("shake-baby-shake", () => {
  pixelShake()
  profanityMod = !profanityMod
})

// @ts-ignore
eventEmitter.on(REGISTRATION_SUBMITTED, async ({ name }: { name: string }) => {
  console.log("registration submitted", name)
  storedName.value = name
  localStorage.setItem("name", name)
  go("splash")
})

// @ts-ignore
eventEmitter.on(
  "hunter-wrekked",
  ({ position, insanityMode }: { position: Vec2; insanityMode: boolean }) => {
    playRandomHunterOof()
    addAyo(position, insanityMode ? RED : WHITE)
  }
)

let score = 0

let startTime: Date | null = null

let profanityMod = false

const canvasWidth = () => {
  // if document clientWidth is greater than 800, return 800, else return document clientWidth
  return document.documentElement.clientWidth > 800
    ? 800
    : document.documentElement.clientWidth
}

const canvasHeight = () => {
  return document.documentElement.clientWidth > 800
    ? 800
    : document.documentElement.clientHeight
}

const mountainWidth = () => {
  return document.documentElement.clientWidth > 800 ? width() : width() * 2
}

const mountainX = () => {
  return document.documentElement.clientWidth > 800 ? 0 : -width() / 2
}

eventEmitter.on("reset-game", () => {
  resetGame()
})

function resetGame() {
  score = 0
}

const pixelShake = () => {
  shake(10)

  usePostEffect("pixelate", () => ({
    u_resolution: vec2(width(), height()),
    u_size: wave(2, 16, 30),
  }))

  wait(0.15, () => usePostEffect(""))
}

let lastPlayedSoundIndex = 0

const playRandomHunterOof = () => {
  let random
  do {
    random = Math.floor(Math.random() * 5) + 1
  } while (random === lastPlayedSoundIndex)

  play(`hunter_oof-0${random}`)
  lastPlayedSoundIndex = random
}

function addAyo(position: Vec2, color = WHITE) {
  let randomWords = [
    "AYO!",
    "FOUF!",
    "TAHI!",
    "DIMAL!",
    "BEBET!",
    "ASSEZ!",
    "MATLO!",
  ]

  if (profanityMod) {
    randomWords = [
      "TA GGT!",
      "FLSM!",
      "LKSRM!",
      "FALCO!",
      "TA PTN!",
      "TA PLN!",
      "LANGET!",
      ...randomWords,
    ]
  }
  const textOptions = {
    font: "arcade",
    size: isPlatformMobile() ? 50 : 80,
    color,
  }
  const ayo = add([
    text(
      randomWords[Math.floor(Math.random() * randomWords.length)],
      textOptions
    ),
    pos(position),
    scale(0.5),
    z(100),
    move(UP, 100),
    opacity(1),
    anchor("center"),
    lifespan(0.5, { fade: 0.5 }),
  ])
}

export default function (
  widthOverride: number = canvasWidth(),
  heightOverride: number = canvasHeight(),
  recaptcha: any
) {
  const config = useRuntimeConfig()

  const game = kaplay({
    debug: import.meta.dev ? true : false,
    font: "sans-serif",
    canvas: document.getElementById("game") as HTMLCanvasElement,
    background: [86, 184, 250],
    maxFPS: 25,
    global: true,
    width: widthOverride,
    height: heightOverride,
    pixelDensity: 2,
    plugins: [konamiCodePlugin],
  })

  const version = config.public.version

  volume(0.2)
  loadSounds()

  loadFont("arcade", "fonts/arcadeclassic.ttf", { size: 120 })

  loadShader(
    "saturate",
    undefined,
    `
    uniform float u_time;
    uniform vec2 u_pos;
    uniform vec2 u_size;
    uniform vec3 u_color;

    vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
        vec4 c = def_frag();
      vec4 col = vec4(u_color/255.0, 1);
      return c + vec4(mix(vec3(0), col.rgb, u_time), 0);
    }
  `
  )

  loadShader(
    "pixelate",
    undefined,
    `
    uniform float u_size;
    uniform vec2 u_resolution;

    vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
      if (u_size <= 0.0) return def_frag();
      vec2 nsize = vec2(u_size / u_resolution.x, u_size / u_resolution.y);
      float x = floor(uv.x / nsize.x + 0.5);
      float y = floor(uv.y / nsize.y + 0.5);
      vec4 c = texture2D(tex, vec2(x, y) * nsize);
      return c * color;
    }
    `
  )

  loadSprites()

  const FLOOR_HEIGHT = 48

  const gameMusic = play("bgm", {
    loop: true,
    paused: true,
  })

  const mainMenuMusic = play("slow_bgm", {
    loop: true,
    paused: true,
  })

  onKeyPress("m", () => (gameMusic.paused = !gameMusic.paused))
  onKeyPress("n", () => (mainMenuMusic.paused = !mainMenuMusic.paused))

  /* Scenes */
  setLeaderboardScene()

  setRegistrationScene()

  setMyScoresScene()

  setMainMenuScene(mainMenuMusic, gameMusic, version, FLOOR_HEIGHT)

  setGameScene(
    mainMenuMusic,
    gameMusic,
    version,
    FLOOR_HEIGHT,
    startTime,
    score,
    mountainWidth,
    mountainX
  )

  setGameOverScene(mainMenuMusic, gameMusic)

  /* Init game with splash screen */
  go("splash")

  return game
}
