import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

import { runQuery } from "../lib/neo4j";

export type CustomerProfile = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  favoriteDish?: string | null;
  createdAt?: string | null;
};

type UserNode = {
  properties: Record<string, unknown>;
};

function mapNode(node?: UserNode | null): CustomerProfile | null {
  if (!node) return null;
  const props = node.properties || {};
  return {
    id: String(props.id ?? ""),
    email: String(props.email ?? ""),
    name: String(props.name ?? ""),
    phone: props.phone ? String(props.phone) : null,
    favoriteDish: props.favoriteDish ? String(props.favoriteDish) : null,
    createdAt: props.createdAt ? String(props.createdAt) : null,
  };
}

export async function findCustomerByEmail(email: string) {
  const result = await runQuery(
    `
      MATCH (user:Customer { email: $email })
      RETURN user
    `,
    { email: email.toLowerCase() },
  );
  const node = result.records[0]?.get("user") as UserNode | undefined;
  return mapNode(node);
}

export async function findCustomerAuthByEmail(email: string) {
  const result = await runQuery(
    `
      MATCH (user:Customer { email: $email })
      RETURN user
    `,
    { email: email.toLowerCase() },
  );
  const node = result.records[0]?.get("user") as UserNode | undefined;
  if (!node) return null;
  return {
    id: String(node.properties.id ?? ""),
    email: String(node.properties.email ?? ""),
    name: String(node.properties.name ?? ""),
    passwordHash: String(node.properties.passwordHash ?? ""),
  };
}

export async function createCustomer(input: {
  email: string;
  name: string;
  password: string;
}) {
  const existing = await findCustomerByEmail(input.email);
  if (existing) {
    throw new Error("Email already registered.");
  }

  const id = randomUUID();
  const passwordHash = await bcrypt.hash(input.password, 12);

  const result = await runQuery(
    `
      CREATE (user:Customer {
        id: $id,
        email: $email,
        name: $name,
        passwordHash: $passwordHash,
        createdAt: datetime()
      })
      RETURN user
    `,
    {
      id,
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
    },
  );

  const node = result.records[0]?.get("user") as UserNode | undefined;
  return mapNode(node);
}

export async function updateCustomerProfile(id: string, data: Partial<CustomerProfile>) {
  const result = await runQuery(
    `
      MATCH (user:Customer { id: $id })
      SET user.name = $name,
          user.phone = $phone,
          user.favoriteDish = $favoriteDish,
          user.updatedAt = datetime()
      RETURN user
    `,
    {
      id,
      name: data.name,
      phone: data.phone ?? null,
      favoriteDish: data.favoriteDish ?? null,
    },
  );

  const node = result.records[0]?.get("user") as UserNode | undefined;
  return mapNode(node);
}

export async function getCustomerById(id: string) {
  const result = await runQuery(
    `
      MATCH (user:Customer { id: $id })
      RETURN user
    `,
    { id },
  );

  const node = result.records[0]?.get("user") as UserNode | undefined;
  return mapNode(node);
}
