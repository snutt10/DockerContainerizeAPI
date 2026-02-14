const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'video-game-exchange-api',
    brokers: ['kafka:9092'],
});

const admin = kafka.admin();
const producer = kafka.producer();

const connectKafka = async () => {
    await producer.connect();
    await admin.connect();
    await admin.createTopics({
        topics: [
            {
                topic: 'user-events',
                numPartitions: 1,
                replicationFactor: 1,
            },
            {
                topic: 'game-events',
                numPartitions: 1,
                replicationFactor: 1,
            },
            {
                topic: 'offer-events',
                numPartitions: 1,
                replicationFactor: 1
            },
        ]
    });
    await admin.disconnect();

    console.log("Kafka connected");
};

module.exports = {
    producer, 
    connectKafka,
};