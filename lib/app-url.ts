export const MAIN_URL =
  process.env.NEXT_PUBLIC_MAIN_URL || "https://triapriyogi.com"

export const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL || "https://studio.triapriyogi.com"

export const LOGIN_URL =
  process.env.NEXT_PUBLIC_LOGIN_URL || `${MAIN_URL}/login`

export const ADMIN_URL = `${STUDIO_URL}/admin`
