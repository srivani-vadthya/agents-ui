# Nexus AI — Enterprise Multi-Agent Platform

A centralized AI workspace for enterprise teams. Nexus unifies knowledge retrieval, root-cause analysis, code generation, and automatic remediation in a single AI-native interface — built for the way enterprise teams actually work.

## Overview

Nexus AI is a modern, full-stack web application built with cutting-edge technologies to provide an intuitive multi-agent AI platform. The platform features four specialist agents working within a unified workspace, enabling seamless context switching and collaboration.

## 🎯 Key Features

- **Four Specialist Agents**: Each with dedicated surfaces and capabilities
  - **Knowledge Agent**: Intelligent knowledge retrieval and documentation search
  - **Root Cause Agent**: Deep-dive analysis for problem diagnosis
  - **Code Generation Agent**: Automated code creation and suggestions
  - **Auto-Fix Agent**: Intelligent automatic remediation and fixes

- **Unified Workspace**: Switch between agents without losing context
  - Single sidebar navigation
  - Shared composer interface
  - Persistent state management across agent switches

- **Streaming Reasoning**: Real-time token-level streaming with animated steps
  - Live tool execution surfaces
  - Instant feedback and progressive rendering

- **Enterprise-Ready**: Pluggable API layer
  - Connects to private deployments
  - Scalable architecture designed for team collaboration

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.2.0 with TanStack Start (full-stack framework)
- **Routing**: TanStack React Router 1.168.25 with file-based routing
- **State Management**: Zustand 5.0.13 (lightweight store)
- **UI Components**: Radix UI (accessible, unstyled components)
- **Styling**: Tailwind CSS 4.2.1 + custom animations
- **Forms**: React Hook Form 7.71.2 with Zod validation
- **Animations**: Framer Motion 12.39.0
- **Query Management**: TanStack React Query 5.83.0
- **Markdown**: React Markdown with GitHub Flavored Markdown support
- **Icons**: Lucide React 0.575.0
- **Notifications**: Sonner (toast notifications)

### Backend
- **Server**: TanStack React Start (SSR-capable)
- **Deployment**: Cloudflare Workers (via @cloudflare/vite-plugin)
- **Error Handling**: Built-in middleware for graceful error handling

### Development
- **Language**: TypeScript 5.8.3 (96.2% of codebase)
- **Build Tool**: Vite 7.3.1
- **Runtime**: Bun (with bun.lock)
- **Linting**: ESLint 9.32.0
- **Formatting**: Prettier 3.7.3

## 📁 Project Structure

```
agents-ui/
├── src/
│   ├── routes/              # File-based routing
│   │   ├── __root.tsx       # Root layout with error handling
│   │   ├── index.tsx        # Landing page
│   │   └── chat.$agentId.$threadId.tsx  # Chat interface
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   ├── styles.css          # Global styles with Tailwind
│   ├── router.tsx          # Router configuration
│   ├── start.ts            # Server initialization
│   └── server.ts           # Server middleware setup
├── components.json         # Shadcn/ui configuration
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite bundler configuration
├── wrangler.jsonc         # Cloudflare Workers config
└── bunfig.toml           # Bun runtime configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or [Bun](https://bun.sh/)
- npm, yarn, pnpm, or Bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/srivani-vadthya/agents-ui.git
cd agents-ui

# Install dependencies
bun install
# or
npm install
```

### Development

```bash
# Start the development server
bun run dev
# or
npm run dev
```

The application will be available at `http://localhost:5173` by default.

### Building

```bash
# Build for production
bun run build
# or
npm run build

# Build for development environment
bun run build:dev
# or
npm run build:dev

# Preview production build locally
bun run preview
# or
npm run preview
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code with Prettier
npm run format
```

## 🧠 Architecture Highlights

### File-Based Routing
Uses TanStack React Router's file-based routing system:
- `src/routes/__root.tsx`: Root layout with metadata, error boundaries, and global providers
- `src/routes/index.tsx`: Landing page showcasing all four agents
- `src/routes/chat.$agentId.$threadId.tsx`: Dynamic chat interface for agent conversations

### State Management
- **Zustand Store** (`lib/store.ts`): Thread creation, chat state, and agent context
- **React Query**: Server state and API caching
- **Route Context**: Query client injection through TanStack Router

### Error Handling
- Server-side middleware catches and formats errors
- Error boundaries in UI with recovery options
- 404 page with navigation fallback

### Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- **Custom CSS Variables**: Theme colors and design tokens
- **Aurora Background**: Animated gradient backgrounds
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `@tanstack/react-start` | Full-stack React framework with SSR |
| `@tanstack/react-router` | Type-safe client and server routing |
| `zustand` | Lightweight state management |
| `@radix-ui/*` | Accessible component primitives |
| `tailwindcss` | Utility-first CSS framework |
| `framer-motion` | Animation library |
| `react-hook-form` | Form state management |
| `zod` | TypeScript-first schema validation |
| `recharts` | React charting library |
| `sonner` | Toast notification system |

## 🔌 Environment Configuration

The project uses environment variables for configuration. Create a `.env` file in the root directory:

```env
# Cloudflare Workers
VITE_API_URL=your_api_url
```

See `.env.example` (if available) for all required variables.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 👤 Author

**Srivani Vadthya**

- GitHub: [@srivani-vadthya](https://github.com/srivani-vadthya)
- Repository: [agents-ui](https://github.com/srivani-vadthya/agents-ui)

## 🤝 Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests to improve the project.

## 📧 Support

For questions, issues, or suggestions, please open an issue on the [GitHub repository](https://github.com/srivani-vadthya/agents-ui/issues).

---

**Nexus AI — One intelligent workspace. Four specialist agents.**
