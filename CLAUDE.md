# Service Status Monitor

## Project Overview
A React-based service status monitoring application for multi-instance environments. The application provides real-time monitoring across multiple application instances and their environments with a sleek, modern UI.

## Architecture

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS 4.1 with CSS-based configuration and dark theme
- **State Management**: Zustand (for simple UI state like selected instance/tab)
- **Data Fetching**: TanStack Query (for service health checks with automatic refetching)
- **HTTP Client**: Native fetch (used within TanStack Query for service health checks)
- **Build Tool**: Vite
- **Testing**: Vitest with React Testing Library and MSW
- **Configuration**: c12 (supports JSON/YAML with TypeScript validation)
- **Utilities**: UnJS ecosystem packages (consola, defu, httpxy)

## UI Design System

### Color Palette

```css
/* Primary Background */
bg-slate-900                /* Main background */
bg-slate-800/50            /* Card backgrounds with opacity */
bg-slate-800/30            /* Secondary card backgrounds */

/* Borders */
border-slate-700/50        /* Primary borders with opacity */
border-slate-700/30        /* Secondary borders */
border-slate-600/50        /* Hover state borders */

/* Text Colors */
text-slate-200             /* Primary text */
text-slate-300             /* Secondary text */
text-slate-400             /* Tertiary/helper text */
text-slate-500             /* Muted text */

/* Status Colors */
bg-green-500               /* Operational status */
bg-green-900/30            /* Operational background */
text-green-400             /* Operational text */

bg-yellow-500              /* Degraded status */
bg-yellow-900/30           /* Degraded background */
text-yellow-400            /* Degraded text */

bg-red-500                 /* Outage status */
bg-red-900/30              /* Outage background */
text-red-400               /* Outage text */

bg-gray-500                /* Unknown status */
bg-gray-900/30             /* Unknown background */
text-gray-400              /* Unknown text */

/* Accent Colors */
bg-gradient-to-r from-blue-500 to-purple-600  /* Primary gradient */
bg-blue-600                /* Active tab background */
bg-green-600               /* Active toggle background */
```

### Typography Scale

```css
text-4xl font-bold         /* Main page title */
text-2xl font-semibold     /* Section headers */
text-xl font-bold          /* Metric values */
text-lg font-semibold      /* Card titles, overall status */
text-sm font-medium        /* Service names, buttons */
text-xs                    /* Helper text, timestamps */
```

### Component Specifications

#### Main Layout
```css
min-h-screen bg-slate-900 text-slate-200
max-w-7xl mx-auto px-4 py-8
```

#### Header Section
```css
/* Title */
text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent

/* Description */
text-slate-400
```

#### Tab Navigation
```css
/* Container */
flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50

/* Active Tab */
px-6 py-3 rounded-md font-medium bg-blue-600 text-white shadow-lg transition-all

/* Inactive Tab */
px-6 py-3 rounded-md font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all
```

#### Overall Status Banner
```css
flex items-center justify-center gap-3 mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50
```

#### Control Buttons
```css
/* Primary Button (Refresh) */
flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed

/* Toggle Button Active */
px-6 py-3 font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/25 transition-all

/* Toggle Button Inactive */
px-6 py-3 font-semibold rounded-lg bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 transition-all
```

#### Environment Cards
```css
/* Container */
bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-300

/* Environment Header */
font-semibold text-slate-200        /* Environment name */
text-xs text-slate-400              /* Environment key (DEV, QA, etc.) */

/* Status Badge */
flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium
/* + status-specific background/text colors */
```

#### Service Status Cells
```css
/* Container */
group relative p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer

/* Service Name Row */
flex items-center justify-between mb-2
text-sm font-medium text-slate-300   /* Service name */
text-xs text-slate-500               /* Response time */

/* Uptime Bar */
h-1 bg-slate-700/50 rounded-full overflow-hidden
h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300
```

#### Status Indicators
```css
/* Base */
w-3 h-3 rounded-full           /* Default size */
w-6 h-6 rounded-full           /* Large size for overall status */
w-2 h-2 rounded-full           /* Small size for environment badges */

/* Colors match status color palette above */
```

#### Hover Tooltips
```css
/* Container */
absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap
```

#### Grid Layout
```css
/* Environment Grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6

/* Service Cells within Environment */
space-y-2
```

#### Loading States
```css
/* Spinner */
animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500   /* Large */
animate-spin rounded-full h-4 w-4 border-b-2 border-white       /* Small */
```

### Animation & Interaction Patterns

#### Hover Effects
- Cards: `hover:-translate-y-1 hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/30`
- Buttons: `hover:shadow-lg hover:shadow-{color}-500/25`
- Tabs: `hover:text-slate-200 hover:bg-slate-700/50`

#### Transition Classes
- Default: `transition-all`
- Duration: `duration-300` (for longer animations)
- Opacity: `transition-opacity`

