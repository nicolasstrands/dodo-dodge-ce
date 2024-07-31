// ~/types/index.d.ts

import type { KaboomCtx } from "kaplay"
import "kaplay/global";

declare module "*.png" {
  const src: string
  export default src
}

declare global {
  const onKonamiCode: KaboomCtx["onKonamiCode"]
}