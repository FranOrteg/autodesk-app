const express = require("express");
const router = express.Router();
const { uploadModelToVectorStore } = require("../../controllers/vectorStore.controller");

router.post('/upload', uploadModelToVectorStore);

module.exports = router;