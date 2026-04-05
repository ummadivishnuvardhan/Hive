const express = require("express");
const router = express.Router();
const companionController = require("../controllers/companionController");

// Path maps to GET /cpnlt via server.js
router.get("/", companionController.getAllCompanions);

// Path maps to POST /cpnlt via server.js
router.post("/", companionController.createCompanion);

// Path maps to GET /cpnlt/:companion_id via server.js
router.get("/:companion_id", companionController.getCompanionDetails);

module.exports = router;
