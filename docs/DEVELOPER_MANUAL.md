# 🛠️ Drawnguess - Developer Manual

This comprehensive guide covers everything developers need to know to work with, modify, and extend the Drawnguess application.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup--installation)
4. [Project Structure](#project-structure)
5. [Technology Stack](#technology-stack)
6. [Development Workflow](#development-workflow)
7. [API Documentation](#api-documentation)
8. [Socket.IO Events](#socketio-events)
9. [Database Schema](#database-schema)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Contributing](#contributing)

## 🎯 Project Overview

Drawnguess is a real-time multiplayer drawing and guessing game built with modern web technologies. The application consists of:

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Socket.IO for real-time communication
- **Database**: MongoDB with Prisma ORM
- **UI Components**: Hero UI (Next UI)

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Socket.IO)   │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ - Game UI       │    │ - Real-time     │    │ - Rooms         │
│ - Socket Client │    │ - Game Logic    │    │ - Players       │
│ - State Mgmt    │    │ - API Routes    │    │ - Messages      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

```
src/
├── app/                    # Next.js App Router
├── features/              # Feature-based modules
│   ├── home/             # Home page feature
│   └── game-room/        # Game room feature
├── shared/               # Shared components & types
├── lib/                  # Utility libraries
├── server/               # Socket.IO server
└── generated/            # Prisma generated files
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- pnpm (recommended) or npm

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd drawnguess
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:

   ```env
   DATABASE_URL=mongodb://localhost:27017/drawnguess
   SOCKET_PORT=3001
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   NODE_ENV=development
   ```

4. **Setup database**

   ```bash
   pnpm run db:push
   pnpm run db:generate
   ```

5. **Start development servers**

   ```bash
   # Start both Next.js and Socket.IO server
   pnpm run dev:full

   # Or separately:
   pnpm run dev        # Next.js app
   pnpm run socket:dev # Socket.IO server
   ```

## 📁 Project Structure

```
drawnguess/
├── docs/                          # Documentation
│   ├── USER_MANUAL.md            # User guide
│   ├── DEVELOPER_MANUAL.md       # This file
│   └── SOCKET_SERVER.md          # Socket.IO server docs
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   └── rooms/            # Room management APIs
│   │   ├── room/[code]/          # Dynamic room pages
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   ├── features/                 # Feature modules
│   │   ├── home/                 # Home page feature
│   │   │   ├── components/       # UI components
│   │   │   ├── hooks/            # Custom hooks
│   │   │   └── types/            # Type definitions
│   │   └── game-room/            # Game room feature
│   │       ├── components/       # Room components
│   │       └── hooks/            # Room-specific hooks
│   ├── shared/                   # Shared resources
│   │   ├── components/           # Reusable components
│   │   └── types/                # Global types
│   ├── lib/                      # Utility libraries
│   │   ├── prisma.ts             # Database client
│   │   ├── socket.ts             # Socket.IO client
│   │   └── utils.ts              # Helper functions
│   └── server/                   # Socket.IO server
│       ├── index.ts              # Main server file
│       ├── gameLogic.ts          # Game logic
│       ├── database.ts           # DB operations
│       └── types.ts              # Server types
├── prisma/
│   └── schema.prisma             # Database schema
├── public/                       # Static assets
└── package.json                  # Dependencies & scripts
```

## 🔧 Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Hero UI (Next UI)
- **State Management**: React hooks + Zustand
- **Real-time**: Socket.IO Client

### Backend

- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Real-time**: Socket.IO Server
- **Database**: MongoDB with Prisma ORM
- **Language**: TypeScript

### Development Tools

- **Package Manager**: pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Process Management**: Concurrently

## 🔄 Development Workflow

### Code Organization Principles

- **Feature-based structure**: Group related files by feature
- **Component size limit**: Max 200-300 lines per file
- **Single responsibility**: One component, one purpose
- **Reusable components**: Shared components in `/shared`

### File Naming Conventions

- **Components**: PascalCase (e.g., `GameRoomHeader.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useGameRoom.ts`)
- **Types**: PascalCase (e.g., `GameRoom.ts`)
- **Utilities**: camelCase (e.g., `formatTime.ts`)

### Development Commands

```bash
# Development
pnpm run dev            # Start Next.js dev server
pnpm run socket:dev     # Start Socket.IO server in dev mode
pnpm run dev:full       # Start both servers concurrently

# Database
pnpm run db:push        # Push schema to database
pnpm run db:generate    # Generate Prisma client
pnpm run db:studio      # Open Prisma Studio

# Code Quality
pnpm run lint           # Run ESLint
pnpm run lint:fix       # Fix linting issues
pnpm run type-check     # Run TypeScript checks
pnpm run format         # Format code with Prettier

# Production
pnpm run build          # Build for production
pnpm run start          # Start production server
pnpm run socket:start   # Start Socket.IO server
```

## 📡 API Documentation

### REST API Endpoints

#### Rooms

- `POST /api/rooms` - Create a new room
- `GET /api/rooms/[code]` - Get room details
- `POST /api/rooms/[code]/join` - Join a room
- `GET /api/test` - Test database connection

#### Room Creation

```typescript
POST /api/rooms
{
  "name": "My Game Room",
  "maxPlayers": 8,
  "maxRounds": 3,
  "roundTime": 80
}
```

#### Join Room

```typescript
POST /api/rooms/[code]/join
{
  "username": "PlayerName"
}
```

## 🔌 Socket.IO Events

### Client to Server Events

```typescript
// Room management
'join-room': { roomCode: string, username: string }
'leave-room': string (roomCode)

// Game actions
'start-game': string (roomCode)
'select-word': { roomCode: string, word: string }
'guess': { roomCode: string, guess: string }

// Drawing
'draw': { roomCode: string, path: DrawPath }
'clear-canvas': string (roomCode)

// Chat
'message': { roomCode: string, content: string }
```

### Server to Client Events

```typescript
// Room updates
'room-updated': { players: Player[], currentRound: number, ... }
'player-joined': Player
'player-left': string (playerId)

// Game events
'game-started': void
'game-ended': Record<string, number> (final scores)
'turn-changed': string (drawerId)
'word-selected': string (word)
'correct-guess': { playerId: string, word: string }
'timer-update': number (timeLeft)

// Drawing
'draw': DrawPath
'clear-canvas': void

// Chat
'message': ChatMessage
```

## 🗄️ Database Schema

### Room Model

```prisma
model Room {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  code          String   @unique
  name          String
  maxPlayers    Int      @default(8)
  status        String   @default("waiting")
  currentRound  Int      @default(0)
  maxRounds     Int      @default(3)
  roundTime     Int      @default(80)
  currentDrawer String?
  currentWord   String?
  wordOptions   String[] @default([])
  players       Player[]
  drawings      Drawing[]
  messages      Message[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Player Model

```prisma
model Player {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  username  String
  roomId    String   @db.ObjectId
  room      Room     @relation(fields: [roomId], references: [id])
  score     Int      @default(0)
  isReady   Boolean  @default(false)
  isDrawing Boolean  @default(false)
  hasGuessed Boolean @default(false)
  socketId  String?
  joinedAt  DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🎮 Game Logic

### Game Flow

1. **Room Creation**: Player creates room with settings
2. **Player Joining**: Players join using room code
3. **Game Start**: Minimum 2 players required
4. **Drawing Phase**: Current drawer selects word and draws
5. **Guessing Phase**: Other players submit guesses
6. **Scoring**: Points awarded for correct guesses
7. **Round Rotation**: Next player becomes drawer
8. **Game End**: After all rounds completed

### Scoring System

```typescript
// Base scoring
const baseScore = 100;
const timeBonus = Math.floor((timeLeft / roundTime) * 50);
const finalScore = baseScore + timeBonus;
```

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component and utility functions
- **Integration Tests**: API endpoints
- **E2E Tests**: Critical user flows
- **Socket Tests**: Real-time communication

### Running Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:coverage
```

## 🚀 Deployment

### Environment Setup

```env
# Production environment
NODE_ENV=production
DATABASE_URL=mongodb://your-production-db
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
```

### Build Process

```bash
# Build application
pnpm run build

# Start production servers
pnpm run start          # Next.js
pnpm run socket:start   # Socket.IO
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Socket.IO server running
- [ ] CORS origins updated
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Monitoring setup

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow existing patterns
2. **Component Size**: Keep components under 300 lines
3. **Type Safety**: Use TypeScript strictly
4. **Testing**: Write tests for new features
5. **Documentation**: Update docs for changes

### Pull Request Process

1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Submit PR with clear description

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Components are properly sized
- [ ] Types are well-defined
- [ ] Tests pass
- [ ] Documentation updated

## 🐛 Debugging

### Common Issues

1. **Socket Connection**: Check CORS and port configuration
2. **Database Issues**: Verify connection string and schema
3. **Type Errors**: Ensure Prisma client is generated
4. **Build Errors**: Check for missing dependencies

### Debug Commands

```bash
# Enable Socket.IO debug logging
DEBUG=socket.io* pnpm run socket:dev

# Check database connection
pnpm run db:studio

# Type checking
pnpm run type-check
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Hero UI Documentation](https://heroui.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Support

### Getting Help

- Check existing documentation
- Review GitHub issues
- Contact development team
- Join community discussions

### Reporting Issues

- Use issue templates
- Provide reproduction steps
- Include environment details
- Attach relevant logs

---

**Happy coding! 🚀**
