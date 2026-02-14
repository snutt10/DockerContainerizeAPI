const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const app = express();
app.use(express.json());
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
app.get('/', async (req, res) => {
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

        if (password !== undefined){
            await producer.send({
                topic: 'user-events',
                messages: [
                    {
                    value: JSON.stringify({
                        eventType: 'PASSWORD_CHANGED',
                        userId: updatedUser._id,
                        timestamp: new Date().toISOString()
                    })
                    }
                ]
            });
        }

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