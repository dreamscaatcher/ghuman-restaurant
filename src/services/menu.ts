import { randomUUID } from "node:crypto";
import neo4j from "neo4j-driver";

import { runQuery } from "../lib/neo4j";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  photoUrl?: string | null;
  price?: number | null;
  createdAt?: string | null;
};

export type KitchenTicketStatus = "queued" | "prepping" | "completed";

export const KITCHEN_TICKET_STATUSES: KitchenTicketStatus[] = ["queued", "prepping", "completed"];

export type KitchenTicket = {
  id: string;
  status: KitchenTicketStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
  completedAt?: string | null;
  quantity: number;
  item: MenuItem;
};

const databaseOption = { database: process.env.NEO4J_DATABASE || "neo4j" };

function toIso(value: unknown) {
  if (neo4j.isDateTime(value)) {
    return value.toStandardDate().toISOString();
  }
  return null;
}

export async function createMenuItem(input: {
  name: string;
  description: string;
  photoUrl?: string;
  price: number;
}) {
  const id = randomUUID();

  const result = await runQuery(
    `
      CREATE (item:MenuItem {
        id: $id,
        name: $name,
        description: $description,
        photoUrl: $photoUrl,
        price: $price,
        createdAt: datetime()
      })
      RETURN item
    `,
    { id, ...input },
    databaseOption,
  );

  const record = result.records[0];
  const itemNode = record.get("item");

  return {
    id,
    item: {
      id,
      name: itemNode.properties.name,
      description: itemNode.properties.description,
      photoUrl: itemNode.properties.photoUrl,
      price: neo4j.isInt(itemNode.properties.price)
        ? itemNode.properties.price.toNumber()
        : itemNode.properties.price,
      createdAt: toIso(itemNode.properties.createdAt),
    },
  };
}

export async function updateMenuItem(input: {
  id: string;
  name: string;
  description: string;
  photoUrl?: string;
  price: number;
}) {
  const result = await runQuery(
    `
      MATCH (item:MenuItem { id: $id })
      SET item.name = $name,
          item.description = $description,
          item.photoUrl = $photoUrl,
          item.price = $price,
          item.updatedAt = datetime()
      RETURN item
    `,
    input,
    databaseOption,
  );

  if (result.records.length === 0) {
    throw new Error("Menu item not found");
  }

  const itemNode = result.records[0].get("item");

  return {
    id: itemNode.properties.id,
    name: itemNode.properties.name,
    description: itemNode.properties.description,
    photoUrl: itemNode.properties.photoUrl,
    price: neo4j.isInt(itemNode.properties.price)
      ? itemNode.properties.price.toNumber()
      : itemNode.properties.price,
    createdAt: toIso(itemNode.properties.createdAt),
    updatedAt: toIso(itemNode.properties.updatedAt),
  };
}

export async function listMenuItems(): Promise<MenuItem[]> {
  const result = await runQuery(
    `
      MATCH (item:MenuItem)
      RETURN item
      ORDER BY item.createdAt DESC
    `,
    {},
    databaseOption,
  );

  return result.records.map((record) => {
    const itemNode = record.get("item");
    return {
      id: itemNode.properties.id,
      name: itemNode.properties.name,
      description: itemNode.properties.description,
      photoUrl: itemNode.properties.photoUrl,
      price: neo4j.isInt(itemNode.properties.price)
        ? itemNode.properties.price.toNumber()
        : itemNode.properties.price,
      createdAt: toIso(itemNode.properties.createdAt),
    };
  });
}

export async function listKitchenTickets(): Promise<KitchenTicket[]> {
  const result = await runQuery(
    `
      MATCH (ticket:KitchenTicket)-[:FOR_ITEM]->(item:MenuItem)
      RETURN ticket, item
      ORDER BY ticket.createdAt ASC
    `,
    {},
    databaseOption,
  );

  return result.records.map((record) => {
    const ticketNode = record.get("ticket");
    const itemNode = record.get("item");
    const quantityValue = ticketNode.properties.quantity;
    const quantity = neo4j.isInt(quantityValue)
      ? quantityValue.toNumber()
      : typeof quantityValue === "number"
        ? quantityValue
        : 1;
    return {
      id: ticketNode.properties.id,
      status: ticketNode.properties.status as KitchenTicketStatus,
      createdAt: toIso(ticketNode.properties.createdAt),
      updatedAt: toIso(ticketNode.properties.updatedAt),
      completedAt: toIso(ticketNode.properties.completedAt),
      quantity,
      item: {
        id: itemNode.properties.id,
        name: itemNode.properties.name,
        description: itemNode.properties.description,
        photoUrl: itemNode.properties.photoUrl,
        price: neo4j.isInt(itemNode.properties.price)
          ? itemNode.properties.price.toNumber()
          : itemNode.properties.price,
        createdAt: toIso(itemNode.properties.createdAt),
      },
    };
  });
}

