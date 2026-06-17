import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const KV_KEY = "polymarket:winner:v1";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kv = (env as any).NEXT_INC_CACHE_KV;
    const val = await kv.get(KV_KEY, "json");
    return Response.json(val ?? null, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json(null, { headers: { "cache-control": "no-store" } });
  }
}
