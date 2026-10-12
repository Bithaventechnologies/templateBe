import { env } from "./config/env.js";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.port, async () => {
  console.log(`API running on http://localhost:${env.port}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
