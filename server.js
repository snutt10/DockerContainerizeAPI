const express = require('express');
const client = require('prom-client');
const swaggerUi = require('swagger-ui-express');
const {setupSwagger} = require('./config/swagger');
const {swaggerOptions} = require('./config/swagger');
const swaggerJsdoc = require('swagger-jsdoc');
const { connectDB } = require('./config/db');
const { connectKafka } = require('./config/producer');
const app = express();
const register = new client.Registry();
const PORT = process.env.PORT || 3000;

client.collectDefaultMetrics({ register });

const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
});
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
    const end = httpDuration.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.route ? req.route.path : req.path, status_code: res.statusCode });
    });
    next();
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        res.status(500).end(error);
    }
});
// ============================================
// START SERVER
// ============================================
startServer();