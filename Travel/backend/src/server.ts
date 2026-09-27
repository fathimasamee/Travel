import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import prisma from "./config/prisma";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 TravelSphere API Server Running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`==================================================`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("\nInitiating graceful shutdown...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Database disconnected. Server closed cleanly.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
