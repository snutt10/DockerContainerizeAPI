const express = require('express');
const Exchange = require('../models/Exchange');
const app = express();
app.use(express.json());

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
app.get('/', async (req, res) => {
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
