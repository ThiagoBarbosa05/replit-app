import { db } from "../db";
import { clients } from "@shared/schema";
import { eq, ilike, or, and, count } from "drizzle-orm";
import type { Client, InsertClient } from "@shared/schema";

export class ClientRepository {
  async findAll(searchTerm?: string, status?: string): Promise<Client[]> {
    let query = db.select().from(clients);

    const conditions = [];

    // Search filter
    if (searchTerm && searchTerm.trim() !== "") {
      const search = `%${searchTerm.trim()}%`;
      conditions.push(
        or(
          ilike(clients.name, search),
          ilike(clients.cnpj, search),
          ilike(clients.contactName, search)
        )
      );
    }

    // Status filter
    if (status && status !== "all") {
      const isActive = status === "active" ? 1 : 0;
      conditions.push(eq(clients.isActive, isActive));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async findById(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async create(data: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(data).returning();
    return client;
  }

  async update(id: number, data: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set(data)
      .where(eq(clients.id, id))
      .returning();
    
    if (!client) throw new Error("Client not found");
    return client;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return (result.rowCount || 0) > 0;
  }

  async countActive(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.isActive, 1));
    return result.count;
  }
}