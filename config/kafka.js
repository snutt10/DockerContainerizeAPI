const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'video-game-exchange-api',
    brokers: ['kafka:9092'],
});

const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
    console.log("Kafka connected");
};

module.exports = {
    producer, 
    connectProducer,
}