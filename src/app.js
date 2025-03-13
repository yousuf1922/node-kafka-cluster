const express = require("express");
const jobRoutes = require("./routes/jobRoutes");
const logger = require("./utils/logger");

const app = express();

app.use(express.json());
app.use("/api", jobRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
