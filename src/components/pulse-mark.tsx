"use client";

import React from "react";

export function PulseMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-purple-500 blur-[2px] opacity-80 animate-pulse" />
      
      {/* Brand Icon SVG */}
      <div className="relative h-full w-full rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 p-[1.5px] flex items-center justify-center shadow-lg">
        <div className="h-full w-full rounded-[10px] bg-card/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[60%] w-[60%] text-white drop-shadow"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
