const express = require('express');
const swaggerUi = require('swagger-ui-express');
const {setupSwagger} = require('./config/swagger');
const {swaggerOptions} = require('./config/swagger');
const swaggerJsdoc = require('swagger-jsdoc');
const { connectKafka } = require('./config/kafka');
const { connectDB } = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
connectKafka();
connectDB();

setupSwagger(app);
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// Front Endpoint
// ============================================
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

// app.use('/games', require('./routes/games'));
// app.use('/users', require('./routes/users'));
// app.use('/exchanges', require('./routes/exchanges'));

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
    console.log(`Game Exchange API is listening on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/swagger`);
});
