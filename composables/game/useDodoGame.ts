import { type Vec2 } from "kaplay";
import { useStorage } from "@vueuse/core";
import {
  MY_SCORES_UPPDATED as MY_SCORES_UPDATED,
  REGISTRATION_SUBMITTED,
  RELOAD_MY_SCORES,
} from "~/game/core/event-names";
import setLeaderboardScene from "~/game/scenes/leaderboard/scene";
import setMyScoresScene from "~/game/scenes/my-scores/scene";
import setRegistrationScene from "~/game/scenes/registration/scene";
import setMainMenuScene from "~/game/scenes/main-menu/scene";
import setGameScene from "~/game/scenes/gameplay/scene";
import setGameOverScene from "~/game/scenes/gameover/scene";
import setIntroScene from "~/game/scenes/intro/scene";

const storedName =
  (import.meta.client &&
    useStorage("name", localStorage.getItem("name"), localStorage)) ||
  ref("");

let sessionId = "";

const eventEmitter = useEventEmitter();
const isDev = import.meta.dev;
const debugLog = (...args: unknown[]) => {
  if (!isDev) {
    return;
  }
  console.log(...args);
};

let areEventBindingsInitialized = false;

const onGameStart = async ({
  score,
  time,
  session_id,
  session_event_type,
}: {
  score: number;
  time: number;
  session_id: string;
  session_event_type: string;
}) => {
  debugLog("gamestart");
  const response = await useAddSessionLog({
    score: Math.floor(score),
    playername: storedName.value as string,
    time,
    session_event_type,
    session_id,
  });

  debugLog("response", response);

  if (response.session_id) {
    sessionId = response.session_id;
    eventEmitter.emit("session-created", response.session_id);
  }
};

const onMinuteOver = async ({
  score,
  time,
  session_id,
  session_event_type,
}: {
  score: number;
  time: number;
  session_id: string;
  session_event_type: string;
}) => {
  debugLog("minuteover");

  const response = await useAddSessionLog({
    score: Math.floor(score),
    playername: storedName.value as string,
    time,
    session_event_type,
    session_id,
  });

  debugLog("response", response);
};

const onGameOver = async ({
  gameScore,
  time,
  startTime,
  session_event_type,
  session_id,
}: {
  gameScore: number;
  time: number;
  startTime: Date;
  session_event_type: string;
  session_id: string;
}) => {
  debugLog(gameScore, time, startTime, session_event_type, session_id);

  score = gameScore;
  const logResponse = await useAddSessionLog({
    score: Math.floor(score),
    playername: storedName.value as string,
    time,
    session_event_type,
    session_id,
  });

  debugLog("response", logResponse);

  if (logResponse.data === "ok") {
    const response = await useAddNewHighScore({
      highscore: Math.floor(score),
      playername: storedName.value as string,
      time,
      startTime,
      session_id,
    });

    debugLog("response", response);

    // reinit session id
    sessionId = "";
  }
};

const onReloadHighscores = async () => {
  debugLog("reloading highscores...");
  const scores = await useFetchHighScoresAndUpdateStore();
  eventEmitter.emit("highscores-updated", scores);
  debugLog("highscores-updated");
};

const onReloadMyScores = async () => {
  debugLog("reloading my scores...");
  const { data: scores, error } = await useFetchMyScoresAndUpdateStore();
  if (error) {
    if (isDev) {
      console.error(error);
    }
    return;
  }
  eventEmitter.emit(MY_SCORES_UPDATED, scores);
  debugLog(MY_SCORES_UPDATED);
};

const onShakeBabyShake = () => {
  pixelShake();
  profanityMod = !profanityMod;
};

const onRegistrationSubmitted = async ({ name }: { name: string }) => {
  debugLog("registration submitted", name);
  storedName.value = name;
  localStorage.setItem("name", name);
  go("splash");
};

const onHunterWrekked = ({
  position,
  insanityMode,
}: {
  position: Vec2;
  insanityMode: boolean;
}) => {
  playRandomHunterOof();
  addAyo(position, insanityMode ? RED : WHITE);
};

