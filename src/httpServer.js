require("dotenv").config();
const express = require("express");
const jobRoutes = require("./routes/jobRoutes");
const { connectProducer } = require("./services/kafkaProducerService");
const logger = require("./utils/logger");

const app = express();
app.use(express.json());
app.use("/api", jobRoutes);

app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 3300;

connectProducer()
    .then(() => {
        app.listen(port, () => {
            logger.info(`HTTP Server listening on port ${port}`);
        });
    })
    .catch((err) => {
        logger.error(`Producer connection failed: ${err.message}`);
        process.exit(1);
    });