export async function updateKitchenTicketStatus(id: string, status: KitchenTicketStatus) {
  const result = await runQuery(
    `
      MATCH (ticket:KitchenTicket { id: $id })
      SET ticket.status = $status,
          ticket.updatedAt = datetime(),
          ticket.completedAt = CASE WHEN $status = 'completed' THEN datetime() ELSE ticket.completedAt END
      RETURN ticket
    `,
    { id, status },
    databaseOption,
  );

  if (result.records.length === 0) {
    throw new Error("Kitchen ticket not found");
  }

  const ticketNode = result.records[0].get("ticket");
  return {
    id: ticketNode.properties.id,
    status: ticketNode.properties.status as KitchenTicketStatus,
    createdAt: toIso(ticketNode.properties.createdAt),
    updatedAt: toIso(ticketNode.properties.updatedAt),
    completedAt: toIso(ticketNode.properties.completedAt),
  };
}

export async function listOrderTickets(orderId: string): Promise<KitchenTicket[]> {
  const result = await runQuery(
    `
      MATCH (ticket:KitchenTicket { orderId: $orderId })-[:FOR_ITEM]->(item:MenuItem)
      RETURN ticket, item
      ORDER BY ticket.createdAt ASC
    `,
    { orderId },
    databaseOption,
  );

  return result.records.map((record) => {
    const ticketNode = record.get("ticket");
    const itemNode = record.get("item");
    const quantityValue = ticketNode.properties.quantity;
    const quantity = neo4j.isInt(quantityValue)
      ? quantityValue.toNumber()
      : typeof quantityValue === "number"
        ? quantityValue
        : 1;
    return {
      id: ticketNode.properties.id,
      status: ticketNode.properties.status as KitchenTicketStatus,
      createdAt: toIso(ticketNode.properties.createdAt),
      updatedAt: toIso(ticketNode.properties.updatedAt),
      completedAt: toIso(ticketNode.properties.completedAt),
      quantity,
      item: {
        id: itemNode.properties.id,
        name: itemNode.properties.name,
        description: itemNode.properties.description,
        photoUrl: itemNode.properties.photoUrl,
        price: neo4j.isInt(itemNode.properties.price)
          ? itemNode.properties.price.toNumber()
          : itemNode.properties.price,
        createdAt: toIso(itemNode.properties.createdAt),
      },
    };
  });
}

export async function createOrderTickets(items: Array<{ id: string; quantity: number }>) {
  if (!items.length) return { orderId: "", tickets: [] };

  const orderId = randomUUID();
  const itemsWithTicket = items.map((item) => ({
    ...item,
    ticketId: `KT-${Math.floor(1000 + Math.random() * 9000)}`,
  }));

  const result = await runQuery(
    `
      UNWIND $items AS ordered
      MATCH (menu:MenuItem { id: ordered.id })
      CREATE (ticket:KitchenTicket {
        id: ordered.ticketId,
        status: 'queued',
        quantity: ordered.quantity,
        orderId: $orderId,
        createdAt: datetime()
      })
      CREATE (ticket)-[:FOR_ITEM]->(menu)
      RETURN ticket, menu
    `,
    { items: itemsWithTicket, orderId },
    databaseOption,
  );

  const tickets = result.records.map((record) => {
    const ticketNode = record.get("ticket");
    const menuNode = record.get("menu");
    const quantityValue = ticketNode.properties.quantity;
    const quantity = neo4j.isInt(quantityValue)
      ? quantityValue.toNumber()
      : typeof quantityValue === "number"
        ? quantityValue
        : 1;
    return {
      id: ticketNode.properties.id,
      quantity,
      status: ticketNode.properties.status as KitchenTicketStatus,
      createdAt: toIso(ticketNode.properties.createdAt),
      item: {
        id: menuNode.properties.id,
        name: menuNode.properties.name,
      },
    };
  });

  return { orderId, tickets };
}
