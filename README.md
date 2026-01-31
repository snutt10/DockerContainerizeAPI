# Game Exchange API - JavaScript/Node.js Version with MongoDB

A containerized REST API for managing games, users, and game exchanges, built with Express.js, MongoDB, and Docker.

## Features

- **Games Management**: Create, read, update, and delete games
- **User Management**: Manage user accounts with profiles
- **Game Exchange**: Facilitate game trading between users with atomic transactions
- **MongoDB Persistence**: Durable data storage with schema validation
- **Swagger Documentation**: Interactive API documentation
- **Docker Support**: Multi-stage Dockerfile and docker-compose orchestration
- **Health Checks**: Built-in health monitoring
- **Database Initialization**: Automatic MongoDB schema and index creation

## Endpoints

### Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/games` | Get all games |
| GET | `/games/{id}` | Get a specific game |
| POST | `/games` | Create a new game |
| PUT | `/games/{id}` | Update a game (full replacement) |
| PATCH | `/games/{id}` | Partially update a game |
| DELETE | `/games/{id}` | Delete a game |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/{id}` | Get a specific user |
| GET | `/users/{id}/games` | Get all games owned by a user |
| POST | `/users` | Create a new user |
| PUT | `/users/{id}` | Update a user |
| PATCH | `/users/{id}` | Partially update a user |
| DELETE | `/users/{id}` | Delete a user |

### Exchanges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exchanges` | Get all exchanges |
| GET | `/exchanges/{id}` | Get a specific exchange |
| GET | `/exchanges/user/{userId}` | Get exchanges for a user |
| POST | `/exchanges` | Create a new exchange |
| POST | `/exchanges/{id}/accept` | Accept an exchange |
| POST | `/exchanges/{id}/reject` | Reject an exchange |

### Documentation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/swagger` | Swagger UI documentation |

## Schemas

### Game
```json
{
  "_id": "60d5ec49c1234567890abcde",
  "name": "Game Name",
  "publisher": "Publisher Name",
  "yearPublished": 2024,
  "gamingSystem": "PS4",
  "condition": "New",
  "numberOfPreviousOwners": 0,
  "ownerId": "60d5ec49c1234567890abcdf",
  "createdAt": "2024-01-27T12:00:00Z",
  "updatedAt": "2024-01-27T12:00:00Z"
}
```

### User
```json
{
  "_id": "60d5ec49c1234567890abcdf",
  "username": "player123",
  "email": "player@example.com",
  "location": "New York",
  "joinedDate": "2024-01-27T12:00:00Z",
  "gameCount": 5,
  "createdAt": "2024-01-27T12:00:00Z",
  "updatedAt": "2024-01-27T12:00:00Z"
}
```

### Exchange
```json
{
  "_id": "60d5ec49c1234567890abce0",
  "initiatingUserId": "60d5ec49c1234567890abcdf",
  "targetUserId": "60d5ec49c1234567890abce1",
  "gameOfferedId": "60d5ec49c1234567890abcde",
  "gameRequestedId": "60d5ec49c1234567890abce2",
  "status": "pending",
  "createdAt": "2024-01-27T12:00:00Z",
  "completedAt": null,
  "updatedAt": "2024-01-27T12:00:00Z"
}
```

## Local Development

### Prerequisites

- Node.js 20+ (for local development)
- MongoDB 7.0+ (for local development) OR Docker
- npm

### Running Locally Without Docker

```bash
# Install dependencies
npm install

# Start MongoDB locally on port 27017 with:
# mongod

# Update server.js to use local MongoDB connection:
# mongodb://localhost:27017/CSC380 (without authentication if running locally)

# Start the server
npm start

# Or use watch mode
npm run dev
```

The API will be available at `http://localhost:3000`
Swagger UI will be available at `http://localhost:3000/swagger`

## Docker Deployment

### Quick Start with Docker Compose

The easiest way to run the complete stack (API + MongoDB):

```bash
# Start the service (builds if needed)
docker-compose up

# Logs will show when MongoDB is ready and API is listening
# Ctrl+C to stop, or in another terminal:
docker-compose down
```

Access the API at `http://localhost:3000`
Access Swagger at `http://localhost:3000/swagger`
MongoDB will be available at `localhost:27017` with credentials admin/admin123

### Build and Run with Docker

```bash
# Build the image
docker build -t game-api .

# Run just the API container (requires external MongoDB)
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://admin:admin123@host.docker.internal:27017/CSC380?authSource=admin \
  game-api
```

