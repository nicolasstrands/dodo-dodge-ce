// ~/types/index.d.ts

import type { KAPLAYCtx } from "kaplay"
import "kaplay/global";

declare module "*.png" {
  const src: string
  export default src
}

declare global {
  const onKonamiCode: KAPLAYCtx["onKonamiCode"]
}