export default function Navbar() {
      return (
          <nav className="border-b bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <a href="/" className="text-2xl font-bold">
                                  TriApriyogi
                                          </a>

                                                  <div className="flex items-center gap-3">
                                                            <a
                                                                        href="/login"
                                                                                    className="rounded-lg border px-4 py-2"
                                                                                              >
                                                                                                          Login
                                                                                                                    </a>

                                                                                                                              <a
                                                                                                                                          href="/register"
                                                                                                                                                      className="rounded-lg bg-black px-4 py-2 text-white"
                                                                                                                                                                >
                                                                                                                                                                            Mulai Gratis
                                                                                                                                                                                      </a>
                                                                                                                                                                                              </div>
                                                                                                                                                                                                    </div>
                                                                                                                                                                                                        </nav>
                                                                                                                                                                                                          );
}