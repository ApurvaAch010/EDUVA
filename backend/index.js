import "dotenv/config";
import http from "http";
import app from "./src/config/express.config.js";
import { testDbConnection } from "./src/config/db.config.js";

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

server.listen(PORT, "127.0.0.1", async (err) => {
  if (!err) {
    console.log(`Server successfully started on port ${PORT}`);
    await testDbConnection();
  } else {
    console.error("Error starting server:", err);
  }
});