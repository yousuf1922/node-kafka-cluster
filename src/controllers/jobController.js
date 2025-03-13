const { sendJob } = require("../services/kafkaProducerService");
const logger = require("../utils/logger");

const createJob = async (req, res) => {
    try {
        const { jobType, data } = req.body;
        if (!jobType || !data) {
            return res.status(400).json({ error: "jobType and data are required" });
        }

        const job = { jobType, data };
        await sendJob(job);
        res.status(202).json({ message: "Job queued successfully" });
    } catch (error) {
        logger.error(`Error in createJob: ${error.message}`);
        res.status(500).json({ error: "Failed to queue job" });
    }
};

module.exports = { createJob };
