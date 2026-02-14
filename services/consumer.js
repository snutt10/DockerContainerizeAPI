const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'email-service',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'email-group' });

module.exports = { consumer };