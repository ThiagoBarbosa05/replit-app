import { db } from "../db";
import { stockCounts } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
import type { StockCount, InsertStockCount } from "@shared/schema";

export class StockCountRepository {
  async findAll(clientId?: number): Promise<StockCount[]> {
    if (clientId) {
      return await db
        .select()
        .from(stockCounts)
        .where(eq(stockCounts.clientId, clientId));
    }
    return await db.select().from(stockCounts);
  }

  async findById(id: number): Promise<StockCount | undefined> {
    const [stockCount] = await db.select().from(stockCounts).where(eq(stockCounts.id, id));
    return stockCount;
  }

  async create(data: InsertStockCount): Promise<StockCount> {
    const quantitySold = data.quantitySent - data.quantityRemaining;
    const totalSold = (quantitySold * parseFloat(data.unitPrice)).toFixed(2);

    const [stockCount] = await db
      .insert(stockCounts)
      .values({
        ...data,
        quantitySold,
        totalSold,
      })
      .returning();

    return stockCount;
  }

  async update(id: number, data: Partial<InsertStockCount>): Promise<StockCount> {
    const [existing] = await db
      .select()
      .from(stockCounts)
      .where(eq(stockCounts.id, id));
    
    if (!existing) throw new Error("Stock count not found");

    // Calculate derived fields if necessary
    const updateData: any = { ...data };
    if (
      data.quantityRemaining !== undefined ||
      data.quantitySent !== undefined
    ) {
      const quantitySent = data.quantitySent ?? existing.quantitySent;
      const quantityRemaining = data.quantityRemaining ?? existing.quantityRemaining;
      const unitPrice = data.unitPrice ?? existing.unitPrice;

      updateData.quantitySold = quantitySent - quantityRemaining;
      updateData.totalSold = (
        updateData.quantitySold * parseFloat(unitPrice)
      ).toFixed(2);
    }

    const [updated] = await db
      .update(stockCounts)
      .set(updateData)
      .where(eq(stockCounts.id, id))
      .returning();

    if (!updated) throw new Error("Failed to update stock count");
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(stockCounts).where(eq(stockCounts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async findByConsignmentAndProduct(
    clientId: number, 
    productId: number, 
    consignmentId: number
  ): Promise<StockCount[]> {
    return await db
      .select()
      .from(stockCounts)
      .where(
        and(
          eq(stockCounts.clientId, clientId),
          eq(stockCounts.productId, productId),
          eq(stockCounts.consignmentId, consignmentId)
        )
      );
  }

  async getTotalSalesValue(): Promise<string> {
    const [result] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${stockCounts.totalSold} AS DECIMAL)), 0)`,
      })
      .from(stockCounts);
    
    return result.total;
  }

  async bulkCreate(stockCounts: (InsertStockCount & { quantitySold: number; totalSold: string })[]): Promise<void> {
    if (stockCounts.length > 0) {
      await db.insert(stockCounts).values(stockCounts);
    }
  }
}