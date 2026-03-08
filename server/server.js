require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming: ${req.method} ${req.originalUrl} - Headers: ${JSON.stringify(req.headers)}`);
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
  console.log("Root route hit!");
  res.json({ message: "Classivo API is running", health: "/api/health" });
});

app.get("/api/test-direct", (req, res) => {
  console.log("[DEBUG] Test direct route hit!");
  res.json({ ok: true, version: "V3" });
});

app.post("/api/auth/test", (req, res) => {
  console.log("[DEBUG] Auth test route hit!");
  res.json({ ok: true, message: "Auth route is accessible" });
});

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/departments", require("./src/routes/departments"));
app.use("/api/classes", require("./src/routes/classes"));
app.use("/api/subjects", require("./src/routes/subjects"));
app.use("/api/students", require("./src/routes/students"));
app.use("/api/volunteers", require("./src/routes/volunteers"));
app.use("/api/files", require("./src/routes/files"));
app.use("/api/attendance", require("./src/routes/attendance"));
app.use("/api/messages", require("./src/routes/messages"));
app.use("/api/queries", require("./src/routes/queries"));
app.use("/api/notifications", require("./src/routes/notifications"));
app.use("/api/admin", require("./src/routes/admin"));
app.use("/api/announcements", require("./src/routes/announcements"));
app.use("/api/ai", require("./src/routes/aiRoutes"));
app.use("/api/resources", require("./src/routes/resourceRoutes"));
app.use("/api/dashboard", require("./src/routes/dashboardRoutes"));

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", time: new Date() }),
);

// 404
app.use((req, res) => {
  console.log(`[DEBUG] 404 Not Found at Final Catch-all: ${req.method} ${req.originalUrl || req.url}`);
  res.status(404).json({ error: "Route not found", requestedPath: req.originalUrl || req.url });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`🚀 Classivo server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  }
}

main();
