# SentimentAI - AI-Powered Market Research Platform

## Overview

SentimentAI is a comprehensive market research and sentiment analysis platform that uses AI agents to monitor brand mentions across the web, analyze sentiment, and provide actionable insights. The application features a multi-agent system that crawls web sources, analyzes sentiment using OpenAI, and generates detailed reports for businesses to understand their brand perception.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom crypto-themed color palette
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Theme**: Dark mode design with custom CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **AI Integration**: OpenAI GPT-4o for sentiment analysis and insights

### Database Design
- **Primary Database**: PostgreSQL (Neon serverless)
- **Session Storage**: PostgreSQL table for secure session management
- **Schema**: Comprehensive data model including users, keywords, mentions, reports, and chat messages
- **Migration Strategy**: Drizzle migrations for schema versioning

## Key Components

### Multi-Agent System
1. **Crawler Agent**: Monitors web sources for brand mentions (mock implementation with realistic data)
2. **Sentiment Analysis Agent**: Uses OpenAI GPT-4o to analyze emotional tone of mentions
3. **Insights Agent**: Generates actionable recommendations based on sentiment trends
4. **Chat Agent**: Provides conversational interface for querying insights

### Core Features
- **Keyword Monitoring**: Real-time tracking of brand mentions and keywords
- **Sentiment Analysis**: Automated classification of mentions as positive, negative, or neutral
- **Interactive Dashboard**: Visual analytics with charts and trending data
- **AI Chat Interface**: Conversational insights and recommendations
- **Report Generation**: Automated periodic reports with actionable insights

### Data Models
- **Users**: Authentication and profile management
- **Keywords**: Brand terms and phrases to monitor
- **Mentions**: Captured brand references with sentiment scores
- **Reports**: Automated analysis summaries and insights
- **Chat Messages**: Conversational history with AI agents

## Data Flow

1. **User Registration**: Replit Auth handles user authentication and profile creation
2. **Keyword Setup**: Users define brand terms and keywords to monitor
3. **Web Crawling**: Background agents simulate web crawling for mentions (mock data)
4. **Sentiment Processing**: OpenAI analyzes each mention for emotional tone
5. **Data Storage**: Structured data stored in PostgreSQL with relationships
6. **Real-time Updates**: TanStack Query provides live data synchronization
7. **Interactive Analysis**: Dashboard displays trends, charts, and insights
8. **AI Conversation**: Chat interface provides contextual recommendations

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth with OIDC integration
- **AI Services**: OpenAI API for natural language processing
- **Build Tools**: Vite, TypeScript, ESBuild for development and production

### UI and Styling
- **Component Library**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **Icons**: Lucide React icons throughout the interface
- **Theming**: Next-themes for dark mode support

### Development Tools
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Database Management**: Drizzle Kit for migrations and schema management
- **Hot Reload**: Vite development server with React Fast Refresh
- **Code Quality**: ESLint and Prettier configuration (implicit)

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module provisioned automatically
- **Development Server**: Vite dev server on port 5000
- **Hot Reload**: Full-stack development with instant feedback

### Production Deployment
- **Build Process**: Vite builds frontend, ESBuild bundles backend
- **Deployment Target**: Replit Autoscale for production workloads
- **Static Assets**: Frontend served as static files from dist/public
- **Environment Variables**: Secure handling of API keys and database credentials

### Configuration Management
- **Environment Variables**: DATABASE_URL, OPENAI_API_KEY, SESSION_SECRET
- **Build Scripts**: Separate development and production configurations
- **Asset Optimization**: Vite handles bundling, minification, and tree-shaking

## Recent Changes

```
Recent Changes:
- June 25, 2025: Initial AI-powered sentiment analysis platform setup
- June 25, 2025: Integrated real API services (Tavily, Mem0, OpenAI, CopilotKit)
- June 25, 2025: Created unified single-page app with inline content switching
- June 25, 2025: Fixed chat interface styling and ensured text input functionality
- June 25, 2025: Multi-agent system operational with web crawling and sentiment analysis
- June 25, 2025: Persistent sidebar navigation with collapsible functionality
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```