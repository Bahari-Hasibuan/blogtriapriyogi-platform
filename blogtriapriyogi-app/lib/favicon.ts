export function getFavicon(domain: string | null) {
  if (!domain) return "/assets/favicon/default/favicon.png";

  if (domain.includes("triapriyogi.com")) {
    return "/assets/favicon/domains/triapriyogi.png";
  }

  if (domain.includes("studio.com")) {
    return "/assets/favicon/domains/studio.png";
  }

  return "/assets/favicon/default/favicon.png";
}
