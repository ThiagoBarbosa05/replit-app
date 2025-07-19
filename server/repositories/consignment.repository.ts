import { db } from "../db";
import { consignments, consignmentItems, clients, products } from "@shared/schema";
import { eq, sql, and, ilike, or, gte, lte } from "drizzle-orm";
import type { 
  Consignment, 
  InsertConsignment, 
  ConsignmentWithDetails,
  ConsignmentItem,
  InsertConsignmentItem 
} from "@shared/schema";

export class ConsignmentRepository {
  async findAll(
    searchTerm?: string, 
    status?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<ConsignmentWithDetails[]> {
    let query = db
      .select({
        id: consignments.id,
        clientId: consignments.clientId,
        date: consignments.date,
        status: consignments.status,
        totalValue: consignments.totalValue,
        client: clients,
      })
      .from(consignments)
      .leftJoin(clients, eq(consignments.clientId, clients.id));

    const conditions = [];

    // Search filter
    if (searchTerm && searchTerm.trim() !== "") {
      const search = `%${searchTerm.trim()}%`;
      conditions.push(
        or(
          ilike(clients.name, search),
          ilike(clients.cnpj, search)
        )
      );
    }

    // Status filter
    if (status && status !== "all") {
      conditions.push(eq(consignments.status, status));
    }

    // Date range filters
    if (startDate) {
      conditions.push(gte(consignments.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(consignments.date, endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const consignmentRows = await query;

    // Get items for each consignment
    const consignmentsWithItems = await Promise.all(
      consignmentRows.map(async (row) => {
        const items = await this.getConsignmentItems(row.id);
        return {
          id: row.id,
          clientId: row.clientId,
          date: row.date,
          status: row.status,
          totalValue: row.totalValue,
          client: row.client!,
          items,
        };
      })
    );

    return consignmentsWithItems;
  }

  async findById(id: number): Promise<ConsignmentWithDetails | undefined> {
    const [consignmentRow] = await db
      .select({
        id: consignments.id,
        clientId: consignments.clientId,
        date: consignments.date,
        status: consignments.status,
        totalValue: consignments.totalValue,
        client: clients,
      })
      .from(consignments)
      .leftJoin(clients, eq(consignments.clientId, clients.id))
      .where(eq(consignments.id, id));

    if (!consignmentRow) return undefined;

    const items = await this.getConsignmentItems(id);

    return {
      id: consignmentRow.id,
      clientId: consignmentRow.clientId,
      date: consignmentRow.date,
      status: consignmentRow.status,
      totalValue: consignmentRow.totalValue,
      client: consignmentRow.client!,
      items,
    };
  }

  private async getConsignmentItems(consignmentId: number) {
    const items = await db
      .select({
        id: consignmentItems.id,
        consignmentId: consignmentItems.consignmentId,
        productId: consignmentItems.productId,
        quantity: consignmentItems.quantity,
        unitPrice: consignmentItems.unitPrice,
        product: products,
      })
      .from(consignmentItems)
      .leftJoin(products, eq(consignmentItems.productId, products.id))
      .where(eq(consignmentItems.consignmentId, consignmentId));

    return items
      .filter((item) => item.product)
      .map((item) => ({
        id: item.id,
        consignmentId: item.consignmentId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        product: item.product!,
      }));
  }

  async create(data: InsertConsignment & { items: InsertConsignmentItem[] }): Promise<ConsignmentWithDetails> {
    // Calculate total value
    const totalValue = data.items
      .reduce(
        (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
        0,
      )
      .toFixed(2);

    // Create consignment
    const [consignment] = await db
      .insert(consignments)
      .values({
        clientId: data.clientId,
        totalValue,
      })
      .returning();

    // Create consignment items
    if (data.items.length > 0) {
      await db.insert(consignmentItems).values(
        data.items.map((item) => ({
          ...item,
          consignmentId: consignment.id,
        })),
      );
    }

    const result = await this.findById(consignment.id);
    if (!result) throw new Error("Failed to create consignment");
    return result;
  }

  async update(id: number, data: Partial<InsertConsignment>): Promise<Consignment> {
    const [updated] = await db
      .update(consignments)
      .set(data)
      .where(eq(consignments.id, id))
      .returning();

    if (!updated) throw new Error("Consignment not found");
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    // Delete associated items first
    await db
      .delete(consignmentItems)
      .where(eq(consignmentItems.consignmentId, id));

    // Delete consignment
    const result = await db.delete(consignments).where(eq(consignments.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getTotalConsignedValue(): Promise<string> {
    const [result] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${consignments.totalValue} AS DECIMAL)), 0)`,
      })
      .from(consignments);
    
    return result.total;
  }

  async getItemsByConsignmentId(consignmentId: number): Promise<ConsignmentItem[]> {
    return await db
      .select()
      .from(consignmentItems)
      .where(eq(consignmentItems.consignmentId, consignmentId));
  }
}