#### Glass-morphism Effects
- Backgrounds: Use opacity variants like `/50`, `/30`
- Borders: Use opacity variants like `/50`, `/30`
- Backdrop effects: Subtle shadows and blurs

### Responsive Breakpoints
```css
/* Grid responsive behavior */
grid-cols-1                    /* Mobile */
md:grid-cols-2                 /* Tablet */
lg:grid-cols-3                 /* Desktop */
xl:grid-cols-4                 /* Large desktop */

/* Button layout */
flex-wrap                      /* Allow wrapping on small screens */
```

### Accessibility Requirements
- Proper contrast ratios (already built into slate color palette)
- Focus states for keyboard navigation
- Semantic HTML structure
- ARIA labels for status indicators
- Screen reader friendly text

## Key Features

1. **Multi-Instance Support**: Switch between application instances via tab navigation
2. **Environment Grid**: Dashboard view showing all environments for selected instance
3. **Real-time Monitoring**: Automatic service health checks with configurable intervals
4. **Status Indicators**: Visual status with operational/degraded/outage states
5. **Responsive Design**: Works across desktop and mobile devices
6. **Hover Tooltips**: Detailed service information on hover

## Configuration Structure
```json
{
  "app": {
    "title": "Service Status Monitor",
    "description": "Real-time monitoring across application instances",
    "refreshInterval": 30000
  },
  "services": [
    {
      "name": "Database",
      "description": "Primary database instance",
      "timeout": 5000,
      "expectedStatus": [200],
      "slowThreshold": 2000,
      "headers": {}
    },
    {
      "name": "Cache",
      "description": "Redis caching layer",
      "timeout": 3000,
      "expectedStatus": [200]
    },
    {
      "name": "API Gateway",
      "description": "Main API routing service",
      "timeout": 5000,
      "expectedStatus": [200, 201]
    }
  ],
  "instances": {
    "primary": {
      "name": "Primary Application",
      "description": "Main production application stack",
      "environments": {
        "dev": {
          "name": "Development",
          "description": "Development environment for testing",
          "services": {
            "Database": { "url": "https://api.primary.dev/health" },
            "Cache": { "url": "https://cache.primary.dev/ping" },
            "API Gateway": { "url": "https://gateway.primary.dev/status" }
          }
        },
        "staging": {
          "name": "Staging",
          "description": "Pre-production environment",
          "services": {
            "Database": { "url": "https://api.primary.staging/health" },
            "Cache": { "url": "https://cache.primary.staging/ping" },
            "API Gateway": { "url": "https://gateway.primary.staging/status" }
          }
        },
        "prod": {
          "name": "Production",
          "description": "Live production environment",
          "services": {
            "Database": { "url": "https://api.primary.com/health" },
            "Cache": { "url": "https://cache.primary.com/ping" },
            "API Gateway": { "url": "https://gateway.primary.com/status" }
          }
        }
      }
    },
    "analytics": {
      "name": "Analytics Platform",
      "description": "Data analytics and reporting services",
      "environments": {
        "dev": {
          "name": "Development",
          "services": {
            "Database": { "url": "https://analytics-db.dev/health" },
            "API Gateway": { "url": "https://analytics-api.dev/status" }
          }
        },
        "prod": {
          "name": "Production",
          "services": {
            "Database": { "url": "https://analytics-db.com/health" },
            "API Gateway": { "url": "https://analytics-api.com/status" }
          }
        }
      }
    }
  }
}
```

## Component Structure
```
src/
├── components/
│   ├── StatusIndicator.tsx       # Visual status dots
│   ├── ServiceStatusCell.tsx     # Individual service status cards
│   ├── EnvironmentColumn.tsx     # Environment grouping component
│   └── StatusMonitor.tsx         # Main dashboard component
├── stores/
│   └── statusStore.ts            # Zustand state management for UI state
├── types/
│   └── index.ts                  # TypeScript interfaces
├── utils/
│   ├── config.ts                 # Configuration helpers (using UnJS utils)
│   └── http.ts                   # TanStack Query setup with native fetch
└── App.tsx                       # Root component
```

## Development Guidelines

### State Management Choice: Zustand

We chose **Zustand** for its simplicity and minimal boilerplate. For this monitoring dashboard, we only need to manage:
- Currently selected instance
- Active tab/environment
- UI preferences (collapsed states, view modes)

Zustand's straightforward API is perfect for these simple UI state needs.

### Data Fetching Choice: TanStack Query + Native Fetch

We chose **TanStack Query** for managing service health checks because it provides:
- **Automatic background refetching**: Essential for real-time monitoring at 30-second intervals
- **Stale-while-revalidate**: Shows cached data instantly while fetching fresh data
- **Smart request deduplication**: Multiple components can request the same health check without duplicate network calls
- **Parallel queries**: Can check all services simultaneously with `useQueries`
- **Built-in retry logic**: Automatic exponential backoff for failed requests
- **Focus refetching**: Updates data when users return to the tab

