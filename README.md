# Service Status Dashboard

A React-based service status monitoring application for multi-instance environments. Provides real-time monitoring across multiple application instances and their environments with a sleek, modern dark UI.

## Features

- **Multi-Instance Support**: Switch between application instances via tab navigation
- **Environment Grid**: Dashboard view showing all environments for selected instance
- **Real-time Monitoring**: Automatic service health checks with configurable intervals
- **Status Indicators**: Visual status with operational/degraded/outage states
- **Responsive Design**: Works across desktop and mobile devices
- **Hover Tooltips**: Detailed service information on hover
- **Dark Theme**: Modern glass-morphism UI with Tailwind CSS 4.1

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4.1 with CSS-based configuration
- **State Management**: Zustand for simple UI state
- **Data Fetching**: TanStack Query with automatic background refetching
- **HTTP Client**: Native fetch API with AbortSignal.timeout
- **Build Tool**: Vite 7
- **Testing**: Vitest with React Testing Library and MSW
- **Configuration**: c12 for JSON/YAML config loading
- **Utilities**: UnJS ecosystem (consola, defu, httpxy)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Configuration

The application uses a flexible configuration system supporting multiple instances:

```json
{
  "app": {
    "title": "Service Status Monitor",
    "refreshInterval": 30000
  },
  "services": [
    {
      "name": "Database",
      "timeout": 5000,
      "expectedStatus": [200]
    }
  ],
  "instances": {
    "primary": {
      "name": "Primary Application",
      "environments": {
        "dev": {
          "name": "Development",
          "services": {
            "Database": { "url": "https://api.dev/health" }
          }
        }
      }
    }
  }
}
```

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run lint             # Lint code
npm run preview          # Preview production build

# Version Management
npm run release          # Patch release (0.1.0 → 0.1.1)
npm run release:minor    # Minor release (0.1.0 → 0.2.0)  
npm run release:major    # Major release (0.1.0 → 1.0.0)
```

## Development

The project follows a modular component architecture:

```
src/
├── components/          # React components
├── stores/             # Zustand state management
├── types/              # TypeScript interfaces
├── utils/              # Configuration and HTTP utilities
└── test/               # Test setup and mocks
```

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and architecture documentation.
