export function getTenantFromHost(host: string | null) {
  if (!host) return "default";

  // remove port
  const cleanHost = host.split(":")[0];

  // localhost case
  if (cleanHost.includes("localhost")) {
    const parts = cleanHost.split(".");
    return parts[0] || "default";
  }

  // production domain case
  return cleanHost.split(".")[0];
}
