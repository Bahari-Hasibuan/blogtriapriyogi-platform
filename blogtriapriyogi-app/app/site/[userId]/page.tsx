import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    export default async function Page({ params }: any) {
      const userId = params?.userId;

        // kalau kosong, jangan crash
          if (!userId) {
              return <div>User ID tidak valid</div>;
                }

                  const { data: domains, error } = await supabase
                      .from("site_domains")
                          .select("*")
                              .eq("user_id", userId);

                                if (error) {
                                    return <div>Error load data</div>;
                                      }

                                        return (
                                            <div style={{ padding: 20 }}>
                                                  <h1>Website User: {userId}</h1>

                                                        {domains?.length === 0 && (
                                                                <p>Tidak ada domain</p>
                                                                      )}

                                                                            {domains?.map((d: any) => (
                                                                                    <div key={d.id} style={{ marginBottom: 10 }}>
                                                                                              <h3>{d.hostname}</h3>
                                                                                                        <p>Status: {d.status}</p>
                                                                                                                </div>
                                                                                                                      ))}
                                                                                                                          </div>
                                                                                                                            );
                                                                                                                            }