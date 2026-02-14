const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const PORT = process.env.PORT || 3000;


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
                CreateGame: {
                    type: 'object',
                    required: ['name', 'publisher', 'yearPublished', 'gamingSystem', 'condition'],
                    properties: {
                        name: { type: 'string' },
                        publisher: { type: 'string' },
                        yearPublished: { type: 'integer' },
                        gamingSystem: { type: 'string' },
                        condition: { type: 'string' },
                        numberOfPreviousOwners: { type: 'integer', nullable: true },
                        ownerId: { type: 'string', nullable: true }
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
                    }
                },
                CreateUser: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        username: { type: 'string' },
                        email: { type: 'string' },
                        password: { type: 'string' }
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
    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app) => {
    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;