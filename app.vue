<script setup lang="ts">
import kaplay, { type KAPLAYCtx } from 'kaplay';
import { konamiCodePlugin } from "./game/core/konami"

// Setup SEO with @nuxtjs/seo
useSeoMeta({
  title: "Dodo Dodge - Mauritius-made Runner Game",
  description: "Play Dodo Dodge, a Mauritius-made runner game where you play as a dodo bird. Dodge hunters or stomp on them in this exciting Super Mario Bros-style game.",
  ogType: "website",
  ogImage: "/og-image.png",
  ogTitle: "Dodo Dodge - Mauritius-made Runner Game",
  ogDescription: "Play Dodo Dodge, a Mauritius-made runner game where you play as a dodo bird. Dodge hunters or stomp on them!",
  twitterCard: "summary_large_image",
  twitterTitle: "Dodo Dodge - Mauritius-made Runner Game",
  twitterDescription: "Play Dodo Dodge, a Mauritius-made runner game where you play as a dodo bird. Dodge hunters or stomp on them!",
  twitterImage: "/og-image.png",
  themeColor: "#ff6b6b",
})

// Setup structured data for WebGame
useSchemaOrg([
  {
    "@type": "WebGame",
    "name": "Dodo Dodge",
    "description": "A Mauritius-made runner game where you play as a dodo bird and either dodge hunters or stomp on them.",
    "genre": "Adventure",
    "applicationCategory": "Game",
    "url": "https://dodg.app",
    "image": "/og-image.png",
    "inLanguage": "en-US",
    "publisher": {
      "@type": "Organization",
      "name": "Dodo Dodge"
    },
    "playMode": "SinglePlayer"
  }
])

let game = ref<KAPLAYCtx | null>(null)
const showSplash = ref(true)
const hasStartedGame = ref(false)
let handleOrientationChange: (() => void) | null = null
let handleResize: (() => void) | null = null
let lastViewportWidth = 0
let lastViewportHeight = 0

const KEYBOARD_HEIGHT_DELTA_PX = 120

const isEditableElementFocused = () => {
  if (!import.meta.client) {
    return false
  }

  const active = document.activeElement as HTMLElement | null
  if (!active) {
    return false
  }

  const tag = active.tagName
  return (
    active.isContentEditable ||
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT'
  )
}

const startGame = async () => {
  if (hasStartedGame.value) {
    return
  }

  showSplash.value = false
  await nextTick()

  setupGame()
  useDodoGame()
  hasStartedGame.value = true
}

const updateOrientationPrompt = () => {
  const prompt = document.getElementById('anti-landscape-prompt') as HTMLElement | null
  if (!prompt) {
    return
  }

  if (screen.orientation.angle === 90 || screen.orientation.angle === -90) {
    prompt.style.display = 'flex'
  } else {
    prompt.style.display = 'none'
  }
}

// Function to create or reconfigure the game
const setupGame = () => {
  if (game.value) {
    // Replace the canvas element so the old kaplay instance's async WebGL cleanup
    // targets the detached (old) canvas — not the new one.
    // kaplay's quit() queues a frameEnd callback that calls gl.clear() / gl.bindTexture() etc.
    // If we reuse the same canvas, that callback fires on the next frame and wipes the
    // new context. A fresh canvas element gets a separate WebGL context, so old cleanup
    // is fully isolated from the new instance.
    if (import.meta.client) {
      const oldCanvas = document.getElementById("game") as HTMLCanvasElement | null
      if (oldCanvas?.parentElement) {
        const newCanvas = document.createElement("canvas")
        newCanvas.id = "game"
        oldCanvas.parentElement.replaceChild(newCanvas, oldCanvas)
      }
    }
    game.value = null
    console.log("Game instance destroyed for reconfiguration")
  }
  
  // Create new game instance with updated dimensions
  game.value = kaplay({
      debugKey: 'f1',
      font: "sans-serif",
      canvas: import.meta.client
        ? (document.getElementById("game") as HTMLCanvasElement)
        : undefined,
      background: [0, 0, 0, 0],
      maxFPS: 25,
      global: true,
      width: canvasWidth(),
      height: canvasHeight(),
      pixelDensity: 2,
      plugins: [konamiCodePlugin],
      buttons: {
        jump: {
          keyboard: ['space', 'up', 'w'],
        },
        back: {
          keyboard: ['backspace', 'escape'],
        }
      }
  });
  
  // Asset loaders rely on Kaplay global APIs, so load after context creation.
  loadAssets();
  
  return game.value;
}

