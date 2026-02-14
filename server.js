const express = require('express');
const mongoose = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require('bcryptjs');
const Game = require('../models/Game');
const User = require('../models/User');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ============================================
// DB Schema
// ============================================
//const Game = mongoose.model('Game', gameSchema, 'games');
const User = mongoose.model('User', userSchema, 'users');
const Exchange = mongoose.model('Exchange', exchangeSchema, 'exchanges');
/*
const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    publisher: {
        type: String,
        required: true
    },
    yearPublished: {
        type: Number,
        required: true
    },
    gamingSystem: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        required: true
    },
    numberOfPreviousOwners: {
        type: Number,
        default: null
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    address: {
        type: String,
        default: null
    },
    password: {
        type: String,
        required: true
    }
});

const exchangeSchema = new mongoose.Schema({
    initiatingUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameOfferedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    gameRequestedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB - CSC380 database');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
*/

const connectDB = require('./config/db');
connectDB();

// ============================================
// SWAGGER CONFIGURATION
// ============================================

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Game Exchange API',
            version: '2.0.0',
            description: 'REST API for managing games, users, and game exchanges with MongoDB'
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                Game: {
                    type: 'object',
                    required: ['name', 'publisher', 'yearPublished', 'gamingSystem', 'condition'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'The game ID'
                        },
                        name: {
                            type: 'string',
                            description: 'The name of the game'
                        },
                        publisher: {
                            type: 'string',
                            description: 'The publisher of the game'
                        },
                        yearPublished: {
                            type: 'integer',
                            description: 'The year the game was published'
                        },
                        gamingSystem: {
                            type: 'string',
                            description: 'The gaming system (e.g., PS4, Xbox, PC)'
                        },
                        condition: {
                            type: 'string',
                            description: 'The condition of the game (e.g., New, Used, Old)'
                        },
                        numberOfPreviousOwners: {
                            type: 'integer',
                            nullable: true,
                            description: 'Number of previous owners'
                        },
                        ownerId: {
                            type: 'string',
                            nullable: true,
                            description: 'The user ID who owns this game'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                User: {
                    type: 'object',
                    required: ['username', 'email'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'The user ID'
                        },
                        username: {
                            type: 'string',
                            description: 'The username'
                        },
                        email: {
                            type: 'string',
                            description: 'The user email'
                        },
                        address: {
                            type: 'string',
                            nullable: true,
                            description: 'User address'
                        },
                        password: {
                            type: 'string',
                            description: 'The user password'
                        },
                    }
                },
                Exchange: {
                    type: 'object',
                    required: ['initiatingUserId', 'targetUserId', 'gameOfferedId', 'gameRequestedId'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'The exchange ID'
                        },
                        initiatingUserId: {
                            type: 'string',
                            description: 'ID of user initiating the exchange'
                        },
                        targetUserId: {
                            type: 'string',
                            description: 'ID of user receiving the exchange offer'
                        },
                        gameOfferedId: {
                            type: 'string',
                            description: 'ID of game being offered'
                        },
                        gameRequestedId: {
                            type: 'string',
                            description: 'ID of game being requested'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'accepted', 'rejected', 'completed'],
                            description: 'Status of the exchange'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'When exchange was created'
                        },
                        completedAt: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'When exchange was completed'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                }
            }
        }
    },
    apis: ['./server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// GAMES ENDPOINTS
// ============================================
const replicaApp = process.env.APP_NAME
/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     responses:
 *       200:
 *         description: Welcome message
 */
app.get('/', (req, res) => {
    res.send('Game Exchange API - Welcome! (MongoDB Edition)');
    console.log(`Request served by: ${replicaApp}`);
});

/**
 * @swagger
 * /games:
 *   get:
 *     summary: Get all games
 *     responses:
 *       200:
 *         description: A list of all games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 */
app.get('/games', async (req, res) => {
    try {
        const games = await Game.find().populate('ownerId', 'username email');
        res.json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Create a new game
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       201:
 *         description: Game created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 */
app.post('/games', async (req, res) => {
    try {
        const { name, publisher, yearPublished, gamingSystem, condition, numberOfPreviousOwners, ownerId } = req.body;

        if (!name || !publisher || !yearPublished || !gamingSystem || !condition) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate owner exists if provided
        if (ownerId) {
            const owner = await User.findById(ownerId);
            if (!owner) {
                return res.status(400).json({ error: 'Owner user not found' });
            }
        }

        const newGame = new Game({
            name,
            publisher,
            yearPublished,
            gamingSystem,
            condition,
            numberOfPreviousOwners: numberOfPreviousOwners || null,
            ownerId: ownerId || null
        });

        const savedGame = await newGame.save();
        res.status(201).location(`/games/${savedGame._id}`).json(savedGame);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Get a specific game
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       404:
 *         description: Game not found
 */
app.get('/games/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id).populate('ownerId', 'username email');
        if (!game) return res.status(404).json({ error: 'Game not found' });
        res.json(game);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /games/{id}:
 *   put:
 *     summary: Update a game
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       200:
 *         description: Game updated
 *       404:
 *         description: Game not found
 */
app.put('/games/:id', async (req, res) => {
    try {
        const { name, publisher, yearPublished, gamingSystem, condition, numberOfPreviousOwners, ownerId } = req.body;

        if (ownerId) {
            const owner = await User.findById(ownerId);
            if (!owner) {
                return res.status(400).json({ error: 'Owner user not found' });
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (publisher !== undefined) updateData.publisher = publisher;
        if (yearPublished !== undefined) updateData.yearPublished = yearPublished;
        if (gamingSystem !== undefined) updateData.gamingSystem = gamingSystem;
        if (condition !== undefined) updateData.condition = condition;
        if (numberOfPreviousOwners !== undefined) updateData.numberOfPreviousOwners = numberOfPreviousOwners;
        if (ownerId !== undefined) updateData.ownerId = ownerId;
        updateData.updatedAt = Date.now();

        const updatedGame = await Game.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('ownerId', 'username email');
        if (!updatedGame) return res.status(404).json({ error: 'Game not found' });
        res.json(updatedGame);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /games/{id}:
 *   patch:
 *     summary: Partially update a game
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Game updated
 *       404:
 *         description: Game not found
 */
app.patch('/games/:id', async (req, res) => {
    try {
        const { name, publisher, yearPublished, gamingSystem, condition, numberOfPreviousOwners, ownerId } = req.body;

        if (ownerId) {
            const owner = await User.findById(ownerId);
            if (!owner) {
                return res.status(400).json({ error: 'Owner user not found' });
            }
        }

        const updateData = {};
        if (name !== undefined && name !== '') updateData.name = name;
        if (publisher !== undefined && publisher !== '') updateData.publisher = publisher;
        if (yearPublished !== undefined && yearPublished !== 0) updateData.yearPublished = yearPublished;
        if (gamingSystem !== undefined && gamingSystem !== '') updateData.gamingSystem = gamingSystem;
        if (condition !== undefined && condition !== '') updateData.condition = condition;
        if (numberOfPreviousOwners !== undefined && numberOfPreviousOwners !== 0) updateData.numberOfPreviousOwners = numberOfPreviousOwners;
        if (ownerId !== undefined) updateData.ownerId = ownerId;
        updateData.updatedAt = Date.now();

        const updatedGame = await Game.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('ownerId', 'username email');
        if (!updatedGame) return res.status(404).json({ error: 'Game not found' });
        res.json(updatedGame);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /games/{id}:
 *   delete:
 *     summary: Delete a game
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Game deleted
 *       404:
 *         description: Game not found
 */
app.delete('/games/:id', async (req, res) => {
    try {
        const deletedGame = await Game.findByIdAndDelete(req.params.id);
        if (!deletedGame) return res.status(404).json({ error: 'Game not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// USERS ENDPOINTS
// ============================================

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: A list of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        // Calculate game count for each user
        const usersWithCount = await Promise.all(users.map(async (user) => {
            const gameCount = await Game.countDocuments({ ownerId: user._id });
            return { ...user.toObject(), gameCount };
        }));
        res.json(usersWithCount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
app.post('/users', async (req, res) => {
    try {
        const { username, email, password, address } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const newUser = new User({
            username,
            email: email.toLowerCase(),
            address: address || null,
            password: await bcrypt.hash(password, 10),
        });

        const savedUser = await newUser.save();
        const userWithCount = { ...savedUser.toObject(), gameCount: 0 };
        res.status(201).location(`/users/${savedUser._id}`).json(userWithCount);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a specific user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const gameCount = await Game.countDocuments({ ownerId: user._id });
        res.json({ ...user.toObject(), gameCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
app.put('/users/:id', async (req, res) => {
    try {
        const { username, email, address, password } = req.body;

        if (email) {
            const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email.toLowerCase();
        if (address !== undefined) updateData.address = address;
        if (password !== undefined) updateData.password = await bcrypt.hash(password, 10);
        updateData.updatedAt = Date.now();

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ error: 'User not found' });
        const gameCount = await Game.countDocuments({ ownerId: updatedUser._id });
        res.json({ ...updatedUser.toObject(), gameCount });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Partially update a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
app.patch('/users/:id', async (req, res) => {
    try {
        // Do not allow changing email via PATCH
        if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
            return res.status(400).json({ error: 'Email cannot be changed' });
        }

        const updateData = {};
        // Apply only fields explicitly provided in the request body
        if (Object.prototype.hasOwnProperty.call(req.body, 'username')) {
            updateData.username = req.body.username === '' ? null : req.body.username;
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'address')) {
            updateData.address = req.body.address === '' ? null : req.body.address;
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'password')) {
            updateData.password = await bcrypt.hash(req.body.password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        updateData.updatedAt = Date.now();

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ error: 'User not found' });
        const gameCount = await Game.countDocuments({ ownerId: updatedUser._id });
        res.json({ ...updatedUser.toObject(), gameCount });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
app.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });

        // Remove user's games
        await Game.deleteMany({ ownerId: req.params.id });

        // Cancel user's exchanges
        await Exchange.deleteMany({
            $or: [
                { initiatingUserId: req.params.id },
                { targetUserId: req.params.id }
            ]
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /users/{id}/games:
 *   get:
 *     summary: Get all games owned by a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of games owned by user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *       404:
 *         description: User not found
 */
app.get('/users/:id/games', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const userGames = await Game.find({ ownerId: req.params.id });
        res.json(userGames);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// EXCHANGES ENDPOINTS
// ============================================

/**
 * @swagger
 * /exchanges:
 *   get:
 *     summary: Get all exchanges
 *     responses:
 *       200:
 *         description: A list of all exchanges
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exchange'
 */
app.get('/exchanges', async (req, res) => {
    try {
        const exchanges = await Exchange.find()
            .populate('initiatingUserId', 'username email')
            .populate('targetUserId', 'username email')
            .populate('gameOfferedId', 'name gamingSystem')
            .populate('gameRequestedId', 'name gamingSystem');
        res.json(exchanges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /exchanges:
 *   post:
 *     summary: Create a new game exchange
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exchange'
 *     responses:
 *       201:
 *         description: Exchange created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exchange'
 *       400:
 *         description: Invalid exchange request
 */
app.post('/exchanges', async (req, res) => {
    try {
        const { initiatingUserId, targetUserId, gameOfferedId, gameRequestedId } = req.body;

        if (!initiatingUserId || !targetUserId || !gameOfferedId || !gameRequestedId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate users exist
        const initiatingUser = await User.findById(initiatingUserId);
        const targetUser = await User.findById(targetUserId);

        if (!initiatingUser) return res.status(400).json({ error: 'Initiating user not found' });
        if (!targetUser) return res.status(400).json({ error: 'Target user not found' });

        // Validate games exist
        const gameOffered = await Game.findById(gameOfferedId);
        const gameRequested = await Game.findById(gameRequestedId);

        if (!gameOffered || !gameRequested) {
            return res.status(400).json({ error: 'One or both games not found' });
        }

        // Validate ownership
        if (!gameOffered.ownerId.equals(initiatingUserId)) {
            return res.status(400).json({ error: 'Initiating user does not own the offered game' });
        }
        if (!gameRequested.ownerId.equals(targetUserId)) {
            return res.status(400).json({ error: 'Target user does not own the requested game' });
        }

        const newExchange = new Exchange({
            initiatingUserId,
            targetUserId,
            gameOfferedId,
            gameRequestedId,
            status: 'pending'
        });

        const savedExchange = await newExchange.save();
        const populatedExchange = await savedExchange.populate([
            { path: 'initiatingUserId', select: 'username email' },
            { path: 'targetUserId', select: 'username email' },
            { path: 'gameOfferedId', select: 'name gamingSystem' },
            { path: 'gameRequestedId', select: 'name gamingSystem' }
        ]);

        res.status(201).location(`/exchanges/${savedExchange._id}`).json(populatedExchange);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /exchanges/{id}:
 *   get:
 *     summary: Get a specific exchange
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exchange details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exchange'
 *       404:
 *         description: Exchange not found
 */
app.get('/exchanges/:id', async (req, res) => {
    try {
        const exchange = await Exchange.findById(req.params.id)
            .populate('initiatingUserId', 'username email')
            .populate('targetUserId', 'username email')
            .populate('gameOfferedId', 'name gamingSystem')
            .populate('gameRequestedId', 'name gamingSystem');
        if (!exchange) return res.status(404).json({ error: 'Exchange not found' });
        res.json(exchange);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /exchanges/{id}/accept:
 *   post:
 *     summary: Accept a game exchange
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exchange accepted and completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exchange'
 *       404:
 *         description: Exchange not found
 *       400:
 *         description: Exchange cannot be accepted
 */
app.post('/exchanges/:id/accept', async (req, res) => {
    try {
        const exchange = await Exchange.findById(req.params.id);
        if (!exchange) return res.status(404).json({ error: 'Exchange not found' });

        if (exchange.status !== 'pending') {
            return res.status(400).json({ error: 'Exchange is not pending' });
        }

        // Swap game ownership
        await Game.findByIdAndUpdate(exchange.gameOfferedId, { ownerId: exchange.targetUserId });
        await Game.findByIdAndUpdate(exchange.gameRequestedId, { ownerId: exchange.initiatingUserId });

        // Update exchange
        exchange.status = 'completed';
        exchange.completedAt = new Date();
        exchange.updatedAt = new Date();
        await exchange.save();

        const populatedExchange = await exchange.populate([
            { path: 'initiatingUserId', select: 'username email' },
            { path: 'targetUserId', select: 'username email' },
            { path: 'gameOfferedId', select: 'name gamingSystem' },
            { path: 'gameRequestedId', select: 'name gamingSystem' }
        ]);

        res.json(populatedExchange);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /exchanges/{id}/reject:
 *   post:
 *     summary: Reject a game exchange
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exchange rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exchange'
 *       404:
 *         description: Exchange not found
 *       400:
 *         description: Exchange cannot be rejected
 */
app.post('/exchanges/:id/reject', async (req, res) => {
    try {
        const exchange = await Exchange.findById(req.params.id);
        if (!exchange) return res.status(404).json({ error: 'Exchange not found' });

        if (exchange.status !== 'pending') {
            return res.status(400).json({ error: 'Exchange is not pending' });
        }

        exchange.status = 'rejected';
        exchange.updatedAt = new Date();
        await exchange.save();

        const populatedExchange = await exchange.populate([
            { path: 'initiatingUserId', select: 'username email' },
            { path: 'targetUserId', select: 'username email' },
            { path: 'gameOfferedId', select: 'name gamingSystem' },
            { path: 'gameRequestedId', select: 'name gamingSystem' }
        ]);

        res.json(populatedExchange);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /exchanges/user/{userId}:
 *   get:
 *     summary: Get exchanges for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of exchanges for user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exchange'
 *       404:
 *         description: User not found
 */
app.get('/exchanges/user/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const userExchanges = await Exchange.find({
            $or: [
                { initiatingUserId: req.params.userId },
                { targetUserId: req.params.userId }
            ]
        })
            .populate('initiatingUserId', 'username email')
            .populate('targetUserId', 'username email')
            .populate('gameOfferedId', 'name gamingSystem')
            .populate('gameRequestedId', 'name gamingSystem');

        res.json(userExchanges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`${replicaApp} is listening on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/swagger`);
});
