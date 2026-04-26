# 🚀 GitClarity

> Understand any GitHub repository instantly.

GitClarity is a developer intelligence platform that transforms any GitHub repository into a structured, interactive dashboard. It helps developers quickly understand codebases, analyze activity, and identify meaningful contribution opportunities using AI and visual insights.

---

# 🧠 Why GitClarity Exists

Understanding a new repository is slow and frustrating:

- No clear entry point
- Scattered documentation
- Complex file structures
- Unknown activity level
- No clear contribution path

GitClarity solves this by converting raw GitHub data into **structured intelligence**.

---

# 💡 What GitClarity Does

GitClarity takes a GitHub repository URL and generates:

- 📌 Clear explanation of the project
- 📊 Visual tech stack and activity insights
- 🧭 Guided codebase navigation
- 👥 Contributor analysis
- 🚀 Contribution suggestions
- 💬 AI-powered repository Q&A

---

# 🏗️ System Architecture

<img width="1774" height="887" alt="ChatGPT Image Apr 26, 2026, 02_53_57 PM" src="https://github.com/user-attachments/assets/b92bc978-0af0-435c-af65-e23a3fc15e83" />

---

### Flow:
1. User enters repository URL  
2. Frontend sends request to backend (edge functions)  
3. Backend securely fetches GitHub data  
4. AI processes repository context  
5. Data is structured and sent to frontend  
6. Dashboard renders insights  

---

# ⚙️ Core Features

## 🔍 Repository Overview
Displays:
- Stars, forks, issues
- Description and topics
- Last commit info
- Direct GitHub navigation links

---

## 🧠 AI Repository Summary
- Generated using README + metadata + commits
- Explains:
  - What the project does
  - Technologies used
  - Purpose and scope

---

## 📊 Technology Stack Visualization
- Language distribution chart
- Built using Recharts
- Helps understand tech stack instantly

---

## 📈 Commit Activity Analysis
- Line chart showing commit trends over time
- Identifies active vs inactive projects

---

## ⚡ Activity Insights Card
Provides:
- Commit frequency
- Last commit recency
- Development consistency
- Estimated project activity level

---

## 🗂️ Codebase Structure Analysis
- Detects important files:
  - README.md
  - package.json
  - requirements.txt
- Identifies key directories and structure

---

## 🚀 Start Reading the Code Here
- Suggests entry points:
  - main.py
  - index.js
  - app.js
- Helps developers avoid confusion

---

## 👥 Top Contributors
- Shows top contributors
- Contribution percentages
- Links to GitHub contribution graph

---

## 🔗 Contribution Insights
- Recent commits
- Pull requests
- Good first issues

---

## 📘 How to Contribute
- Extracted setup instructions
- Copyable commands
- Step-by-step contribution flow

---

## 💡 AI Suggested Contribution Ideas
- Beginner-friendly tasks
- Code improvements
- Documentation gaps

---

## 💬 AI Chat Assistant
- Context-aware chatbot
- Answers based only on repository data
- Helps users explore code faster

---

# 🎨 Frontend Tech Stack

- React 18 — Component-based UI
- TypeScript 5 — Type safety
- Vite 5 — Fast build tool
- React Router v6 — Routing system

---

# 💅 Styling & Design System

- Tailwind CSS — Utility-first styling
- shadcn/ui — Accessible UI components
- Radix UI — Headless UI primitives
- Framer Motion — Animations
- Lucide React — Icons

### Typography:
- Space Grotesk — Headings
- Inter — Body text
- JetBrains Mono — Code blocks

---

# 📊 Visualization & UI Enhancements

- Recharts — Charts (language, activity)
- React Markdown — Render AI responses
- CMDK — Command palette
- Embla Carousel — UI carousel
- Sonner — Toast notifications

---

# 🔄 State & Data Management

- TanStack Query — API caching & async state
- React Context API — Global state
  - AuthContext
  - RepoContext
- React Hook Form + Zod — Form validation

---

# ☁️ Backend Architecture

Powered by Lovable Cloud (Supabase-based infrastructure)

### Database (PostgreSQL):
- profiles
- saved_repositories
- analysis_history

### Security:
- Row Level Security (RLS)
- User-specific data isolation

---

# 🔐 Authentication

- Supabase Auth
- Email/Password login
- Google OAuth

---

# ⚡ Edge Functions (Serverless)

## 1. github-proxy
- Fetches GitHub data securely
- Keeps GitHub token hidden
- Handles:
  - repos
  - commits
  - issues
  - contributors
  - file tree

## 2. groq-chat
- Handles AI requests
- Generates:
  - summaries
  - chatbot responses
  - contribution ideas

---

# 🤖 AI Layer

- Lovable AI Gateway
- Supports:
  - Google Gemini
  - OpenAI GPT models

Used for:
- Repository summaries
- Contribution suggestions
- Chat assistant

---

# 🌐 External APIs

- GitHub REST API (proxied via backend)

---

# 🔐 Security Architecture

- API keys stored server-side only
- No client-side exposure
- JWT-based authentication
- HTTPS enforced

---

# 🧪 Testing & Code Quality

- Vitest — Unit testing
- Playwright — End-to-end testing
- ESLint — Code linting
- TypeScript strict mode

---

# 📦 Build & Tooling

- Bun — Package manager
- PostCSS + Autoprefixer — CSS processing
- SWC — Fast compilation

---

# 🚀 Deployment

- Lovable Platform — Hosting & backend
- One-click deployment
- Preview environments

---

# 🎯 Use Cases

- Developers exploring open source
- Students learning real-world code
- Contributors finding beginner issues
- Teams analyzing repositories

---

# 🔮 Future Improvements

- Multi-repo comparison
- Advanced code dependency mapping
- AI code walkthrough mode
- Team collaboration features

---

# 👨‍💻 Author

Atharva Pawar

---

GitClarity is not just a UI tool — it is a system designed to convert raw repository data into structured developer intelligence.
