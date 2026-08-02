import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema/typeDefs/index.js";
import { resolvers } from "./schema/resolvers/index.js";
import { createContext } from "./auth/context.js";
import { initializeDatabase } from "./db/schema.js";
import db from "./db/connection.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

async function start(): Promise<void> {
  initializeDatabase();

  const row = db.prepare("SELECT COUNT(*) as count FROM employees").get() as {
    count: number;
  };
  if (row.count === 0) {
    console.log("No data found. Please run: pnpm db:seed");
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    context: createContext,
    listen: { port: PORT },
  });

  console.log(`\n Server is ready at ${url}`);
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down...");
  db.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("\nShutting down...");
  db.close();
  process.exit(0);
});
