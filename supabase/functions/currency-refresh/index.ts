import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const base = url.searchParams.get("base") || "USD";
  const appId = Deno.env.get("OPENEXCHANGE_APP_ID") || "";
  const res = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${appId}&base=${base}`);
  if (!res.ok) return new Response("error", { status: 500 });
  const data = await res.json();
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
});
