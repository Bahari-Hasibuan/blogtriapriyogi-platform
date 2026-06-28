type EventHandler<T = unknown> = (payload: T) => void

class EventBus {
  private events: Map<string, Set<EventHandler>> = new Map()

  on<T = unknown>(event: string, handler: EventHandler<T>) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }

    this.events.get(event)!.add(handler as EventHandler)

    return () => {
      this.off(event, handler)
    }
  }

  off<T = unknown>(event: string, handler: EventHandler<T>) {
    this.events.get(event)?.delete(handler as EventHandler)
  }

  emit<T = unknown>(event: string, payload?: T) {
    this.events.get(event)?.forEach((handler) => {
      handler(payload)
    })
  }

  clear(event?: string) {
    if (event) {
      this.events.delete(event)
      return
    }

    this.events.clear()
  }
}

export const eventBus = new EventBus()
export default eventBus
