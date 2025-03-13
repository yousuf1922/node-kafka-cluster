require("dotenv").config();
const { runConsumer } = require("./services/kafkaConsumerService");
const logger = require("./utils/logger");

runConsumer()
    .then(() => {
        logger.info("Kafka Consumer process started");
    })
    .catch((err) => {
        logger.error(`Consumer process failed: ${err.message}`);
        process.exit(1);
    });
