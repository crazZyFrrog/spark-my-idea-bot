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
    <div className="min-h-screen bg-gradient-to-br from-background via-page to-background flex flex-col items-center px-4 py-8 md:py-16">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            AI-генератор идей
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight leading-tight">
            Генератор идей
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Получайте вдохновляющие идеи на любую тему или по случайной категории
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-card rounded-3xl p-8 md:p-10 shadow-lg border border-border/50 space-y-7 backdrop-blur-sm">
          {/* Mode selector — segmented control */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Выберите режим</p>
            <div className="grid grid-cols-3 gap-3">
              {MODES.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`flex flex-col items-center justify-center gap-2.5 py-3.5 px-3 rounded-2xl font-medium transition-all duration-200 ${
                    mode === value
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg scale-105"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-sm leading-tight">{label}</div>
                  <div className="text-xs opacity-75">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Category selector for random mode */}
          {mode === "random" && (
            <div className="space-y-3 pt-2 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Категория (опционально)</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
                <button
                  onClick={() => setCategory(null)}
                  className={`py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    category === null
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  Любая
                </button>
                {CATEGORIES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setCategory(value)}
                    title={label}
                    className={`py-2.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                      category === value
                        ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] leading-tight text-center line-clamp-2">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Topic input */}
          {mode !== "random" && (
            <div className="relative space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Введите тему</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleGenerate()}
                placeholder="Например: мобильное приложение для студентов"
                className="w-full px-4 py-3.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary/60 transition-all text-sm font-medium"
              />
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || (mode !== "random" && !topic.trim())}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-base transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Генерирую идею...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Сгенерировать</span>
              </>
            )}
          </button>
        </div>

        {/* Empty state */}
        {!result && !isLoading && (
          <div className="rounded-3xl border-2 border-dashed border-border/50 p-12 text-center space-y-3 bg-muted/20">
            <Lightbulb className="w-12 h-12 text-muted-foreground/25 mx-auto" />
            <div>
              <p className="text-muted-foreground text-base font-medium">Здесь появятся ваши идеи</p>
              <p className="text-muted-foreground text-xs mt-1.5">Выберите режим и нажмите кнопку выше</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-card rounded-3xl shadow-lg border border-border/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 backdrop-blur-sm">
            <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
            <div className="p-7 md:p-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-display text-foreground">{resultTitle}</h2>
              </div>
              <div className="text-foreground/85 leading-relaxed whitespace-pre-wrap text-base space-y-4">
                {result}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border/30">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold">История</span>
              </div>
              <button
                onClick={() => setHistory([])}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors duration-200 hover:bg-destructive/10 px-2.5 py-1.5 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                Очистить
              </button>
            </div>
            <div className="grid gap-3">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-5 shadow-md border border-border/40 space-y-2.5 animate-in fade-in duration-300 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center gap-2 flex-wrap gap-y-1.5">
                    <span className="font-semibold text-foreground text-sm truncate flex-1">{item.topic}</span>
                    <span className="shrink-0 px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground text-xs font-semibold">
                      {historyLabel(item.mode)}
                    </span>
                    {item.category && (
                      <span className="shrink-0 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-semibold">
                        {getCategoryLabel(item.category)}
                      </span>
                    )}
                  </div>
                  <div className="text-foreground/75 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3 font-medium">
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