onMounted(async () => {
  if (import.meta.dev && isPlatformMobile()) {
    const w = window as Window & { __ERUDA_STARTED__?: boolean }
    if (!w.__ERUDA_STARTED__) {
      const eruda = (await import('eruda')).default
      eruda.init()
      w.__ERUDA_STARTED__ = true
    }
  }

  updateOrientationPrompt()
  lastViewportWidth = window.innerWidth
  lastViewportHeight = window.innerHeight

  // watch for orientation change
  handleOrientationChange = () => {
    updateOrientationPrompt()
    if (
      hasStartedGame.value &&
      screen.orientation.angle !== 90 &&
      screen.orientation.angle !== -90
    ) {
      setupGame();
      useDodoGame();
    }
  }
  window.addEventListener('orientationchange', handleOrientationChange)

  handleResize = debounce(() => {
    const nextWidth = window.innerWidth
    const nextHeight = window.innerHeight

    if (isPlatformMobile() && isEditableElementFocused()) {
      lastViewportWidth = nextWidth
      lastViewportHeight = nextHeight
      return
    }

    const widthChanged = Math.abs(nextWidth - lastViewportWidth) > 1
    const heightDelta = Math.abs(nextHeight - lastViewportHeight)
    const keyboardResizeLikely =
      isPlatformMobile() &&
      !widthChanged &&
      heightDelta >= KEYBOARD_HEIGHT_DELTA_PX &&
      isEditableElementFocused()

    lastViewportWidth = nextWidth
    lastViewportHeight = nextHeight

    if (keyboardResizeLikely) {
      return
    }

    // Reinitializing kaplay on resize corrupts font texture atlases and causes
    // other rendering artifacts. The canvas keeps its initialized dimensions;
    // mobile layout is handled by the orientationchange handler above.
  }, 500)

  // watch for resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (handleOrientationChange) {
    window.removeEventListener('orientationchange', handleOrientationChange)
    handleOrientationChange = null
  }

  if (handleResize) {
    window.removeEventListener('resize', handleResize)
    handleResize = null
  }

  if (game.value) {
    try {
      game.value.quit()
    } catch (_) {
      // ignore errors during cleanup
    }
    game.value = null;
    console.log("Game destroyed");
  }
})

</script>

