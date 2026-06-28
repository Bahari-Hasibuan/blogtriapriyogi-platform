export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

export function fail(message: string): ApiResponse<null> {
  return { success: false, error: message }
}
