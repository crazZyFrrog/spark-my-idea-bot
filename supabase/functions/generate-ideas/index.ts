import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { topic, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt =
      mode === "random"
        ? `Ты — креативный генератор случайных идей. Придумай одну неожиданную, оригинальную идею из совершенно случайной области (технологии, бизнес, творчество, наука, повседневная жизнь — что угодно). Идея должна быть конкретной, практичной и вдохновляющей. Каждый раз выбирай новую область. Отвечай на русском.
Формат:
**Область:** [случайная область]
**Идея:** [описание в 2-3 предложениях]
**Почему это круто:** [1 предложение]`
        : mode === "list"
          ? `Ты — креативный генератор идей. Пользователь задаёт тему, ты генерируешь от 5 до 10 конкретных, полезных и оригинальных идей по этой теме. Каждая идея должна быть понятной, практичной и вдохновляющей. Отвечай на русском. Формат: пронумерованный список. Каждая идея — 1-2 предложения с кратким пояснением.`
          : `Ты — креативный генератор идей. Пользователь задаёт тему, ты генерируешь ОДНУ сильную, конкретную идею и к ней 3 чётких шага реализации. Идея должна быть практичной и вдохновляющей. Отвечай на русском. Формат:
**Идея:** [описание идеи в 2-3 предложениях]

**Шаги реализации:**
1. [конкретный первый шаг]
2. [конкретный второй шаг]  
3. [конкретный третий шаг]`;

    const userMessage = mode === "random"
      ? "Сгенерируй случайную идею"
      : `Тема: ${topic}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Слишком много запросов, попробуйте позже." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Необходимо пополнить кредиты." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Ошибка AI сервиса" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-ideas error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
