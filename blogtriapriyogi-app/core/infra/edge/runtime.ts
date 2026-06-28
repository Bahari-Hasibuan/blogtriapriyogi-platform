export function edgeHandler(fn: Function) {
  return async (...args: any[]) => {
    // simulate edge execution layer
    return await fn(...args)
  }
}
