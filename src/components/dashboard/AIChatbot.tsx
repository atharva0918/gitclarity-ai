import { useState, useRef, useEffect } from "react";
import { useRepo } from "@/context/RepoContext";
import { supabase } from "@/integrations/supabase/client";
import { Bot, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const { repoData } = useRepo();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("groq-chat", {
        body: { messages: newMessages, repoContext },
      });
      if (error) throw error;
      setMessages([...newMessages, { role: "assistant", content: data.content || "No response." }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-[380px] max-h-[500px] rounded-xl bg-card border border-border shadow-2xl flex flex-col z-50 slide-in-right overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-heading font-semibold text-sm">GitClarity Assistant</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px]">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center mt-8">
                Ask me anything about <span className="font-mono">{repoData.owner}/{repoData.repo}</span>
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-surface text-foreground"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-invert prose-xs max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-surface">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about this repo..."
                className="flex-1 h-9 px-3 rounded-lg bg-surface border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
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
        </div>
      )}
    </>
  );
}
