import { eventBus } from "../../core/events/event-bus"

export function createPost(userId: string, title: string) {
  const post = {
    id: crypto.randomUUID(),
    userId,
    title,
    createdAt: new Date()
  }

  eventBus.emit("POST_CREATED", post)

  return post
}
