import { apiKey } from "@/lib/server";
export function GET() {
  return Response.json(
    {
      provider: "xai",
      mode: apiKey().trim()
        ? "live"
        : process.env.AURA_DEMO_MODE === "true"
          ? "demo"
          : "unconfigured",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
