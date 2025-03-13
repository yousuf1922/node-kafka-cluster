const logger = require("../utils/logger");

const jobHandlers = {
    sendEmail: async (data) => {
        logger.info(`Sending email to ${data.to} with subject: ${data.subject}`);
        // Simulate email sending
        await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    processData: async (data) => {
        logger.info(`Processing data: ${JSON.stringify(data)}`);
        // Simulate data processing
        await new Promise((resolve) => setTimeout(resolve, 1000));
    },
};

const processJob = async (job) => {
    const { jobType, data } = job;
    const handler = jobHandlers[jobType];
    if (!handler) {
        throw new Error(`Unknown job type: ${jobType}`);
    }
    await handler(data);
};

module.exports = { processJob };
