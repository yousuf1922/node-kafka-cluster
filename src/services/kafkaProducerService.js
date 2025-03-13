const { Kafka } = require("kafkajs");
const logger = require("../utils/logger");

const kafka = new Kafka({
    clientId: "job-producer",
    brokers: process.env.KAFKA_BROKERS.split(","),
});

const producer = kafka.producer({
    acks: -1, // All brokers must acknowledge
});

const connectProducer = async () => {
    await producer.connect();
    logger.info("Kafka Producer connected");
};

const sendJob = async (job) => {
    try {
        await producer.send({
            topic: process.env.KAFKA_TOPIC,
            messages: [{ value: JSON.stringify(job) }],
        });
        logger.info(`Job sent to Kafka: ${JSON.stringify(job)}`);
    } catch (error) {
        logger.error(`Error sending job to Kafka: ${error.message}`);
        throw error;
    }
};

module.exports = { connectProducer, sendJob };
