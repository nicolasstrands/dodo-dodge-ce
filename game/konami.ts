import type { KaboomCtx } from "kaplay"

/**
 * Plugin to detect Konami Code in kaboom.js games
 * UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A
 */
export function konamiCodePlugin(k: KaboomCtx) {
  const konamiCode = [
    "up",
    "up",
    "down",
    "down",
    "left",
    "right",
    "left",
    "right",
    "b",
    "a",
  ]
  let lastInput = 0
  let input: string[] = []
  let actions: any = []
  let loop: any = null
  let event: any = null

  function on(action: any) {
    actions.push(action)
    if (!event && actions.length > 0) {
      event = k.onKeyPress((key) => {
        lastInput = k.time()
        input.push(key)
        if (input.slice(-konamiCode.length).join("") === konamiCode.join("")) {
          input = []
          for (const f of actions) f()
        }
      })
      loop = k.loop(1, () => {
        if (input.length > 0 && k.time() - lastInput > 1) {
          input = []
        }
      })
    }
  }

  function off(action: any) {
    actions = actions.filter((f: any) => f !== action)
    if (0 === actions.length && event) {
      event.cancel()
      loop.cancel()
      loop = event = null
    }
  }

  return {
    onKonamiCode(action: any) {
      on(action)
      return {
        cancel: () => off(action),
      }
    },
  }
}
