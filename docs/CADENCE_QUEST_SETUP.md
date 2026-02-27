# Cadence Quest Setup

Cadence Quest is a music RPG with PvE battles and real-time PvP. This guide covers local development with the full stack (database, API, WebSocket, client).

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Environment

Copy the example env and configure:

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

- **DATABASE_URL** – Postgres connection string (e.g. [Neon](https://neon.tech) free tier)
- **SESSION_SECRET** – Any random string for session signing

### 3. Database

Run migrations to create tables:

```bash
bun run db:migrate
```

### 4. Run both client and server

```bash
bun run dev:all
```

This starts:

- **Client** – http://localhost:5174 (Vite)
- **Server** – http://localhost:3001 (Express + Socket.IO)

Or run in separate terminals:

```bash
# Terminal 1
bun run dev

# Terminal 2
bun run dev:server
```

### 5. Play Cadence Quest

1. Open http://localhost:5174
2. Go to Games → Cadence Quest
3. **New Game** → Create a character (name + class)
4. Play PvE: use the World Map to enter regions and fight encounters
5. **PvP**: requires a registered account and a server-backed character

## PvP Requirements

Real-time PvP needs:

- Running server on port 3001
- `DATABASE_URL` configured
- Registered account (not guest)
- Character created via the server (after registering)

### PvP flow

1. **Register** – Create an account (or use guest for PvE only)
2. **Create character** – With an account, the character is stored on the server
3. **World Map** → PvP Arena
4. **Find Match** – Joins matchmaking; when two players are in the same level bracket, they are paired
5. **Battle** – Server runs the battle; both clients sync via WebSocket

### Testing PvP locally

1. Open two browser windows (or one normal + one incognito)
2. Register two accounts (e.g. `player1` / `player2`)
3. Create a character in each
4. Go to PvP Arena in both
5. Click **Find Match** in both; when they match, the battle starts

## Environment Reference

| Variable       | Required | Default                 | Description                    |
|----------------|----------|-------------------------|--------------------------------|
| DATABASE_URL   | Yes*     | -                       | Postgres connection string     |
| SESSION_SECRET | Prod     | `cadence-quest-dev-secret` | Session cookie signing     |
| CORS_ORIGIN    | No       | `http://localhost:5174` | Allowed origin for API/WS      |
| PORT           | No       | `3001`                  | API server port                |
| VITE_API_URL   | No       | `http://localhost:3001` | API base URL for client        |

\* Without `DATABASE_URL`, the server starts but character persistence and PvP do not work.
