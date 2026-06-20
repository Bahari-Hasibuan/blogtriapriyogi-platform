import { NextRequest, NextResponse } from "next/server";

const MAIN_DOMAIN = "triapriyogi.com";
const APP_DOMAIN = "studio.triapriyogi.com";

// normalize host (hapus port & protocol noise)
function normalizeHost(host: string) {
  return host
      .replace(/^https?:\/\//, "")
          .replace(":3000", "")
              .replace(":3001", "")
                  .toLowerCase();
                  }

                  function isMainDomain(host: string) {
                    return (
                        host === MAIN_DOMAIN ||
                            host === `www.${MAIN_DOMAIN}`
                              );
                              }

                              function isAppDomain(host: string) {
                                return host === APP_DOMAIN;
                                }

                                export function middleware(req: NextRequest) {
                                  const url = req.nextUrl.clone();
                                    const pathname = url.pathname;

                                      const host = normalizeHost(req.headers.get("host") || "");

                                        // =========================
                                          // 1. SKIP INTERNAL FILES
                                            // =========================
                                              if (
                                                  pathname.startsWith("/_next") ||
                                                      pathname.startsWith("/api") ||
                                                          pathname.includes("favicon.ico") ||
                                                              pathname.includes(".png") ||
                                                                  pathname.includes(".jpg") ||
                                                                      pathname.includes(".svg")
                                                                        ) {
                                                                            return NextResponse.next();
                                                                              }

                                                                                // =========================
                                                                                  // 2. MAIN DOMAIN
                                                                                    // =========================
                                                                                      if (isMainDomain(host)) {
                                                                                          return NextResponse.next();
                                                                                            }

                                                                                              // =========================
                                                                                                // 3. APP DOMAIN (DASHBOARD)
                                                                                                  // =========================
                                                                                                    if (isAppDomain(host)) {
                                                                                                        return NextResponse.next();
                                                                                                          }

                                                                                                            // =========================
                                                                                                              // 4. EXTRACT DOMAIN PARTS
                                                                                                                // =========================
                                                                                                                  const parts = host.split(".");

                                                                                                                    // minimal harus ada domain.tld
                                                                                                                      if (parts.length < 2) {
                                                                                                                          return NextResponse.next();
                                                                                                                            }

                                                                                                                              // =========================
                                                                                                                                // 5. HANDLE WWW CUSTOMER DOMAIN
                                                                                                                                  // =========================
                                                                                                                                    let domain = host;

                                                                                                                                      if (parts[0] === "www") {
                                                                                                                                          domain = parts.slice(1).join(".");
                                                                                                                                            }

                                                                                                                                              // =========================
                                                                                                                                                // 6. RESERVED CHECK (SYSTEM SUBDOMAIN)
                                                                                                                                                  // =========================
                                                                                                                                                    const RESERVED = ["studio", "api", "mail", "ftp"];

                                                                                                                                                      const sub = parts[0];

                                                                                                                                                        if (RESERVED.includes(sub)) {
                                                                                                                                                            return NextResponse.next();
                                                                                                                                                              }

                                                                                                                                                                // =========================
                                                                                                                                                                  // 7. LOOP PROTECTION
                                                                                                                                                                    // =========================
                                                                                                                                                                      if (pathname.startsWith("/site/")) {
                                                                                                                                                                          return NextResponse.next();
                                                                                                                                                                            }

                                                                                                                                                                              // =========================
                                                                                                                                                                                // 8. FINAL SAAS ROUTE
                                                                                                                                                                                  // =========================
                                                                                                                                                                                    url.pathname = `/site/${domain}${pathname}`;

                                                                                                                                                                                      return NextResponse.rewrite(url);
                                                                                                                                                                                      }

                                                                                                                                                                                      export const config = {
                                                                                                                                                                                        matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
                                                                                                                                                                                        }
                                                                                                                  import { NextRequest, NextResponse } from "next/server";
                                                                                                                  import { supabase } from "@/lib/supabase";

                                                                                                                  const MAIN_DOMAIN = "triapriyogi.com";
                                                                                                                  const APP_DOMAIN = "studio.triapriyogi.com";

                                                                                                                  export async function middleware(req: NextRequest) {
                                                                                                                    const url = req.nextUrl.clone();
                                                                                                                      const host = (req.headers.get("host") || "").replace(":3000", "");
                                                                                                                        const pathname = url.pathname;

                                                                                                                          // skip system
                                                                                                                            if (
                                                                                                                                pathname.startsWith("/_next") ||
                                                                                                                                    pathname.startsWith("/api") ||
                                                                                                                                        pathname.includes("favicon.ico")
                                                                                                                                          ) {
                                                                                                                                              return NextResponse.next();
                                                                                                                                                }

                                                                                                                                                  // main domain
                                                                                                                                                    if (host === MAIN_DOMAIN || host === `www.${MAIN_DOMAIN}`) {
                                                                                                                                                        return NextResponse.next();
                                                                                                                                                          }

                                                                                                                                                            // studio
                                                                                                                                                              if (host === APP_DOMAIN) {
                                                                                                                                                                  return NextResponse.next();
                                                                                                                                                                    }

                                                                                                                                                                      // =========================
                                                                                                                                                                        // 🔥 DOMAIN RESOLUTION DB
                                                                                                                                                                          // =========================
                                                                                                                                                                            const { data } = await supabase
                                                                                                                                                                                .from("domains")
                                                                                                                                                                                    .select("site_id")
                                                                                                                                                                                        .eq("domain", host)
                                                                                                                                                                                            .single();

                                                                                                                                                                                              if (data?.site_id) {
                                                                                                                                                                                                  const site = await supabase
                                                                                                                                                                                                        .from("sites")
                                                                                                                                                                                                              .select("slug")
                                                                                                                                                                                                                    .eq("id", data.site_id)
                                                                                                                                                                                                                          .single();

                                                                                                                                                                                                                              if (site.data?.slug) {
                                                                                                                                                                                                                                    url.pathname = `/site/${site.data.slug}${pathname}`;
                                                                                                                                                                                                                                          return NextResponse.rewrite(url);
                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                  // fallback
                                                                                                                                                                                                                                                    return NextResponse.next();
                                                                                                                                                                                                                                                    };