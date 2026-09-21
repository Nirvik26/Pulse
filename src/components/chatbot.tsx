"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  TrendingUp,
  ListTodo,
} from "lucide-react";
import { VoiceInput } from "./voice-input";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  { label: "Task Breakdown", prompt: "Break down the feature: User Authentication with 2FA and OAuth" },
  { label: "Sprint Health", prompt: "Audit our sprint health and workload velocity" },
  { label: "Daily Standup", prompt: "Generate my daily standup summary based on recent tasks" },
  { label: "Keyboard Shortcuts", prompt: "Show me keyboard shortcuts and productivity tips" },
];

export function ChatBot() {
  const { isCopilotOpen, setCopilotOpen } = useWorkspaceStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your sprint copilot. I can help decompose epics into backlog tasks, audit sprint workload, or draft standup summaries. How can I assist?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
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
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "⚠️ Unable to reach Pulse AI. Please check your network connection and try again.",
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

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Chat reset! How can I assist you with your projects?",
        timestamp: new Date(),
      },
    ]);
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
        </button>
      )}

      {/* Chat Window */}
      {isCopilotOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col ${
            isExpanded
              ? "inset-4 md:inset-10 rounded-2xl"
              : "bottom-5 right-5 w-full max-w-[400px] h-[550px] rounded-2xl"
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
                  <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                    Assistant
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
                className="shrink-0 px-2.5 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-[11px] font-medium transition-colors"
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
                  className={`flex gap-2.5 ${
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
                    className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/70 border text-foreground"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-center text-muted-foreground text-xs py-1">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                  <span>Thinking...</span>
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
              placeholder="Ask Copilot..."
              className="flex-1 text-xs h-8 bg-background"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 rounded-lg shrink-0 text-xs"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
