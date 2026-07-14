import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { Server } from "socket.io";
import { setIo } from "./sockets/index.js";

import v1Routes from './routes/v1.js';
import { errorHandler } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" } // Note: configure appropriately in prod
  });

  setIo(io);

  app.use(express.json());
  app.use(cookieParser());

  // Mount API V1 routes
  app.use('/api/v1', v1Routes);

  // Simple health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(errorHandler);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
