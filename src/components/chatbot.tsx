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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  { label: "🎯 Task Breakdown", prompt: "Break down the feature: User Authentication with 2FA and OAuth" },
  { label: "📊 Sprint Health", prompt: "Give me an audit of my sprint health and workload velocity" },
  { label: "📋 Daily Standup", prompt: "Generate my daily standup summary based on recent tasks" },
  { label: "⚡ Power Shortcuts", prompt: "Show me all keyboard shortcuts and productivity tips" },
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 **Welcome to Pulse AI Copilot 2.0!**\n\nI can decompose project goals into subtasks, audit your sprint health, draft standup reports, and answer workflow questions. How can I assist your productivity today?",
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
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

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
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 p-0 z-40 group transition-all duration-300 hover:scale-105"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col ${
            isExpanded
              ? "inset-4 md:inset-10 rounded-2xl"
              : "bottom-6 right-6 w-full max-w-[420px] h-[600px] rounded-2xl"
          } bg-card/95 backdrop-blur-xl border border-violet-500/30 shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-violet-600 to-purple-700 text-white">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Pulse AI Copilot</h3>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-1.5 py-0">
                    v2.0
                  </Badge>
                </div>
                <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Context-Aware Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                title="Clear conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 hidden md:flex"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-secondary/40 border-b overflow-x-auto no-scrollbar text-xs">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(p.prompt)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-background border hover:border-violet-500 hover:text-violet-500 transition-colors font-medium text-[11px]"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-7 w-7 mt-0.5 border border-violet-500/30 shrink-0">
                      <AvatarFallback className="bg-violet-500/10 text-violet-600 text-xs">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-none shadow-md"
                        : "bg-secondary/70 border rounded-tl-none prose-sm dark:prose-invert"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-[10px] mt-1.5 text-right ${
                        message.role === "user" ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-7 w-7 mt-0.5 border shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 items-center text-muted-foreground text-xs py-2">
                  <div className="h-7 w-7 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <span>Pulse AI is analyzing and generating response...</span>
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
            className="p-3 border-t bg-card/60 flex items-center gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot (e.g. 'Break down payment flow', 'Check sprint health')..."
              className="flex-1 text-sm bg-background/80"
              disabled={isLoading}
            />
            <VoiceInput
              onTranscript={(transcript) => {
                setInput(transcript);
                sendMessage(transcript);
              }}
              className="h-9 w-9 shrink-0"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg shrink-0 h-9 w-9"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
