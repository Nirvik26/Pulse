"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  placeholder?: string;
}

export function VoiceInput({ onTranscript, className = "" }: VoiceInputProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onTranscript(transcript);
            toast({
              title: "Voice Dictated",
              description: `"${transcript}"`,
            });
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error !== "no-speech") {
            toast({
              title: "Speech Input Error",
              description: "Could not capture voice audio. Please check microphone permissions.",
              variant: "destructive",
            });
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onTranscript, toast]);

  const toggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Voice Input Unavailable",
        description: "Speech Recognition is not supported by your current browser. Try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        // Handle race conditions
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleListening}
      className={`relative rounded-lg h-8 w-8 transition-colors ${
        isListening
          ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
          : "text-muted-foreground hover:text-foreground"
      } ${className}`}
      title={isListening ? "Listening... (Click to stop)" : "Voice Dictate (Speech-to-Text)"}
    >
      {isListening ? (
        <>
          <Mic className="h-4 w-4 text-rose-500 animate-pulse" />
          <span className="absolute inset-0 rounded-lg bg-rose-500/20 animate-ping pointer-events-none" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
