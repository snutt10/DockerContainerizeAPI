// Initialize MongoDB collections for CSC380 database
db = db.getSiblingDB('CSC380');

// Create games collection with schema validation
db.createCollection('games', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'publisher', 'yearPublished', 'gamingSystem', 'condition'],
            properties: {
                _id: { bsonType: 'objectId' },
                name: {
                    bsonType: 'string',
                    description: 'The name of the game'
                },
                publisher: {
                    bsonType: 'string',
                    description: 'The publisher of the game'
                },
                yearPublished: {
                    bsonType: 'int',
                    description: 'The year the game was published'
                },
                gamingSystem: {
                    bsonType: 'string',
                    description: 'The gaming system (PS4, Xbox, PC, etc.)'
                },
                condition: {
                    bsonType: 'string',
                    description: 'The condition of the game'
                },
                numberOfPreviousOwners: {
                    bsonType: ['int', 'null'],
                    description: 'Number of previous owners'
                },
                ownerId: {
                    bsonType: ['objectId', 'null'],
                    description: 'Reference to the user who owns this game'
                },
                createdAt: {
                    bsonType: 'date'
                },
                updatedAt: {
                    bsonType: 'date'
                }
            }
        }
    }
});

// Create users collection with schema validation
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['username', 'email'],
            properties: {
                _id: { bsonType: 'objectId' },
                username: {
                    bsonType: 'string',
                    description: 'The username'
                },
                email: {
                    bsonType: 'string',
                    description: 'The user email'
                },
                location: {
                    bsonType: ['string', 'null'],
                    description: 'User location'
                },
                joinedDate: {
                    bsonType: 'date',
                    description: 'When the user joined'
                },
                createdAt: {
                    bsonType: 'date'
                },
                updatedAt: {
                    bsonType: 'date'
                }
            }
        }
    }
});

// Create exchanges collection
db.createCollection('exchanges', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['initiatingUserId', 'targetUserId', 'gameOfferedId', 'gameRequestedId'],
            properties: {
                _id: { bsonType: 'objectId' },
                initiatingUserId: {
                    bsonType: 'objectId',
                    description: 'ID of user initiating the exchange'
                },
                targetUserId: {
                    bsonType: 'objectId',
                    description: 'ID of user receiving the exchange offer'
                },
                gameOfferedId: {
                    bsonType: 'objectId',
                    description: 'ID of game being offered'
                },
                gameRequestedId: {
                    bsonType: 'objectId',
                    description: 'ID of game being requested'
                },
                status: {
                    bsonType: 'string',
                    enum: ['pending', 'accepted', 'rejected', 'completed'],
                    description: 'Status of the exchange'
                },
                createdAt: {
                    bsonType: 'date'
                },
                completedAt: {
                    bsonType: ['date', 'null']
                },
                updatedAt: {
                    bsonType: 'date'
                }
            }
        }
    }
});

// Create indexes
db.games.createIndex({ ownerId: 1 });
db.games.createIndex({ name: 'text', publisher: 'text' });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 });
db.exchanges.createIndex({ initiatingUserId: 1 });
db.exchanges.createIndex({ targetUserId: 1 });
db.exchanges.createIndex({ status: 1 });

print('Collections created successfully in CSC380 database');