let score = 0;

let startTime: Date | null = null;

let profanityMod = false;

const mountainWidth = () => {
  return document.documentElement.clientWidth > 800 ? width() : width() * 2;
};

const mountainX = () => {
  return document.documentElement.clientWidth > 800 ? 0 : -width() / 2;
};

const onResetGame = () => {
  resetGame();
};

const bindEventEmitterListeners = () => {
  if (areEventBindingsInitialized) {
    return;
  }

  eventEmitter.on("gamestart", onGameStart as any);
  eventEmitter.on("minuteover", onMinuteOver as any);
  eventEmitter.on("gameover", onGameOver as any);
  eventEmitter.on("reload-highscores", onReloadHighscores);
  eventEmitter.on(RELOAD_MY_SCORES, onReloadMyScores);
  eventEmitter.on("shake-baby-shake", onShakeBabyShake);
  eventEmitter.on(REGISTRATION_SUBMITTED, onRegistrationSubmitted as any);
  eventEmitter.on("hunter-wrekked", onHunterWrekked as any);
  eventEmitter.on("reset-game", onResetGame);

  areEventBindingsInitialized = true;
};

function resetGame() {
  score = 0;
}

const pixelShake = () => {
  shake(10);

  usePostEffect("pixelate", () => ({
    u_resolution: vec2(width(), height()),
    u_size: wave(2, 16, 30),
  }));

  wait(0.15, () => usePostEffect(""));
};

let lastPlayedSoundIndex = 0;

const playRandomHunterOof = () => {
  let random;
  do {
    random = Math.floor(Math.random() * 5) + 1;
  } while (random === lastPlayedSoundIndex);

  play(`hunter_oof-0${random}`);
  lastPlayedSoundIndex = random;
};

function addAyo(position: Vec2, color = WHITE) {
  let randomWords = [
    "AYO!",
    "FOUF!",
    "TAHI!",
    "DIMAL!",
    "BEBET!",
    "ASSEZ!",
    "MATLO!",
  ];

  if (profanityMod) {
    randomWords = [
      "TA GGT!",
      "KI GGT!",
      "FLSM!",
      "LKSRM!",
      "FALCO!",
      "TA PTN!",
      "TA PLN!",
      "LANGET!",
      ...randomWords,
    ];
  }
  const textOptions = {
    font: "arcade",
    size: isPlatformMobile() ? 50 : 80,
    color,
  };
  const ayo = add([
    text(
      randomWords[Math.floor(Math.random() * randomWords.length)],
      textOptions
    ),
    pos(position.x, position.y),
    scale(0.5),
    z(100),
    move(UP, 100),
    opacity(1),
    anchor("center"),
    lifespan(0.5, { fade: 0.5 }),
  ]);
}

export default function () {
  bindEventEmitterListeners();

  const config = useRuntimeConfig();

  const version = config.public.version;

  volume(0.2);

  const FLOOR_HEIGHT = 48;

  const gameMusic = play("bgm", {
    loop: true,
    paused: true,
  });

  const mainMenuMusic = play("slow_bgm", {
    loop: true,
    paused: true,
  });

  onKeyPress("m", () => (gameMusic.paused = !gameMusic.paused));
  onKeyPress("n", () => (mainMenuMusic.paused = !mainMenuMusic.paused));

  /* Scenes */
  setIntroScene(FLOOR_HEIGHT);

  setLeaderboardScene();

  setRegistrationScene();

  setMyScoresScene();

  setMainMenuScene(mainMenuMusic, gameMusic, version, FLOOR_HEIGHT);

  setGameScene(
    mainMenuMusic,
    gameMusic,
    version,
    FLOOR_HEIGHT,
    startTime,
    score,
    mountainWidth,
    mountainX
  );

  setGameOverScene(mainMenuMusic, gameMusic);

  /* Show intro splash only in development */
  go(import.meta.dev ? "splash" : "splash");
}
