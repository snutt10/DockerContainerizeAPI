const express = require('express');
const Game = require('../models/Game');
const User = require('../models/User');
const { getCachedData, setCacheData, deleteCacheKey, CACHE_KEYS, DEFAULT_TTL } = require('../config/cache');
const router = express.Router();

// ============================================
// GAMES ENDPOINTS
// ============================================

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
router.get('/', async (req, res) => {
    try {
        // Check cache first
        const cachedGames = await getCachedData(CACHE_KEYS.ALL_GAMES);
        if (cachedGames) {
            return res.json(cachedGames);
        }

        // Cache miss - fetch from DB
        const games = await Game.find().populate('ownerId', 'username email');
        
        // Store in cache for next request
        await setCacheData(CACHE_KEYS.ALL_GAMES, games, DEFAULT_TTL.ALL_GAMES);
        
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
router.post('/', async (req, res) => {
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

        
        // Invalidate ALL_GAMES cache since list changed
        await deleteCacheKey(CACHE_KEYS.ALL_GAMES);
        
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
 */   
 // Check cache first
        
router.get('/:id', async (req, res) => {
    try {
        const cachedGame = await getCachedData(CACHE_KEYS.GAME(req.params.id));
        if (cachedGame) {
            return res.json(cachedGame);
        }
        // Store in cache for next request
        await setCacheData(CACHE_KEYS.GAME(req.params.id), game, DEFAULT_TTL.SINGLE_GAME);
        
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
router.put('/:id', async (req, res) => {
    try {
        const { name, publisher, yearPublished, gamingSystem, condition, numberOfPreviousOwners, ownerId } = req.body;

        if (ownerId) {
            const owner = await User.findById(ownerId);
            if (!owner) {
                return res.status(400).json({ error: 'Owner user not found' });
        
        // Invalidate caches - individual game and all games list
        await deleteCacheKey(CACHE_KEYS.GAME(req.params.id));
        await deleteCacheKey(CACHE_KEYS.ALL_GAMES);
        
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
router.patch('/:id', async (req, res) => {
    try {
        const { name, publisher, yearPublished, gamingSystem, condition, numberOfPreviousOwners, ownerId } = req.body;

        if (ownerId) {
            const owner = await User.findById(ownerId);
            if (!owner) {
        
        // Invalidate caches - individual game and all games list
        await deleteCacheKey(CACHE_KEYS.GAME(req.params.id));
        await deleteCacheKey(CACHE_KEYS.ALL_GAMES);
        
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
        // Invalidate caches - individual game and all games list
        await deleteCacheKey(CACHE_KEYS.GAME(req.params.id));
        await deleteCacheKey(CACHE_KEYS.ALL_GAMES);
        
        
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
router.delete('/:id', async (req, res) => {
    try {
        const deletedGame = await Game.findByIdAndDelete(req.params.id);
        if (!deletedGame) return res.status(404).json({ error: 'Game not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;