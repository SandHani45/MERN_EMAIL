const express = require("express");

const authRoutes = require("./auth.route");
const router = express.Router();

/**
 * GET /status
 */
router.get("/status", (req, res) => res.send("OK"));
/**
 * GET /docs
 */
router.use("/auth", authRoutes);
module.exports = router;