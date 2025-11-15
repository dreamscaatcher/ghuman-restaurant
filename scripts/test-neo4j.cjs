#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const neo4j = require("neo4j-driver");

async function main() {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !username || !password) {
    throw new Error("Missing Neo4j environment variables.");
  }

  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const result = await driver.executeQuery("RETURN 'Aura connected' AS message");
  console.log(result.records[0].get("message"));
  await driver.close();
}

main().catch(async (err) => {
  console.error("Neo4j connection failed:", err);
  process.exit(1);
});