### Docker Compose Environment

The `docker-compose.yml` includes:

- **MongoDB Service**: mongo:7.0 with authentication and health checks
- **Game API Service**: Node.js with express and mongoose
- **Persistent Volume**: `mongodb_data` for database persistence
- **Health Checks**: Both services monitor their health
- **Automatic Initialization**: `init-mongo.js` creates collections and indexes

Database credentials in docker-compose.yml:
- Username: `admin`
- Password: `admin123`
- Database: `CSC380`

## MongoDB Integration

### Database Schema

The API uses MongoDB with three collections created automatically by `init-mongo.js`:

#### Games Collection
- **Name**: `games`
- **Schema Validation**: Required fields: name, publisher, yearPublished, gamingSystem, condition
- **Indexes**:
  - `ownerId` (for finding user's games)
  - Full-text search on `name` and `publisher`

#### Users Collection
- **Name**: `users`
- **Schema Validation**: Required fields: username, email
- **Indexes**:
  - `email` (unique constraint)
  - `username` (for lookups)

#### Exchanges Collection
- **Name**: `exchanges`
- **Schema Validation**: Required fields: initiatingUserId, targetUserId, gameOfferedId, gameRequestedId
- **Status Enum**: pending, accepted, rejected, completed
- **Indexes**:
  - `initiatingUserId` (for user's outgoing exchanges)
  - `targetUserId` (for user's incoming exchanges)
  - `status` (for filtering by status)

### Mongoose Models

The API uses Mongoose 8.0.3 for ODM (Object-Document Mapping):

```javascript
// Games
{
  name: String (required),
  publisher: String (required),
  yearPublished: Number (required),
  gamingSystem: String (required),
  condition: String (required),
  numberOfPreviousOwners: Number,
  ownerId: ObjectId (references User),
  createdAt: Date,
  updatedAt: Date
}

// Users
{
  username: String (required),
  email: String (required, unique),
  location: String,
  joinedDate: Date,
  createdAt: Date,
  updatedAt: Date
}

// Exchanges
{
  initiatingUserId: ObjectId (references User),
  targetUserId: ObjectId (references User),
  gameOfferedId: ObjectId (references Game),
  gameRequestedId: ObjectId (references Game),
  status: String (enum: pending, accepted, rejected, completed),
  createdAt: Date,
  completedAt: Date,
  updatedAt: Date
}
```

### Data Persistence

All data is persisted in MongoDB:
- **In Docker**: Volume `mongodb_data` persists data between container restarts
- **Connection String**: `mongodb://admin:admin123@mongodb:27017/CSC380?authSource=admin`
- **Automatic Initialization**: `init-mongo.js` creates collections and indexes on first startup

## File Structure

```
DockerContainerizeAPI/
├── server.js                 # Express.js API with Mongoose models
├── package.json             # Dependencies: express, mongoose, swagger-jsdoc
├── Dockerfile               # Multi-stage build for Node.js
├── docker-compose.yml       # Orchestrate API and MongoDB
├── init-mongo.js           # MongoDB initialization script
├── .dockerignore            # Docker build exclusions
├── .gitignore               # Git exclusions
└── README.md               # This file
```

## API Response Format

### Success Response (200)
```json
{
  "_id": "60d5ec49c1234567890abcde",
  "field": "value"
}
```

### Error Response (400/404/500)
```json
{
  "error": "Error message describing the issue"
}
```

## Common Workflows

### Create a Game Exchange

1. Create two users:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com"}'

curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "bob", "email": "bob@example.com"}'
```

2. Create games owned by each user:
```bash
# Alice's game
curl -X POST http://localhost:3000/games \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Game A",
    "publisher": "Publisher A",
    "yearPublished": 2024,
    "gamingSystem": "PS4",
    "condition": "New",
    "ownerId": "ALICE_ID"
  }'

# Bob's game
curl -X POST http://localhost:3000/games \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Game B",
    "publisher": "Publisher B",
    "yearPublished": 2023,
    "gamingSystem": "Xbox",
    "condition": "Good",
    "ownerId": "BOB_ID"
  }'
```

3. Create an exchange:
```bash
curl -X POST http://localhost:3000/exchanges \
  -H "Content-Type: application/json" \
  -d '{
    "initiatingUserId": "ALICE_ID",
    "targetUserId": "BOB_ID",
    "gameOfferedId": "GAME_A_ID",
    "gameRequestedId": "GAME_B_ID"
  }'
