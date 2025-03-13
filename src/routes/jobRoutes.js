const express = require("express");
const { createJob } = require("../controllers/jobController");

const router = express.Router();

router.post("/jobs", createJob);

module.exports = router;
