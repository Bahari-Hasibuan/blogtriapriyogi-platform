export function resolveFavicon(domain: string | null, user: string | null) {
  // 1. USER LEVEL (highest priority)
  if (user) {
    return `/assets/favicon/users/${user}.png`;
  }

  // 2. DOMAIN LEVEL
  if (domain) {
    if (domain.includes("triapriyogi.com")) {
      return `/assets/favicon/domains/triapriyogi.png`;
    }
    if (domain.includes("studio")) {
      return `/assets/favicon/domains/studio.png`;
    }
  }

  // 3. DEFAULT SYSTEM (fallback)
  return `/assets/favicon/default/default.png`;
}