<template>
  <div>
    <div class="wrapper">
      <div class="frame">
        <button
          v-if="showSplash"
          class="splash"
          type="button"
          aria-label="load game"
          @click="startGame"
        >
          <img src="/dodo-dodge-artwork.jpg" alt="Dodo Dodge splash artwork" />
          <span class="splash-cta">Load Game</span>
        </button>
        <canvas id="game"></canvas>
        <div id="anti-landscape-prompt" class="space-y-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><g fill="none"><path fill="white" d="m18.444 19.122l.53.53zm-8.14 0l.53-.53zm8.818-8.818l-.53.53zm0 8.14l-.53-.53zM22 14.374h.75zM5.556 4.878l.53.53zm8.14 0l.53-.53zM9.626 2v.75zM4.878 5.556l-.53-.53zm0 8.14l-.53.53zM2 9.626h-.75zm7.478-3.54a.75.75 0 0 0-1.06-1.06zM5.026 8.418a.75.75 0 1 0 1.06 1.061zm13.27 0a.75.75 0 1 0-1.06 1.061zm-3.774-1.652a.75.75 0 0 0 1.06-1.06zm-9.114-.679l.678-.678l-1.06-1.06l-.679.678zm13.184 11.828l-.678.678l1.06 1.06l.678-.678zm-7.757.678l-5.427-5.427l-1.06 1.061l5.426 5.426zm7.079 0c-.975.974-1.653 1.65-2.232 2.092c-.562.429-.942.566-1.308.566v1.5c.826 0 1.522-.343 2.217-.873c.678-.517 1.439-1.28 2.383-2.224zm-8.14 1.06c.944.945 1.705 1.707 2.383 2.225c.695.53 1.391.873 2.217.873v-1.5c-.366 0-.745-.137-1.308-.566c-.579-.442-1.257-1.118-2.231-2.092zm8.818-8.817c.974.974 1.65 1.652 2.092 2.231c.429.563.566.942.566 1.308h1.5c0-.826-.343-1.522-.873-2.217c-.517-.678-1.28-1.439-2.224-2.383zm1.06 8.14c.945-.945 1.707-1.706 2.225-2.384c.53-.695.873-1.391.873-2.217h-1.5c0 .366-.137.746-.566 1.308c-.442.579-1.118 1.257-2.092 2.232zM6.086 5.407c.975-.974 1.653-1.65 2.232-2.092c.562-.429.942-.566 1.308-.566v-1.5c-.826 0-1.522.343-2.217.873c-.679.518-1.439 1.28-2.383 2.224zm8.14-1.06c-.944-.945-1.705-1.707-2.383-2.225c-.695-.53-1.391-.873-2.217-.873v1.5c.366 0 .745.137 1.308.566c.579.442 1.257 1.118 2.231 2.092zm-9.879.678c-.944.944-1.706 1.704-2.224 2.383c-.53.695-.873 1.391-.873 2.217h1.5c0-.366.137-.746.566-1.308c.442-.579 1.118-1.257 2.092-2.232zm1.061 8.14c-.974-.975-1.65-1.653-2.092-2.232c-.429-.562-.566-.942-.566-1.308h-1.5c0 .826.343 1.522.873 2.217c.518.678 1.28 1.439 2.224 2.383zm3.01-8.14L5.025 8.417l1.06 1.061l3.392-3.391zm7.8 10.218a.689.689 0 0 1 0 .974l1.06 1.06a2.189 2.189 0 0 0 0-3.095zm0 .974a.689.689 0 0 1-.974 0l-1.061 1.06c.855.856 2.24.856 3.096 0zm-.974 0a.689.689 0 0 1 0-.974l-1.061-1.06a2.189 2.189 0 0 0 0 3.095zm0-.974a.689.689 0 0 1 .974 0l1.06-1.06a2.189 2.189 0 0 0-3.095 0zm1.991-5.766l1.357 1.357l1.06-1.061l-1.356-1.357zm-4.07-4.07l1.357 1.357l1.06-1.06l-1.356-1.358z"/><path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.5 6.986L22 8c0-3.015-2.162-5.517-5-6M3.5 17.014L2 16c0 3.015 2.162 5.517 5 6"/></g></svg>
          <p>Nice try! 😏<br>now go back to portrait mode</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash {
  position: absolute;
  inset: 0;
  z-index: 90;
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  margin: 0;
  background: #0f172a;
  cursor: pointer;

  @media (min-width: 1025px) {
    inset: auto;
    top: 50%;
    left: 50%;
    width: min(100%, 800px);
    height: min(100%, 800px);
    transform: translate(-50%, -50%);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
  }

  .splash-cta {
    position: absolute;
    left: 50%;
    bottom: clamp(16px, 6vh, 56px);
    transform: translateX(-50%);
    font-family: "ArcadeClassic", sans-serif;
    font-size: 24px;
    font-weight: 400;
    line-height: 1;
    font-kerning: none;
    font-feature-settings: "kern" 0;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: none;
    text-shadow: 0 1px 0 rgba(15, 23, 42, 0.55);
    text-transform: uppercase;
    color: #f8fafc;
    background: linear-gradient(90deg, rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.3));
    padding: 10px 18px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.45);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.55);
    animation: pulse-start 1.4s ease-in-out infinite;
    pointer-events: none;
  }

  @media (max-width: 900px) {
    .splash-cta {
      font-size: 22px;
      padding: 11px 18px;
      bottom: 88px;
    }
  }

  @media (max-width: 560px) {
    .splash-cta {
      font-size: 18px;
      padding: 10px 16px;
      bottom: max(110px, calc(env(safe-area-inset-bottom) + 36px));
    }
  }
}

#anti-landscape-prompt, #anti-devtools {
  display: none;
  position: absolute;
  top: 0%;
  left: 0%;
  background-color: rgba(0, 0, 0, 1);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 20px;
  z-index: 100;
  transition: all ease-in-out 0.5s;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  
  svg {
    animation: shake 1.5s infinite;
  }

  p {
    text-align: center;
  
  }
}

@keyframes shake {
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(10deg);
  }
  20% {
    transform: rotate(-10deg);
  }
  30% {
    transform: rotate(10deg);
  }
  40% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes pulse-start {
  0% {
    transform: translateX(-50%) scale(1);
    opacity: 0.9;
  }
  50% {
    transform: translateX(-50%) scale(1.04);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.9;
  }
}
</style>
