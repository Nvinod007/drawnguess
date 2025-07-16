# Socket.IO Server Setup

This document explains how to set up and run the Socket.IO server for real-time communication in the Skribbl.io clone.

## Server Location

The Socket.IO server is located at `src/server/index.ts` and handles all real-time communication between clients.

## Prerequisites

1. **Database Setup**: Make sure your MongoDB database is running and accessible
2. **Environment Variables**: Copy `.env.example` to `.env` and fill in your database URL
3. **Dependencies**: Install all dependencies with `pnpm install`

## Running the Socket Server

### Development Mode

To run both the Next.js app and Socket.IO server simultaneously:

```bash
pnpm run dev:full
```

Or run them separately:

```bash
# Terminal 1 - Next.js app
pnpm run dev

# Terminal 2 - Socket.IO server
pnpm run socket:dev
```

### Production Mode

```bash
# Build the Next.js app
pnpm run build

# Start the Socket.IO server
pnpm run socket:start

# Start the Next.js app (in another terminal)
pnpm run start
```

## Environment Variables

Make sure to set these environment variables in your `.env` file:

```env
DATABASE_URL=your_mongodb_connection_string
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NODE_ENV=development
```

## Socket Server Features

The Socket.IO server handles:

### Real-time Communication

- **Player joining/leaving rooms**
- **Real-time drawing synchronization**
- **Chat messages**
- **Game state updates**

### Game Logic

- **Room management**
- **Turn rotation**
- **Word selection**
- **Scoring system**
- **Round timers**

### Events Handled

#### Client to Server Events

- `join-room` - Player joins a room
- `leave-room` - Player leaves a room
- `draw` - Drawing data
- `clear-canvas` - Clear the canvas
- `message` - Chat messages
- `start-game` - Start the game
- `select-word` - Drawer selects a word
- `guess` - Player makes a guess

#### Server to Client Events

- `player-joined` - New player joined
- `player-left` - Player left
- `room-updated` - Room state changed
- `draw` - Drawing data broadcast
- `clear-canvas` - Canvas cleared
- `message` - Chat message broadcast
- `game-started` - Game started
- `turn-changed` - New drawer selected
- `word-selected` - Word selected by drawer
- `correct-guess` - Correct guess made
- `timer-update` - Round timer update
- `game-ended` - Game finished

## Database Integration

The server integrates with your Prisma database to:

- Fetch room and player data
- Update game state
- Persist scores and game history
- Handle player reconnections

## Error Handling

The server includes comprehensive error handling for:

- Database connection issues
- Invalid room codes
- Player authentication
- Game state validation
- Network disconnections

## Performance Considerations

- **In-memory state**: Active games are stored in memory for fast access
- **Database sync**: Important state is persisted to the database
- **Graceful shutdown**: Server handles shutdown gracefully
- **Connection cleanup**: Disconnected players are cleaned up automatically

## Monitoring

The server logs important events:

- Player connections/disconnections
- Game state changes
- Error conditions
- Performance metrics

## Next Steps

After setting up the Socket.IO server, you can:

1. Test real-time communication between clients
2. Implement the drawing canvas (Step 2)
3. Add chat functionality (Step 3)
4. Complete game logic (Step 4)

## Troubleshooting

### Common Issues

1. **Port already in use**: Change `SOCKET_PORT` in `.env`
2. **Database connection**: Verify `DATABASE_URL` is correct
3. **CORS errors**: Update CORS origins in `server.ts`
4. **Dependencies**: Run `pnpm install` to install missing packages

### Debug Mode

To enable debug logging:

```bash
DEBUG=socket.io* pnpm run socket:dev
```

This will show detailed Socket.IO connection and event logs.
