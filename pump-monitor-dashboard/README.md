# PumpMonitor Dashboard

A production-ready React + TypeScript industrial pump monitoring dashboard built with Vite.

## Features

- **Dashboard Page**: Real-time pump health monitoring with summary cards, vibration and temperature trend charts
- **Pump Details Page**: Detailed view of individual pump specifications, readings, and alert history
- **Alerts Page**: Comprehensive alert management with filtering by severity, type, status, and pump

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **ShadCN UI** components (Radix UI primitives)
- **Recharts** for data visualization
- **React Router** for navigation
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── charts/          # Recharts-based chart components
│   ├── dashboard/       # Dashboard-specific components
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── ui/              # ShadCN-style UI primitives
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/               # Page components
├── services/            # API services (mock data)
└── types/               # TypeScript type definitions
```

## Mock Data

The application uses a mock API service (`src/services/mockApi.ts`) that simulates:

- 5 pumps with different statuses (Normal, Warning, Critical)
- 30 days of historical vibration and temperature data
- Alert system with various severity levels
- Pump specifications and details

## Design

- Dark mode by default
- Industrial/enterprise SaaS aesthetic
- Responsive grid-based layout
- Clean cards with subtle shadows
- Color-coded status indicators