```

4. Accept the exchange:
```bash
curl -X POST http://localhost:3000/exchanges/EXCHANGE_ID/accept
```

After acceptance, Game A is now owned by Bob and Game B is owned by Alice.

## Troubleshooting

### Docker Compose fails to start

1. Check MongoDB logs: `docker-compose logs mongodb`
2. Check API logs: `docker-compose logs game-api`
3. Ensure ports 3000 and 27017 are not in use
4. Delete volume and restart: `docker-compose down -v && docker-compose up`

### MongoDB connection error

- Verify `MONGODB_URI` environment variable is set correctly
- Ensure MongoDB service is healthy: `docker-compose ps`
- Check MongoDB logs for authentication issues

### Swagger documentation not loading

- Verify the API is running: `curl http://localhost:3000/`
- Check browser console for CORS errors
- Ensure `/swagger` endpoint is working: `curl http://localhost:3000/swagger`

## Technology Stack

- **Runtime**: Node.js 20 Alpine
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB 7.0
- **ODM**: Mongoose 8.0.3
- **Documentation**: Swagger JSDoc 6.2.8 + Swagger UI Express 5.0.0
- **Containerization**: Docker + Docker Compose
- **Package Manager**: npm

## Example Requests

### Users

#### Create a user
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "gamer123",
    "email": "gamer@example.com",
    "location": "San Francisco"
  }'
```

#### Get all users
```bash
curl http://localhost:3000/users
```

#### Get specific user
```bash
curl http://localhost:3000/users/1
```

#### Get user's games
```bash
curl http://localhost:3000/users/1/games
```

### Games

#### Create a game (with owner)
```bash
curl -X POST http://localhost:3000/games \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Legend of Zelda",
    "publisher": "Nintendo",
    "yearPublished": 2023,
    "gamingSystem": "Nintendo Switch",
    "condition": "New",
    "numberOfPreviousOwners": 0,
    "ownerId": 1
  }'
```

#### Get all games
```bash
curl http://localhost:3000/games
```

#### Update a game
```bash
curl -X PUT http://localhost:3000/games/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Game Name",
    "condition": "Used",
    "numberOfPreviousOwners": 2
  }'
```

### Exchanges

#### Create an exchange (User 1 offers game 1 to User 2 for game 2)
```bash
curl -X POST http://localhost:3000/exchanges \
  -H "Content-Type: application/json" \
  -d '{
    "initiatingUserId": 1,
    "targetUserId": 2,
    "gameOfferedId": 1,
    "gameRequestedId": 2
  }'
```

#### Get all exchanges
```bash
curl http://localhost:3000/exchanges
```

#### Accept an exchange
```bash
curl -X POST http://localhost:3000/exchanges/1/accept
```

#### Reject an exchange
```bash
curl -X POST http://localhost:3000/exchanges/1/reject
```

#### Get user's exchanges
```bash
curl http://localhost:3000/exchanges/user/1
```

## Project Structure

```
DockerContainerizeAPI/
├── server.js              # Main application with all endpoints
├── package.json           # Dependencies and scripts
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Docker Compose configuration
├── .dockerignore          # Files to exclude from Docker image
├── .gitignore             # Git exclusions
└── README.md              # This file
```

## Technology Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js 4.18
- **Documentation**: Swagger UI & Swagger JSDoc
- **Containerization**: Docker
- **Orchestration**: Docker Compose

## API Features

### Game Management
- Full CRUD operations on games
- Track game ownership via `ownerId`
- Manage game conditions and previous owners
- Support for multiple gaming systems

### User Management
- Create and manage user accounts
- Track user location and join date
- Automatic game count calculation
- Email uniqueness validation
- Cascading deletion (removes user's games and exchanges)

### Exchange System
- Create exchange proposals between users
- Validate game ownership before allowing exchanges
- Accept/reject exchange requests
- Automatic game ownership transfer on acceptance
- Track exchange status: pending, accepted, rejected, completed
- Query exchanges by user

## Error Handling

The API includes comprehensive error handling:
- Missing required fields validation
- Resource not found (404) responses
- Ownership validation for exchanges
- Email uniqueness constraints
- User existence checks

## Key Differences from C# Version

- Express.js instead of ASP.NET Core
- In-memory arrays instead of Entity Framework
- Swagger JSDoc for API documentation
- Alpine Linux base image for smaller container size
- Three separate in-memory datasets (games, users, exchanges)
- Cascading operations for data consistency

