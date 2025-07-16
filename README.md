# 🎨 Drawnguess

**A real-time multiplayer drawing and guessing game built with Next.js, Socket.IO, and MongoDB.**

> Inspired by Skribbl.io, Drawnguess brings friends together through creative drawing and competitive guessing in a fun, interactive web experience.

## 🚀 Quick Start

### For Users

**Ready to play?** Check out the [**User Manual**](docs/USER_MANUAL.md) for:

- 🎮 How to play the game
- 🏠 Creating and joining rooms
- 🎨 Drawing tips and tricks
- 🏆 Scoring system
- 🛠️ Troubleshooting

### For Developers

**Want to contribute?** Check out the [**Developer Manual**](docs/DEVELOPER_MANUAL.md) for:

- 🏗️ Project architecture
- 🔧 Setup and installation
- 📡 API documentation
- 🧪 Testing guidelines
- 🚀 Deployment process

### For System Admins

**Setting up the server?** Check out the [**Socket Server Documentation**](docs/SOCKET_SERVER.md) for:

- ⚙️ Server configuration
- 🔌 Socket.IO setup
- 🗄️ Database integration
- 🐛 Debugging and monitoring

## 🎯 What is Drawnguess?

Drawnguess is a multiplayer online game where:

- 👥 **2-8 players** join a room using a unique code
- 🎨 **Players take turns drawing** while others guess
- 💬 **Real-time chat** for guessing and communication
- 🏆 **Points system** rewards quick and accurate guesses
- 🔄 **Multiple rounds** with automatic turn rotation

## ✨ Features

### 🎮 Game Features

- **Real-time multiplayer** gameplay
- **Drawing tools** with multiple colors and brush sizes
- **Word selection** from curated word lists
- **Scoring system** with time-based bonuses
- **Chat system** for guessing and communication
- **Room management** with unique codes

### 🔧 Technical Features

- **Next.js 15** with App Router
- **Socket.IO** for real-time communication
- **MongoDB** with Prisma ORM
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **Hero UI** for modern components

## 🚀 Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- pnpm (recommended)

### Quick Setup

```bash
# Clone the repository
git clone <repository-url>
cd drawnguess

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL

# Setup database
pnpm run db:push
pnpm run db:generate

# Start development servers
pnpm run dev:full
```

### Available Scripts

```bash
# Development
pnpm run dev            # Start Next.js dev server
pnpm run socket:dev     # Start Socket.IO server
pnpm run dev:full       # Start both servers

# Database
pnpm run db:push        # Push schema changes
pnpm run db:studio      # Open Prisma Studio

# Production
pnpm run build          # Build for production
pnpm run start          # Start production server
```

## 🏗️ Project Structure

```
drawnguess/
├── docs/                    # 📚 Documentation
│   ├── USER_MANUAL.md      # User guide
│   ├── DEVELOPER_MANUAL.md # Developer guide
│   └── SOCKET_SERVER.md    # Server documentation
├── src/
│   ├── app/                # Next.js App Router
│   ├── features/          # Feature modules
│   │   ├── home/          # Home page
│   │   └── game-room/     # Game room
│   ├── shared/            # Shared components
│   ├── lib/               # Utilities
│   └── server/            # Socket.IO server
├── prisma/                # Database schema
└── public/               # Static assets
```

## 🔧 Technology Stack

### Frontend

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Hero UI
- **Real-time**: Socket.IO Client

### Backend

- **Runtime**: Node.js
- **Real-time**: Socket.IO Server
- **Database**: MongoDB + Prisma
- **API**: Next.js API Routes

## 📖 Documentation

| Document                                         | Description                             | Target Audience     |
| ------------------------------------------------ | --------------------------------------- | ------------------- |
| [**User Manual**](docs/USER_MANUAL.md)           | Complete guide for playing the game     | Players & End Users |
| [**Developer Manual**](docs/DEVELOPER_MANUAL.md) | Technical documentation for development | Developers          |
| [**Socket Server Guide**](docs/SOCKET_SERVER.md) | Server setup and configuration          | System Admins       |

## 🎮 How to Play

1. **Join a Room**: Enter your username and room code
2. **Wait for Players**: Minimum 2 players needed
3. **Start Drawing**: Take turns drawing the given word
4. **Guess Away**: Type your guesses in the chat
5. **Score Points**: Earn points for correct guesses
6. **Win the Game**: Player with most points wins!

## 🤝 Contributing

We welcome contributions! Please check the [**Developer Manual**](docs/DEVELOPER_MANUAL.md) for:

- Development guidelines
- Code style requirements
- Pull request process
- Testing requirements

## 🐛 Issues & Support

- **Bug Reports**: Use GitHub Issues
- **Feature Requests**: Use GitHub Discussions
- **User Support**: Check [User Manual](docs/USER_MANUAL.md)
- **Developer Help**: Check [Developer Manual](docs/DEVELOPER_MANUAL.md)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Acknowledgments

- Inspired by [Skribbl.io](https://skribbl.io/)
- Built with modern web technologies
- Powered by the open-source community

---

**Ready to start drawing? 🎨 Check out the [User Manual](docs/USER_MANUAL.md) to get started!**
