# ⚡ Pulse — High-Velocity Engineering Workspace & AI Copilot

<div align="center">

![Pulse Banner](https://raw.githubusercontent.com/Nirvik26/Pulse/master/public/banner.png)

[![Next.js 14](https://img.shields.io/badge/Next.js-14.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-4.24-green?style=for-the-badge&logo=auth0&logoColor=white)](https://next-auth.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

**An AI-augmented project intelligence platform built for modern engineering teams.**  
*Combines fluid Kanban workflows, deep-work Pomodoro intervals, spotlight command palettes, and real-time velocity analytics.*

[🚀 Explore 1-Click Live Demo](#-live-demo--recruiter-sandbox) • [✨ Key Differentiators](#-what-makes-pulse-different) • [🏗️ Architecture](#️-system-architecture) • [⚡ Quickstart](#-getting-started)

</div>

---

## 🌟 Overview

**Pulse** is a modern SaaS engineering management workspace engineered with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**. It solves the clutter of traditional task trackers by blending **AI-driven task decomposition**, **spotlight keyboard control (`⌘K`)**, **built-in deep work focus tools**, and **instant sprint velocity telemetry**.

Whether you're managing complex sprint roadmaps, coordinating cross-functional milestones, or staying in deep work flow, Pulse brings speed, precision, and visual excellence to every interaction.

---

## 🚀 Live Demo & Recruiter Sandbox

Test the platform instantly with zero setup or registration friction:

- **1-Click Sandbox**: Click **"Try Live Demo"** on the landing page or login page to auto-login as a guest with pre-populated workspaces, tasks, and audit logs.
- **Demo Credentials**:
  - **Email**: `demo@pulse.io`
  - **Password**: `demopassword123`

---

## ✨ What Makes Pulse Different?

### 1. 🧠 Pulse AI Copilot 2.0 & Smart Estimator
- **Goal & Feature Decomposition**: Enter high-level roadmap goals (e.g. *"Build OAuth 2.0 with 2FA and Audit Logs"*), and Pulse AI decomposes them into prioritized, sprint-ready tasks with time estimates.
- **Inline AI Priority & Effort Predictor**: Analyzes task titles in real-time to suggest urgency levels, tags (`#Backend`, `#Security`, `#Bugfix`), and estimated hours.
- **Sprint Health & Workload Audit**: Real-time velocity scoring algorithm that computes project risk ratios, context switching alerts, and completion momentum.
- **Standup Report Generator**: Instantly drafts your daily standup update based on active tickets in your sprint pipeline.

### 2. 🎙️ Web Speech Voice Dictation Engine
- Built-in speech-to-text dictation using the **Web Speech API** with audio pulse indicator for hands-free task creation, spotlight queries, and AI conversations.

### 3. ⚡ Spotlight Command Palette (`⌘K`) & Cheatsheet (`?`)
- Omnipresent search modal allowing power users to navigate projects, search tickets, toggle themes, and trigger sprint actions without taking their hands off the keyboard.
- Press `?` anywhere to open the interactive keyboard shortcut cheatsheet.

### 4. 📋 Interactive Task Detail Drawer & Discussion Threads
- **Granular Subtask Checklist**: Break tasks into actionable checklist items with dynamic percentage progress calculation.
- **Task Discussion Threads**: Threaded comments with timestamps, user avatars, and instant feedback.

### 5. 🎯 Fluid Drag-and-Drop Kanban with Celebration Engine
- Smooth accessible drag-and-drop powered by `@dnd-kit`.
- Optimistic state updates and zero-dependency canvas particle **confetti celebrations** when moving tasks to `Done`.
- Real-time task filtering by keyword, priority, and date range.

### 6. ⏱️ Integrated Pomodoro Focus Timer
- Floating dockable productivity clock (25m Focus / 5m Break) with audio chimes and completed cycle telemetry to encourage deep work.

### 7. 📊 Velocity Analytics & Real-Time Sync Telemetry
- Interactive charts powered by `Recharts` visualizing weekly completion velocity, priority distribution matrices, and pipeline health scores.
- Live database query latency indicator (`Sync: 12ms`).

### 8. 📤 Multi-Format Export Engine
- One-click export of sprint boards to **CSV**, **JSON**, or formatted **Markdown** for instant sharing in team standups or Slack/Discord.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (Next.js 14 Client Layer)"]
        UI[Modern Dashboard & Landing Page]
        CP[⌘K Command Palette]
        Kanban[DND-Kit Kanban Board]
        Timer[Pomodoro Focus Clock]
        Chat[Pulse AI Copilot Interface]
    end

    subgraph Server["Backend (Next.js Route Handlers & Server API)"]
        Auth[NextAuth.js Session & JWT]
        AI_Route[AI Intelligence & Decomposition Engine]
        Task_Route[Task & Project REST Endpoints]
        Export_Route[CSV / JSON Export Streams]
        Demo_Route[1-Click Sandbox Seeder]
    end

    subgraph Data["Persistence Layer"]
        PrismaORM[Prisma Client ORM]
        DB[(SQLite / PostgreSQL DB)]
    end

    UI --> Auth
    CP --> Task_Route
    Kanban --> Task_Route
    Chat --> AI_Route
    Timer --> UI
    UI --> Export_Route
    UI --> Demo_Route

    AI_Route --> PrismaORM
    Task_Route --> PrismaORM
    Demo_Route --> PrismaORM
    Auth --> PrismaORM
    PrismaORM --> DB
```

---

## 📊 Database Schema (ERD Overview)

```mermaid
erDiagram
    USER ||--o{ PROJECT : owns
    USER ||--o{ TASK : manages
    USER ||--o{ ACTIVITY : generates
    USER ||--o{ NOTIFICATION : receives
    PROJECT ||--o{ TASK : contains
    PROJECT ||--o{ COMMENT : has
    TASK ||--o{ COMMENT : contains

    USER {
        string id PK
        string name
        string email UK
        string password
        datetime createdAt
    }

    PROJECT {
        string id PK
        string name
        string description
        string status
        string color
        string userId FK
    }

    TASK {
        string id PK
        string title
        string description
        string status
        string priority
        datetime dueDate
        string projectId FK
        string userId FK
    }

    ACTIVITY {
        string id PK
        string type
        string message
        datetime createdAt
        string userId FK
    }
```

---

## ⌨️ Power-User Keyboard Shortcuts

| Shortcut | Action | Scope |
|---|---|---|
| `⌘K` / `Ctrl+K` | Open Spotlight Command Palette | Global |
| `↑` / `↓` | Navigate Spotlight items | Command Palette |
| `Enter` | Select / Execute item | Command Palette |
| `Esc` | Close modal / dialog | Global |
| `Drag & Drop` | Reorder task status column | Kanban Board |

---

## 🛠️ Tech Stack & Engineering Highlights

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | **Next.js 14 (App Router)** | Server-side rendering, API route handlers, optimized bundle size. |
| **Language** | **TypeScript 5.3** | End-to-end type safety, strict schemas, robust refactoring. |
| **Styling** | **Tailwind CSS + shadcn/ui** | Design system tokenization, dark/light theme switching, glassmorphic UI. |
| **Database & ORM** | **Prisma 5 + SQLite** | Type-safe queries, migration control, zero external cloud DB setup required. |
| **Authentication** | **NextAuth.js v4** | JWT session strategies, encrypted credentials, seamless guest sandboxes. |
| **Interactive UX** | **@dnd-kit + Recharts** | Modern pointer/keyboard drag-and-drop & SVG chart rendering. |

---

## 💻 Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- `pnpm`, `npm`, or `yarn`

### 1. Clone the repository
```bash
git clone git@github.com:Nirvik26/Pulse.git
cd Pulse
```

### 2. Install dependencies
```bash
pnpm install
# or
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-key-here-32-chars-long"
```

### 4. Setup Database
```bash
pnpm db:push
# or
npx prisma db push
```

### 5. Start Development Server
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view Pulse.

---

## 📂 Project Directory Structure

```
Pulse/
├── prisma/
│   ├── schema.prisma         # Prisma data models & relations
│   └── dev.db                # SQLite local database
├── src/
│   ├── app/
│   │   ├── api/              # Route handlers (chat, tasks, projects, demo-login, export)
│   │   ├── dashboard/        # Authenticated workspace routes
│   │   │   ├── activity/     # Audit activity stream
│   │   │   ├── calendar/     # Due date scheduling view
│   │   │   ├── notifications/# Notifications center
│   │   │   ├── projects/     # Kanban board & project manager
│   │   │   └── settings/     # User profile & theme settings
│   │   ├── login/            # Authentication & 1-click sandbox
│   │   ├── register/         # User signup
│   │   ├── globals.css       # Tailwind CSS variables & design tokens
│   │   ├── layout.tsx        # Root HTML layout with providers
│   │   └── page.tsx          # High-converting SaaS landing page
│   ├── components/
│   │   ├── chatbot.tsx       # Pulse AI Copilot 2.0 interface
│   │   ├── command-palette.tsx # Global ⌘K spotlight search
│   │   ├── confetti.tsx      # Canvas celebration particle effect
│   │   ├── focus-timer.tsx   # Pomodoro productivity clock widget
│   │   ├── header.tsx        # Dashboard navigation header
│   │   ├── pulse-mark.tsx    # Animated brand logo mark
│   │   ├── sidebar.tsx       # Collapsible navigation drawer
│   │   └── ui/               # Modular shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Prisma singleton client
│   │   └── utils.ts          # Classname & styling utilities
└── package.json
```

---

## 👨‍💻 Author & Portfolio

**Nirvik**  
- **GitHub**: [@Nirvik26](https://github.com/Nirvik26)
- **Project Repository**: [https://github.com/Nirvik26/Pulse](https://github.com/Nirvik26/Pulse)

*Constructed with passion for clean software architecture, intuitive developer experience, and delightful micro-interactions.*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
