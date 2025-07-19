import { db } from "../db";
import { consignments, consignmentItems, products, stockCounts, clients } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface ClientInventoryItem {
  productId: number;
  productName: string;
  productCountry: string;
  productType: string;
  unitPrice: string;
  volume: string;
  photo?: string;
  totalSent: number;
  totalRemaining: number;
  totalSold: number;
  totalSalesValue: string;
  consignments: {
    id: number;
    date: string;
    status: string;
    quantitySent: number;
    quantityRemaining: number;
    quantitySold: number;
    salesValue: string;
  }[];
}

export interface CurrentStockItem {
  clientId: number;
  clientName: string;
  productId: number;
  productName: string;
  productCountry: string;
  productType: string;
  unitPrice: string;
  totalSent: number;
  totalRemaining: number;
  totalSold: number;
  totalSalesValue: string;
}

export class InventoryRepository {
  async getClientInventory(clientId: number): Promise<ClientInventoryItem[]> {
    // Get all consignment items for this client
    const consignmentItemsQuery = await db
      .select({
        productId: consignmentItems.productId,
        product: products,
        consignmentId: consignmentItems.consignmentId,
        quantity: consignmentItems.quantity,
        unitPrice: consignmentItems.unitPrice,
        consignmentDate: consignments.date,
        consignmentStatus: consignments.status,
      })
      .from(consignmentItems)
      .leftJoin(products, eq(consignmentItems.productId, products.id))
      .leftJoin(consignments, eq(consignmentItems.consignmentId, consignments.id))
      .where(eq(consignments.clientId, clientId));

    // Get stock counts for this client
    const stockCountsQuery = await db
      .select()
      .from(stockCounts)
      .where(eq(stockCounts.clientId, clientId));

    // Group by product
    const inventoryMap = new Map<number, ClientInventoryItem>();

    // Process consignment items
    for (const item of consignmentItemsQuery) {
      if (!item.product) continue;

      const productId = item.productId;
      
      if (!inventoryMap.has(productId)) {
        inventoryMap.set(productId, {
          productId,
          productName: item.product.name,
          productCountry: item.product.country,
          productType: item.product.type,
          unitPrice: item.product.unitPrice,
          volume: item.product.volume || "750ml",
          photo: item.product.photo,
          totalSent: 0,
          totalRemaining: 0,
          totalSold: 0,
          totalSalesValue: "0.00",
          consignments: []
        });
      }

      const inventoryItem = inventoryMap.get(productId)!;
      inventoryItem.totalSent += item.quantity;

      // Add consignment details
      inventoryItem.consignments.push({
        id: item.consignmentId,
        date: item.consignmentDate,
        status: item.consignmentStatus,
        quantitySent: item.quantity,
        quantityRemaining: 0,
        quantitySold: 0,
        salesValue: "0.00"
      });
    }

    // Process stock counts
    for (const stockCount of stockCountsQuery) {
      const inventoryItem = inventoryMap.get(stockCount.productId);
      if (!inventoryItem) continue;

      inventoryItem.totalRemaining += stockCount.quantityRemaining;
      inventoryItem.totalSold += stockCount.quantitySold;
      inventoryItem.totalSalesValue = (
        parseFloat(inventoryItem.totalSalesValue) + parseFloat(stockCount.totalSold)
      ).toFixed(2);

      // Update consignment details
      const consignment = inventoryItem.consignments.find(c => 
        c.id === stockCount.consignmentId
      );
      if (consignment) {
        consignment.quantityRemaining += stockCount.quantityRemaining;
        consignment.quantitySold += stockCount.quantitySold;
        consignment.salesValue = (
          parseFloat(consignment.salesValue) + parseFloat(stockCount.totalSold)
        ).toFixed(2);
      }
    }

    // Set remaining quantity for items without stock counts
    for (const [_, item] of inventoryMap) {
      if (item.totalRemaining === 0 && item.totalSold === 0) {
        item.totalRemaining = item.totalSent;
        
        // Update consignments without stock counts
        for (const consignment of item.consignments) {
          if (consignment.quantityRemaining === 0 && consignment.quantitySold === 0) {
            consignment.quantityRemaining = consignment.quantitySent;
          }
        }
      }
    }

    return Array.from(inventoryMap.values());
  }

  async getCurrentStockReport(): Promise<CurrentStockItem[]> {
    const query = await db
      .select({
        clientId: consignments.clientId,
        clientName: clients.name,
        productId: consignmentItems.productId,
        productName: products.name,
        productCountry: products.country,
        productType: products.type,
        unitPrice: products.unitPrice,
        quantitySent: sql<number>`COALESCE(SUM(${consignmentItems.quantity}), 0)`,
        quantityRemaining: sql<number>`COALESCE(SUM(${stockCounts.quantityRemaining}), SUM(${consignmentItems.quantity}))`,
        quantitySold: sql<number>`COALESCE(SUM(${stockCounts.quantitySold}), 0)`,
        totalSalesValue: sql<string>`COALESCE(SUM(CAST(${stockCounts.totalSold} AS DECIMAL)), 0)`,
      })
      .from(consignmentItems)
      .leftJoin(consignments, eq(consignmentItems.consignmentId, consignments.id))
      .leftJoin(clients, eq(consignments.clientId, clients.id))
      .leftJoin(products, eq(consignmentItems.productId, products.id))
      .leftJoin(
        stockCounts,
        and(
          eq(stockCounts.clientId, consignments.clientId),
          eq(stockCounts.productId, consignmentItems.productId),
          eq(stockCounts.consignmentId, consignmentItems.consignmentId)
        )
      )
      .where(eq(consignments.status, "delivered"))
      .groupBy(
        consignments.clientId,
        clients.name,
        consignmentItems.productId,
        products.name,
        products.country,
        products.type,
        products.unitPrice
      );

    return query.map(row => ({
      clientId: row.clientId,
      clientName: row.clientName || "Cliente Desconhecido",
      productId: row.productId,
      productName: row.productName || "Produto Desconhecido",
      productCountry: row.productCountry || "",
      productType: row.productType || "",
      unitPrice: row.unitPrice || "0.00",
      totalSent: row.quantitySent,
      totalRemaining: row.quantityRemaining,
      totalSold: row.quantitySold,
      totalSalesValue: row.totalSalesValue.toString(),
    }));
  }
}