const rateLimiter = require("express-rate-limit");

const limiter = rateLimiter({
  max: 3, // Max 3 requests
  windowMs: 3 * 60 * 1000, // 3 minutes (3 * 60 seconds * 1000 milliseconds)
  onLimitReached: (req, res) => {
    // Optionally, you can log or handle something here when the limit is reached
  },
  handler: (req, res) => {
    const remainingTime = req.rateLimit.resetTime - Date.now(); // Time left in ms
    const minutesLeft = Math.ceil(remainingTime / 1000 / 60); // Convert to minutes
    const message = `Wait for ${minutesLeft} minute${
      minutesLeft > 1 ? "s" : ""
    }`; // Dynamic message

    res.status(429).json({ error: message }); // 429 is Too Many Requests
  },
});

module.exports = limiter;
