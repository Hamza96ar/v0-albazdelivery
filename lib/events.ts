// Simple event emitter for real-time notifications
type EventType = "order_created" | "order_updated" | "order_assigned" | "order_delivered"

type EventListener = (data: any) => void

class EventEmitter {
  private listeners: Map<EventType, Set<EventListener>> = new Map()

  on(event: EventType, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  off(event: EventType, listener: EventListener) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  emit(event: EventType, data: any) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data)
        } catch (error) {
          console.error("[v0] Error in event listener:", error)
        }
      })
    }
    console.log("[v0] Event emitted:", event, data)
  }

  removeAllListeners(event?: EventType) {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

// Singleton instance
export const eventEmitter = new EventEmitter()

// Helper functions to emit common events
export function emitOrderCreated(order: any) {
  eventEmitter.emit("order_created", { order, timestamp: new Date() })
}

export function emitOrderUpdated(order: any) {
  eventEmitter.emit("order_updated", { order, timestamp: new Date() })
}

export function emitOrderAssigned(order: any, driverId: string) {
  eventEmitter.emit("order_assigned", { order, driverId, timestamp: new Date() })
}

export function emitOrderDelivered(order: any) {
  eventEmitter.emit("order_delivered", { order, timestamp: new Date() })
}
