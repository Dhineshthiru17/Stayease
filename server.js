require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const reviewRoutes = require("./routes/ReviewRoutes");
const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingroutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const authMiddleware = require("./middleware/auth");

const app = express();

connectDB();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (
        process.env.NODE_ENV !== "production" ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked: origin not allowed"));
    },
    credentials: true
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("StayEase API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (allowedOrigins.length > 0) {
    console.log(`CORS allowlist: ${allowedOrigins.join(", ")}`);
  }
});
