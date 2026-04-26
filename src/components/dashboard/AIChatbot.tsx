import { useState, useRef, useEffect } from "react";
import { useRepo } from "@/context/RepoContext";
import { supabase } from "@/integrations/supabase/client";
import { Bot, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  displayed?: string; // for typing effect
}

interface AIChatbotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIChatbot({ open, onOpenChange }: AIChatbotProps) {
  const { repoData } = useRepo();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!repoData) return null;

  const repoContext = `Repository: ${repoData.metadata.full_name}
Description: ${repoData.metadata.description || "No description"}
Languages: ${Object.keys(repoData.languages).join(", ")}
Stars: ${repoData.metadata.stargazers_count}, Forks: ${repoData.metadata.forks_count}
Top files: ${repoData.tree.slice(0, 30).map((f: any) => f.path).join(", ")}
Contributors: ${repoData.contributors.slice(0, 10).map((c: any) => c.login).join(", ")}
Recent commits: ${repoData.commits.slice(0, 10).map((c: any) => c.commit?.message?.split("\n")[0]).join("; ")}
README (first 3000 chars): ${repoData.readme.slice(0, 3000)}`;

  const typeOut = (fullText: string) => {
    return new Promise<void>((resolve) => {
      let i = 0;
      // Append placeholder message
      setMessages((prev) => [...prev, { role: "assistant", content: fullText, displayed: "" }]);

      const step = () => {
        // Reveal a few chars per tick for snappier feel
        i = Math.min(fullText.length, i + Math.max(2, Math.floor(fullText.length / 400)));
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === "assistant") {
            next[next.length - 1] = { ...last, displayed: fullText.slice(0, i) };
          }
          return next;
        });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        if (i < fullText.length) {
          setTimeout(step, 15);
        } else {
          resolve();
        }
      };
      step();
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("groq-chat", {
        body: {
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          repoContext,
        },
      });
      if (error) throw error;
      const reply = data?.content || "No response.";
      setLoading(false);
      await typeOut(reply);
    } catch {
      setLoading(false);
      await typeOut("Sorry, I couldn't process your request. Please try again.");
    }
  };

  return (
    <>
      {/* Floating open button — only visible when chat is closed */}
      <button
        onClick={() => onOpenChange(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300 z-50 ${
          open ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
        }`}
        aria-label="Open assistant"
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* Side panel — slides in from right, takes 1/4 width */}
      <aside
        className={`fixed top-16 right-0 bottom-0 w-1/4 min-w-[320px] bg-card border-l border-border z-30 flex flex-col transition-transform duration-500 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-heading font-semibold text-sm">GitClarity Assistant</h3>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-8">
              Ask me anything about{" "}
              <span className="font-mono">
                {repoData.owner}/{repoData.repo}
              </span>
            </p>
          )}
          {messages.map((m, i) => {
            const text = m.role === "assistant" ? (m.displayed ?? m.content) : m.content;
            return (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] p-3 rounded-lg text-sm leading-relaxed ${
                    m.role === "user" ? "bg-foreground text-background" : "bg-surface text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none [&_*]:text-sm">
                      <ReactMarkdown>{text}</ReactMarkdown>
                      {m.displayed !== undefined && m.displayed.length < m.content.length && (
                        <span className="inline-block w-1.5 h-4 bg-foreground/70 ml-0.5 align-middle animate-pulse" />
                      )}
                    </div>
                  ) : (
                    text
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-surface">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-border shrink-0">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about this repo..."
              className="flex-1 h-9 px-3 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="h-9 w-9 rounded-lg bg-foreground text-background flex items-center justify-center disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