We use **native fetch** as the HTTP client within TanStack Query for:
- Built-in browser support with no additional dependencies
- Modern AbortSignal.timeout for request cancellation
- Standard web API with excellent TypeScript support
- Lightweight approach without external HTTP client overhead

### UnJS Ecosystem Choices

We selected specific UnJS packages based on the application's needs:

- **c12**: Modern configuration loader that replaced unconfig
  - Supports JSON, YAML, TOML, JSON5 out of the box
  - Better TypeScript support with schema validation
  - Handles config file discovery and merging
- **consola**: Enhanced logging for development
  - Better formatted console output
  - Log levels for debugging health checks
- **httpxy**: Development proxy for CORS
  - Integrated into Vite dev server for automatic CORS handling
  - Automatically proxies all service URLs from config.json
  - Transparent operation - no config changes needed
  - Only active in development mode
- **Native Fetch**: Standard web API
  - Used as the HTTP client within TanStack Query
  - AbortSignal.timeout for request cancellation

### Code Style

- Use functional components with hooks
- Implement TypeScript strictly with proper interfaces
- Follow React best practices for performance
- Use Tailwind utility classes for styling
- Implement proper error boundaries and loading states

### Testing Strategy

- Use Vitest for unit testing
- Test service health check logic
- Test state management
- Test component rendering and interactions
- Mock HTTP requests for reliable testing
- Use msw.io (2.x) for mocking HTTP requests

## API Integration

Services are monitored via HTTP health checks with:

- Configurable timeouts and retry logic
- Support for custom headers and HTTP methods
- Expected status code validation
- Response time tracking
- Error handling and reporting

### CORS Handling in Development

The application includes automatic CORS proxy support for local development:

1. **Automatic Detection**: On startup, Vite reads all service URLs from `config.json`
2. **Proxy Setup**: Each unique host is mapped to a proxy path (e.g., `api.example.com` → `/api/api.example.com/*`)
3. **Transparent Rewriting**: The `checkService` function automatically converts URLs to proxy paths in development
4. **Production Ready**: In production builds, URLs are used as-is without proxying

This means you can use real service URLs in your config without worrying about CORS during development. The proxy is completely transparent and requires no configuration changes.

## Generic Application Instance Model

The application uses a flexible "instance" concept that can represent:

- **Microservices**: Different service clusters
- **Teams**: Team-specific application stacks
- **Products**: Different product lines
- **Regions**: Geographic deployments
- **Customers**: Multi-tenant applications
- **Business Units**: Organizational divisions

Each instance can have:

- Multiple environments (dev, staging, prod, qa, etc.)
- Same or different sets of services
- Different monitoring requirements
- Custom descriptions and metadata

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "c12": "^3.0.0",
    "consola": "^3.0.0",
    "httpxy": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "vite": "^7.0.0",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "msw": "^2.0.0",
    "jsdom": "^26.0.0",
    "changelogen": "^0.6.0"
  }
}
```

## Version Management & Releases

This project uses semantic versioning with automated changelog generation:

### Release Commands
```bash
npm run release          # Patch release (0.1.0 → 0.1.1)
npm run release:patch    # Patch release (0.1.0 → 0.1.1)
npm run release:minor    # Minor release (0.1.0 → 0.2.0)
npm run release:major    # Major release (0.1.0 → 1.0.0)
```

### Release Process
Each release command will:
1. Bump the version in package.json using npm version
2. Generate/update CHANGELOG.md using changelogen
3. Commit the changes with a release tag
4. Push to remote origin with tags

### Changelog Generation
- Uses **changelogen** (UnJS) for automatic changelog generation
- Parses git commits to create structured changelogs
- Generates comparison links between versions
- Follows conventional commit standards

### Git Workflow
- Remote origin: https://github.com/danlourenco/service-status-dashboard.git
- Automatic pushing with `--follow-tags` to include version tags
- Handles initial upstream setup automatically

## Getting Started

1. Initialize project with Vite + React + TypeScript
2. Install preferred state management library (Zustand/Jotai)
3. Set up HTTP client (native fetch/TanStack Query)
4. Install relevant UnJS packages
5. Configure Tailwind CSS with dark theme
6. Set up project structure as outlined above
7. Implement core state management
8. Add service monitoring logic and HTTP health checks
9. Style components following the design system
10. Add configuration file support with flexible instance model
11. Implement responsive design and accessibility features

## Configuration Examples

### Microservices Use Case

```json
{
  "instances": {
    "auth": {
      "name": "Authentication Service",
      "environments": { "dev": {...}, "staging": {...}, "prod": {...} }
    },
    "payments": {
      "name": "Payment Processing",
      "environments": { "dev": {...}, "staging": {...}, "prod": {...} }
    },
    "notifications": {
      "name": "Notification Service",
      "environments": { "dev": {...}, "staging": {...}, "prod": {...} }
    }
  }
}
```

## Future Enhancements

- Historical uptime tracking with unstorage
- Alert notifications integration
- Custom dashboard layouts
- Service dependency mapping
- Performance metrics visualization
- Export/import configurations
- Multi-config support for different teams