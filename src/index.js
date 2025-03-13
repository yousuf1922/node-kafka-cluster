require("dotenv").config();
const cluster = require("cluster");
const os = require("os");
const app = require("./app");
const { connectProducer } = require("./services/kafkaProducerService");
const { runConsumer } = require("./services/kafkaConsumerService");
const logger = require("./utils/logger");

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    logger.info(`Master ${process.pid} is running`);

    // Map to store worker types by their IDs
    const workerTypes = {};

    // Fork 2 HTTP workers
    for (let i = 0; i < 2; i++) {
        const worker = cluster.fork({ WORKER_TYPE: "http" });
        workerTypes[worker.id] = "http";
    }

    // Fork 4 consumer workers
    for (let i = 0; i < 4; i++) {
        const worker = cluster.fork({ WORKER_TYPE: "consumer" });
        workerTypes[worker.id] = "consumer";
    }

    // Handle worker exit and restart
    cluster.on("exit", (worker, code, signal) => {
        const workerType = workerTypes[worker.id];
        logger.warn(`Worker ${worker.process.pid} (type: ${workerType}) died with code ${code}. Restarting...`);
        const newWorker = cluster.fork({ WORKER_TYPE: workerType });
        workerTypes[newWorker.id] = workerType; // Track the new worker
    });
} else {
    const workerType = process.env.WORKER_TYPE;

    if (workerType === "http") {
        // HTTP worker: Start Express server
        const port = process.env.PORT || 3200;
        connectProducer()
            .then(() => {
                app.listen(port, () => {
                    logger.info(`HTTP Worker ${process.pid} listening on port ${port}`);
                });
            })
            .catch((err) => {
                logger.error(`Producer connection failed: ${err.message}`);
                process.exit(1);
            });
    } else if (workerType === "consumer") {
        // Kafka consumer worker
        // logger.info(`Consumer Worker ${process.pid} does not started`);
        runConsumer().catch((err) => {
            logger.error(`Consumer failed: ${err.message}`);
            process.exit(1);
        });
        logger.info(`Consumer Worker ${process.pid} started`);
    }
}
