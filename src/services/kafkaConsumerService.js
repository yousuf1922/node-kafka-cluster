const { Kafka } = require("kafkajs");
const logger = require("../utils/logger");
const { processJob } = require("./jobProcessingService");

// Initialize Kafka client
const kafka = new Kafka({
    clientId: "job-consumer",
    brokers: process.env.KAFKA_BROKERS.split(","),
});

// Create admin and consumer instances
const admin = kafka.admin();
const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });
const topic = process.env.KAFKA_TOPIC;

// Function to ensure the topic exists
async function ensureTopicExists() {
    try {
        await admin.connect();
        const topics = await admin.listTopics();
        if (!topics.includes(topic)) {
            await admin.createTopics({
                topics: [
                    {
                        topic,
                        numPartitions: 8, // Adjust based on your needs
                        replicationFactor: 3, // Adjust based on your Kafka setup
                    },
                ],
            });
            logger.info(`Topic "${topic}" created. Waiting for propagation...`);
            // Wait 20 seconds for topic metadata to propagate
            await new Promise((resolve) => setTimeout(resolve, 20000));
        } else {
            logger.info(`Topic "${topic}" already exists.`);
        }
        await admin.disconnect();
    } catch (error) {
        logger.error(`Failed to ensure topic exists: ${error.message}`);
        throw error;
    }
}

// Function to run the consumer
async function runConsumer() {
    try {
        // Ensure the topic exists before starting the consumer
        await ensureTopicExists();

        // Connect and subscribe to the topic
        await consumer.connect();
        await consumer.subscribe({
            topic: process.env.KAFKA_TOPIC,
            fromBeginning: true,
        });
        logger.info("Kafka Consumer connected");

        // Process messages
        await consumer.run({
            autoCommit: false,
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const job = JSON.parse(message.value.toString());
                    await processJob(job);
                    await consumer.commitOffsets([{ topic, partition, offset: (parseInt(message.offset, 10) + 1).toString() }]);
                    logger.info(`Job processed and offset committed: ${message.offset}`);
                } catch (error) {
                    logger.error(`Error processing message: ${error.message}`);
                }
            },
        });
    } catch (error) {
        logger.error(`Consumer failed: ${error.message}`);
        process.exit(1);
    }
}

module.exports = { runConsumer };
