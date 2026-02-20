import { useState, useCallback } from "react";
import { Lightbulb, List, Sparkles, Loader2 } from "lucide-react";
import { streamIdeas } from "@/lib/stream-ideas";
import { useToast } from "@/hooks/use-toast";

type Mode = "list" | "single";

const Index = () => {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<Mode>("list");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      toast({ title: "Введите тему", description: "Поле темы не может быть пустым", variant: "destructive" });
      return;
    }

    setResult("");
    setIsLoading(true);

    await streamIdeas({
      topic: topic.trim(),
      mode,
      onDelta: (chunk) => setResult((prev) => prev + chunk),
      onDone: () => setIsLoading(false),
      onError: (error) => {
        setIsLoading(false);
        toast({ title: "Ошибка", description: error, variant: "destructive" });
      },
    });
  }, [topic, mode, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-генератор
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight">
            Генератор идей
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Введите тему — получите вдохновение, которое можно использовать
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card space-y-6 border border-border">
          {/* Topic input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Тема</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleGenerate()}
              placeholder="Например: мобильное приложение для студентов"
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow text-base"
            />
          </div>

          {/* Mode toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Режим</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("list")}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                  mode === "list"
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border bg-background hover:border-muted-foreground/30"
                }`}
              >
                <List className={`w-5 h-5 shrink-0 ${mode === "list" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <div className={`text-sm font-medium ${mode === "list" ? "text-primary" : "text-foreground"}`}>
                    Список идей
                  </div>
                  <div className="text-xs text-muted-foreground">5–10 идей по теме</div>
                </div>
              </button>
              <button
                onClick={() => setMode("single")}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                  mode === "single"
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border bg-background hover:border-muted-foreground/30"
                }`}
              >
                <Lightbulb className={`w-5 h-5 shrink-0 ${mode === "single" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <div className={`text-sm font-medium ${mode === "single" ? "text-primary" : "text-foreground"}`}>
                    Одна идея + план
                  </div>
                  <div className="text-xs text-muted-foreground">Идея и 3 шага</div>
                </div>
              </button>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full py-3.5 rounded-xl gradient-warm text-primary-foreground font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Генерирую...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Сгенерировать
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display text-foreground">
                {mode === "list" ? "Ваши идеи" : "Ваша идея"}
              </h2>
            </div>
            <div className="prose prose-stone max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap text-[15px]">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
