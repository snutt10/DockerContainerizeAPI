const { Kafka } = require('kafkajs');
const brokers = process.env.KAFKA_BROKER || 'localhost:9092';

const kafka = new Kafka({
    clientId: 'email-service',
    brokers: [brokers],
});

const consumer = kafka.consumer({ groupId: 'email-group' });

module.exports = { consumer };