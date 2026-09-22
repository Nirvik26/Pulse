"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Send,
  Bot,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Zap,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useToast } from "@/components/ui/toaster";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  { label: "🎯 Task Breakdown", prompt: "Break down the feature: User Authentication with 2FA and OAuth" },
  { label: "📊 Sprint Health", prompt: "Audit our sprint health and workload velocity" },
  { label: "📋 Daily Standup", prompt: "Generate my daily standup summary based on recent tickets" },
  { label: "⚡ What Next?", prompt: "What should I focus on next to maximize sprint velocity?" },
  { label: "⚡ Shortcuts", prompt: "Show me keyboard shortcuts and productivity tips" },
];

export function ChatBot() {
  const { isCopilotOpen, setCopilotOpen } = useWorkspaceStore();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 Hello! I'm your **Pulse Sprint Copilot**.\n\nI'm connected to your active workspaces to dynamically decompose features into backlog tasks, audit sprint workload & bottlenecks, or draft your daily standup. What can we tackle today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isCopilotOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isCopilotOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message || "I've processed your request.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "⚠️ Unable to reach Pulse Copilot. Please check your connection and try again.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "⚠️ Something went wrong processing your request.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied to clipboard",
      description: "Copilot response copied.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "✨ Chat reset! What project or task shall we explore next?",
        timestamp: new Date(),
      },
    ]);
  };

  // Helper to render basic markdown formatting cleanly
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-bold text-foreground text-xs mt-2.5 mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="font-bold text-foreground text-sm mt-3 mb-1">
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h2 key={idx} className="font-bold text-foreground text-sm mt-3.5 mb-1.5">
            {line.replace("# ", "")}
          </h2>
        );
      }

      // Horizontal rules
      if (line.trim() === "---") {
        return <hr key={idx} className="my-2 border-border/60" />;
      }

      // Parse inline formatting: **bold** and `code`
      const formattedLine = parseInlineMarkdown(line);

      // Bullet points
      if (line.trim().startsWith("• ") || line.trim().startsWith("- ")) {
        return (
          <div key={idx} className="pl-2 py-0.5 leading-relaxed text-xs">
            {formattedLine}
          </div>
        );
      }

      // Empty spacing lines
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="leading-relaxed text-xs">
          {formattedLine}
        </p>
      );
    });
  };

  const parseInlineMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const matchText = match[0];
      if (matchText.startsWith("**") && matchText.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-semibold text-foreground">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith("`") && matchText.endsWith("`")) {
        parts.push(
          <code
            key={match.index}
            className="px-1 py-0.5 rounded bg-muted font-mono text-[11px] text-primary"
          >
            {matchText.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isCopilotOpen && (
        <button
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-5 right-5 h-9 px-3 rounded-full shadow-lg border border-border/80 bg-card/95 backdrop-blur-md hover:bg-secondary text-foreground flex items-center gap-2 text-xs font-medium z-40 transition-all hover:border-primary/50 group"
          title="Open Sprint Copilot"
        >
          <Bot className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Copilot</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isCopilotOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col ${
            isExpanded
              ? "inset-4 md:inset-10 rounded-2xl"
              : "bottom-5 right-5 w-full max-w-[420px] h-[580px] rounded-2xl"
          } bg-card border shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-card text-foreground">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-xs">Sprint Copilot</h3>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono text-emerald-500 border-emerald-500/30">
                    Live
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Clear conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground hidden md:flex"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCopilotOpen(false)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/30 border-b overflow-x-auto no-scrollbar text-xs">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(p.prompt)}
                className="shrink-0 px-2.5 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-[11px] font-medium transition-colors hover:text-primary"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3.5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`flex gap-2.5 w-full ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-6 w-6 mt-0.5 border shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                          <Bot className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs relative group ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/60 border text-foreground"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="space-y-1">
                          {renderFormattedContent(message.content)}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}

                      <div className="flex items-center justify-between mt-1 pt-0.5 text-[9px] text-muted-foreground gap-2">
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.role === "assistant" && (
                          <button
                            type="button"
                            onClick={() => handleCopy(message.id, message.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground flex items-center gap-1"
                            title="Copy response"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-center text-muted-foreground text-xs py-1">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <span className="animate-pulse">Synthesizing workspace intelligence...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-2.5 border-t bg-card flex items-center gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot (e.g. 'Decompose billing feature', 'Audit sprint')..."
              className="flex-1 text-xs h-8 bg-background"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 rounded-lg shrink-0 text-xs shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
