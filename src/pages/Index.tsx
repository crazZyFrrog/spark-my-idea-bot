import { useState, useCallback } from "react";
import { Lightbulb, List, Sparkles, Loader2, Trash2, Clock, Shuffle, Code2, Briefcase, Palette, Microscope, Home } from "lucide-react";
import { streamIdeas } from "@/lib/stream-ideas";
import { useToast } from "@/hooks/use-toast";

type Mode = "list" | "single" | "random";
type Category = "tech" | "business" | "creative" | "science" | "lifestyle";

type HistoryItem = { topic: string; mode: Mode; result: string; category?: Category };

const MODES: { value: Mode; label: string; icon: typeof List; desc: string }[] = [
  { value: "list", label: "Список", icon: List, desc: "5–10 идей" },
  { value: "single", label: "Идея + план", icon: Lightbulb, desc: "1 идея и 3 шага" },
  { value: "random", label: "Рандом", icon: Shuffle, desc: "Случайная тема" },
];

const CATEGORIES: { value: Category; label: string; icon: typeof Code2 }[] = [
  { value: "tech", label: "Технологии", icon: Code2 },
  { value: "business", label: "Бизнес", icon: Briefcase },
  { value: "creative", label: "Творчество", icon: Palette },
  { value: "science", label: "Наука", icon: Microscope },
  { value: "lifestyle", label: "Образ жизни", icon: Home },
];

const Index = () => {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<Mode>("list");
  const [category, setCategory] = useState<Category | null>(null);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    if (mode !== "random" && !topic.trim()) {
      toast({ title: "Введите тему", description: "Поле темы не может быть пустым", variant: "destructive" });
      return;
    }

    setResult("");
    setIsLoading(true);

    let accumulated = "";
    const currentTopic = mode === "random" 
      ? `Рандом${category ? ` (${CATEGORIES.find(c => c.value === category)?.label})` : ""}`
      : topic.trim();

    await streamIdeas({
      ...(mode !== "random" ? { topic: topic.trim() } : {}),
      mode,
      ...(mode === "random" && category ? { category } : {}),
      onDelta: (chunk) => {
        accumulated += chunk;
        setResult((prev) => prev + chunk);
      },
      onDone: () => {
        setIsLoading(false);
        if (accumulated) {
          setHistory((prev) => [{ topic: currentTopic, mode, result: accumulated, category: mode === "random" ? category : undefined }, ...prev].slice(0, 3));
        }
      },
      onError: (error) => {
        setIsLoading(false);
        toast({ title: "Ошибка", description: error, variant: "destructive" });
      },
    });
  }, [topic, mode, category, toast]);

  const resultTitle =
    mode === "list" ? "Ваши идеи" : mode === "random" ? "Случайная идея" : "Ваша идея";

  const historyLabel = (m: Mode) =>
    m === "list" ? "Список" : m === "random" ? "Рандом" : "Идея + план";

  const getCategoryLabel = (cat: Category | undefined) => {
    return CATEGORIES.find(c => c.value === cat)?.label || "";
  };

  return (
    <div className="min-h-screen bg-page flex flex-col items-center px-4 py-12 md:py-20">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <header className="text-center space-y-3 mb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            AI-генератор
          </div>
          <h1 className="text-3xl md:text-4xl font-display text-foreground tracking-tight leading-tight">
            Генератор идей
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
            Введите тему — получите вдохновение
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-card rounded-2xl p-5 md:p-7 shadow-card border border-border space-y-5">
          {/* Mode selector — segmented control */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/60">
            {MODES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Selected mode hint */}
          <p className="text-xs text-muted-foreground text-center -mt-2">
            {MODES.find((m) => m.value === mode)?.desc}
          </p>

          {/* Category selector for random mode */}
          {mode === "random" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Выбери категорию (опционально):</p>
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => setCategory(null)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${
                    category === null
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Любая
                </button>
                {CATEGORIES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setCategory(value)}
                    title={label}
                    className={`py-2 rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                      category === value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] leading-tight text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Topic input */}
          {mode !== "random" && (
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleGenerate()}
                placeholder="Например: мобильное приложение для студентов"
                className="w-full pl-4 pr-4 py-3 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/40 transition-all text-sm"
              />
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || (mode !== "random" && !topic.trim())}
            className="w-full py-3 rounded-xl gradient-warm text-primary-foreground font-semibold text-sm transition-all hover:shadow-soft hover:brightness-105 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Генерирую...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Сгенерировать
              </>
            )}
          </button>
        </div>

        {/* Empty state */}
        {!result && !isLoading && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-2">
            <Lightbulb className="w-8 h-8 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">Здесь появятся ваши идеи</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="h-1 gradient-warm" />
            <div className="p-5 md:p-7">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h2 className="text-base font-display text-foreground">{resultTitle}</h2>
              </div>
              <div className="text-foreground/85 leading-relaxed whitespace-pre-wrap text-sm">
                {result}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">История</span>
              </div>
              <button
                onClick={() => setHistory([])}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Очистить
              </button>
            </div>
            <div className="space-y-2">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl p-4 shadow-card border border-border space-y-1.5 animate-in fade-in duration-300"
                >
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-medium text-foreground truncate">{item.topic}</span>
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium">
                      {historyLabel(item.mode)}
                    </span>
                    {item.category && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium">
                        {getCategoryLabel(item.category)}
                      </span>
                    )}
                  </div>
                  <div className="text-foreground/70 text-xs leading-relaxed whitespace-pre-wrap line-clamp-3">
                    {item.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
