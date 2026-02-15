const express = require('express');
const swaggerUi = require('swagger-ui-express');
const {setupSwagger} = require('./config/swagger');
const {swaggerOptions} = require('./config/swagger');
const swaggerJsdoc = require('swagger-jsdoc');
//const { consumer } = require('./config/kafka');
const { connectDB } = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
//consumer();
connectDB();

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

app.listen(PORT, () => {
    console.log(`Game Exchange API is listening on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/swagger`);
});
