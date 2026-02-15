const express = require('express');
const swaggerUi = require('swagger-ui-express');
const {setupSwagger} = require('./config/swagger');
const {swaggerOptions} = require('./config/swagger');
const swaggerJsdoc = require('swagger-jsdoc');
const { connectDB } = require('./config/db');
const { connectKafka } = require('./config/producer');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

const startServer = async () => {
    try {
        await connectDB();
        await connectKafka();  // ✓ Connect to Kafka
        
        console.log('Database and Kafka connected successfully');
        
        // Start server after connections are ready
        app.listen(PORT, () => {
            console.log(`Game Exchange API is listening on port ${PORT}`);
            console.log(`Swagger UI available at http://localhost:${PORT}/swagger`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

setupSwagger(app);
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// Front Endpoint
// ============================================

app.use('/games', require('./routes/games'));
app.use('/users', require('./routes/user'));
app.use('/exchanges', require('./routes/exchange'));

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
startServer();

app.listen(PORT, () => {
    console.log(`Game Exchange API is listening on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/swagger`);
});
