// supabase/functions/analyze-image/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { image } = await req.json().catch(() => ({}));

    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image received" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // TODO — обрабатываешь картинку
    // сейчас просто возвращаем заглушку
    const result = {
      status: "ok",
      message: "Image received",
      length: image.length
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("ERR:", err);

    return new Response(
      JSON.stringify({ error: err.toString() }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
