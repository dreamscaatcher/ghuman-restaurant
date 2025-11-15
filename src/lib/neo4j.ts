import neo4j, { Driver } from "neo4j-driver";

let driver: Driver | null = null;

function createDriver() {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !username || !password) {
    throw new Error("Missing Neo4j connection environment variables.");
  }

  return neo4j.driver(uri, neo4j.auth.basic(username, password), {
    maxConnectionPoolSize: 10,
  });
}

export function getNeo4jDriver() {
  if (driver) {
    return driver;
  }

  driver = createDriver();
  return driver;
}

export async function closeNeo4jDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

export async function verifyNeo4jConnection() {
  const neo4jDriver = getNeo4jDriver();
  await neo4jDriver.verifyConnectivity();
}

type QueryOptions = {
  database?: string;
};

export async function runQuery(
  query: string,
  params: Record<string, unknown> = {},
  options: QueryOptions = {},
) {
  const neo4jDriver = getNeo4jDriver();
  const database = options.database || process.env.NEO4J_DATABASE || "neo4j";
  return neo4jDriver.executeQuery(query, params, { database });
}
