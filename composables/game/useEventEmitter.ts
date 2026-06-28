import mitt, { type Emitter, type EventType } from "mitt"

let eventEmitter: Emitter<Record<EventType, unknown>> | undefined

export const useEventEmitter = () => {
  if (!eventEmitter) {
    eventEmitter = mitt()
  }

  return eventEmitter
}
