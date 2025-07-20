import { db } from "../db";
import { clientStock, products, clients, type ClientStock, type InsertClientStock } from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export class ClientStockRepository {
  async getClientStock(clientId: number): Promise<(ClientStock & { product: any; client: any })[]> {
    return await db
      .select({
        id: clientStock.id,
        clientId: clientStock.clientId,
        productId: clientStock.productId,
        quantity: clientStock.quantity,
        lastUpdated: clientStock.lastUpdated,
        minimumAlert: clientStock.minimumAlert,
        product: {
          id: products.id,
          name: products.name,
          country: products.country,
          type: products.type,
          unitPrice: products.unitPrice,
          volume: products.volume,
          photo: products.photo,
        },
        client: {
          id: clients.id,
          name: clients.name,
          cnpj: clients.cnpj,
          address: clients.address,
          phone: clients.phone,
          contactName: clients.contactName,
          isActive: clients.isActive,
        }
      })
      .from(clientStock)
      .leftJoin(products, eq(clientStock.productId, products.id))
      .leftJoin(clients, eq(clientStock.clientId, clients.id))
      .where(eq(clientStock.clientId, clientId))
      .orderBy(desc(clientStock.lastUpdated));
  }

  async getProductStock(clientId: number, productId: number): Promise<ClientStock | undefined> {
    const [stock] = await db
      .select()
      .from(clientStock)
      .where(and(eq(clientStock.clientId, clientId), eq(clientStock.productId, productId)));
    return stock || undefined;
  }

  async updateStock(clientId: number, productId: number, quantity: number): Promise<void> {
    const existing = await this.getProductStock(clientId, productId);
    
    if (existing) {
      await db
        .update(clientStock)
        .set({ 
          quantity,
          lastUpdated: new Date()
        })
        .where(and(eq(clientStock.clientId, clientId), eq(clientStock.productId, productId)));
    } else {
      await db.insert(clientStock).values({
        clientId,
        productId,
        quantity,
        minimumAlert: 5
      });
    }
  }

  async addStock(clientId: number, productId: number, quantityToAdd: number): Promise<void> {
    const existing = await this.getProductStock(clientId, productId);
    
    if (existing) {
      const newQuantity = existing.quantity + quantityToAdd;
      await this.updateStock(clientId, productId, newQuantity);
    } else {
      await this.updateStock(clientId, productId, quantityToAdd);
    }
  }

  async subtractStock(clientId: number, productId: number, quantityToSubtract: number): Promise<void> {
    const existing = await this.getProductStock(clientId, productId);
    
    if (existing) {
      const newQuantity = Math.max(0, existing.quantity - quantityToSubtract);
      await this.updateStock(clientId, productId, newQuantity);
    }
  }

  async getLowStockAlerts(clientId?: number): Promise<(ClientStock & { product: any; client: any })[]> {
    let query = db
      .select({
        id: clientStock.id,
        clientId: clientStock.clientId,
        productId: clientStock.productId,
        quantity: clientStock.quantity,
        lastUpdated: clientStock.lastUpdated,
        minimumAlert: clientStock.minimumAlert,
        product: {
          id: products.id,
          name: products.name,
          country: products.country,
          type: products.type,
          unitPrice: products.unitPrice,
          volume: products.volume,
          photo: products.photo,
        },
        client: {
          id: clients.id,
          name: clients.name,
          cnpj: clients.cnpj,
          address: clients.address,
          phone: clients.phone,
          contactName: clients.contactName,
          isActive: clients.isActive,
        }
      })
      .from(clientStock)
      .leftJoin(products, eq(clientStock.productId, products.id))
      .leftJoin(clients, eq(clientStock.clientId, clients.id))
      .where(sql`${clientStock.quantity} <= ${clientStock.minimumAlert}`);

    if (clientId) {
      query = query.where(eq(clientStock.clientId, clientId));
    }

    return await query.orderBy(desc(clientStock.lastUpdated));
  }

  async setMinimumAlert(clientId: number, productId: number, minimumAlert: number): Promise<void> {
    await db
      .update(clientStock)
      .set({ minimumAlert })
      .where(and(eq(clientStock.clientId, clientId), eq(clientStock.productId, productId)));
  }

  async getTotalStockValue(clientId: number): Promise<string> {
    const [result] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${clientStock.quantity} * CAST(${products.unitPrice} AS DECIMAL)), 0)`,
      })
      .from(clientStock)
      .leftJoin(products, eq(clientStock.productId, products.id))
      .where(eq(clientStock.clientId, clientId));
    
    return result.total;
  }
}