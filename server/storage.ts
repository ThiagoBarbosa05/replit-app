import { 
  Client, 
  Product, 
  Consignment, 
  ConsignmentItem, 
  StockCount,
  User,
  InsertClient, 
  InsertProduct, 
  InsertConsignment, 
  InsertConsignmentItem, 
  InsertStockCount,
  InsertUser,
  ConsignmentWithDetails,
  DashboardStats,
  clients,
  products,
  consignments,
  consignmentItems,
  stockCounts,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, desc, count, sum } from "drizzle-orm";

export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: number): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;

  // Consignments
  getConsignments(): Promise<ConsignmentWithDetails[]>;
  getConsignment(id: number): Promise<ConsignmentWithDetails | undefined>;
  createConsignment(consignment: InsertConsignment & { items: InsertConsignmentItem[] }): Promise<ConsignmentWithDetails>;
  updateConsignment(id: number, consignment: Partial<InsertConsignment>): Promise<ConsignmentWithDetails>;
  deleteConsignment(id: number): Promise<boolean>;

  // Stock Counts
  getStockCounts(clientId?: number): Promise<StockCount[]>;
  createStockCount(stockCount: InsertStockCount): Promise<StockCount>;
  updateStockCount(id: number, stockCount: Partial<InsertStockCount>): Promise<StockCount>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;

  // Reports
  getSalesByClient(startDate?: Date, endDate?: Date): Promise<any[]>;
  getSalesByProduct(startDate?: Date, endDate?: Date): Promise<any[]>;
  getCurrentStock(): Promise<any[]>;

  // Inventory Management
  getClientInventory(clientId: number): Promise<any[]>;
  calculateStockDifference(clientId: number, productId: number): Promise<any>;

  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize default users if not exists
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    try {
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length === 0) {
        // Create default users
        await db.insert(users).values([
          {
            name: "Administrador do Sistema",
            email: "admin@grandcru.com",
            password: "admin123",
            role: "admin",
            isActive: 1,
          },
          {
            name: "João Silva",
            email: "joao@grandcru.com", 
            password: "manager123",
            role: "manager",
            isActive: 1,
          },
          {
            name: "Maria Santos",
            email: "maria@grandcru.com",
            password: "user123",
            role: "user", 
            isActive: 1,
          }
        ]);
      }
    } catch (error) {
      console.log("Error initializing default users:", error);
    }
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClientByCnpj(cnpj: string): Promise<Client | null> {
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.cnpj, cnpj))
      .limit(1);

    return client[0] || null;
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client> {
    const [updated] = await db
      .update(clients)
      .set(clientData)
      .where(eq(clients.id, id))
      .returning();
    
    if (!updated) throw new Error("Client not found");
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...insertProduct,
        volume: insertProduct.volume || "750ml",
        photo: insertProduct.photo || null
      })
      .returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    
    if (!updated) throw new Error("Product not found");
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Consignments
  async getConsignments(): Promise<ConsignmentWithDetails[]> {
    const result = await db
      .select({
        id: consignments.id,
        clientId: consignments.clientId,
        date: consignments.date,
        status: consignments.status,
        totalValue: consignments.totalValue,
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
      .from(consignments)
      .leftJoin(clients, eq(consignments.clientId, clients.id))
      .orderBy(desc(consignments.date));

    const consignmentsWithItems: ConsignmentWithDetails[] = [];

    for (const row of result) {
      if (!row.client) continue;

      const items = await db
        .select({
          id: consignmentItems.id,
          consignmentId: consignmentItems.consignmentId,
          productId: consignmentItems.productId,
          quantity: consignmentItems.quantity,
          unitPrice: consignmentItems.unitPrice,
          product: {
            id: products.id,
            name: products.name,
            country: products.country,
            type: products.type,
            unitPrice: products.unitPrice,
            volume: products.volume,
            photo: products.photo,
          }
        })
        .from(consignmentItems)
        .leftJoin(products, eq(consignmentItems.productId, products.id))
        .where(eq(consignmentItems.consignmentId, row.id));

      consignmentsWithItems.push({
        id: row.id,
        clientId: row.clientId,
        date: row.date,
        status: row.status,
        totalValue: row.totalValue,
        client: row.client,
        items: items.filter(item => item.product).map(item => ({
          id: item.id,
          consignmentId: item.consignmentId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          product: item.product!
        }))
      });
    }

    return consignmentsWithItems;
  }

  async getConsignment(id: number): Promise<ConsignmentWithDetails | undefined> {
    const [consignmentRow] = await db
      .select({
        id: consignments.id,
        clientId: consignments.clientId,
        date: consignments.date,
        status: consignments.status,
        totalValue: consignments.totalValue,
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
      .from(consignments)
      .leftJoin(clients, eq(consignments.clientId, clients.id))
      .where(eq(consignments.id, id));

    if (!consignmentRow || !consignmentRow.client) return undefined;

    const items = await db
      .select({
        id: consignmentItems.id,
        consignmentId: consignmentItems.consignmentId,
        productId: consignmentItems.productId,
        quantity: consignmentItems.quantity,
        unitPrice: consignmentItems.unitPrice,
        product: {
          id: products.id,
          name: products.name,
          country: products.country,
          type: products.type,
          unitPrice: products.unitPrice,
          volume: products.volume,
          photo: products.photo,
        }
      })
      .from(consignmentItems)
      .leftJoin(products, eq(consignmentItems.productId, products.id))
      .where(eq(consignmentItems.consignmentId, id));

    return {
      id: consignmentRow.id,
      clientId: consignmentRow.clientId,
      date: consignmentRow.date,
      status: consignmentRow.status,
      totalValue: consignmentRow.totalValue,
      client: consignmentRow.client,
      items: items.filter(item => item.product).map(item => ({
        id: item.id,
        consignmentId: item.consignmentId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        product: item.product!
      }))
    };
  }

  async createConsignment(data: InsertConsignment & { items: InsertConsignmentItem[] }): Promise<ConsignmentWithDetails> {
    // Calculate total value
    const totalValue = data.items.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0
    ).toFixed(2);

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
      await db
        .insert(consignmentItems)
        .values(
          data.items.map(item => ({
            ...item,
            consignmentId: consignment.id,
          }))
        );
    }

    const result = await this.getConsignment(consignment.id);
    if (!result) throw new Error("Failed to create consignment");
    return result;
  }

  async updateConsignment(id: number, consignmentData: Partial<InsertConsignment>): Promise<ConsignmentWithDetails> {
    const [updated] = await db
      .update(consignments)
      .set(consignmentData)
      .where(eq(consignments.id, id))
      .returning();
    
    if (!updated) throw new Error("Consignment not found");
    
    const result = await this.getConsignment(id);
    if (!result) throw new Error("Failed to update consignment");
    return result;
  }

  async deleteConsignment(id: number): Promise<boolean> {
    // Delete associated items first
    await db.delete(consignmentItems).where(eq(consignmentItems.consignmentId, id));
    
    // Delete consignment
    const result = await db.delete(consignments).where(eq(consignments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Stock Counts
  async getStockCounts(clientId?: number): Promise<StockCount[]> {
    if (clientId) {
      return await db.select().from(stockCounts).where(eq(stockCounts.clientId, clientId));
    }
    return await db.select().from(stockCounts);
  }

  async createStockCount(insertStockCount: InsertStockCount): Promise<StockCount> {
    const quantitySold = insertStockCount.quantitySent - insertStockCount.quantityRemaining;
    const totalSold = (quantitySold * parseFloat(insertStockCount.unitPrice)).toFixed(2);
    
    const [stockCount] = await db
      .insert(stockCounts)
      .values({
        ...insertStockCount,
        quantitySold,
        totalSold,
      })
      .returning();
    
    return stockCount;
  }

  async updateStockCount(id: number, stockCountData: Partial<InsertStockCount>): Promise<StockCount> {
    const [existing] = await db.select().from(stockCounts).where(eq(stockCounts.id, id));
    if (!existing) throw new Error("Stock count not found");
    
    // Calculate derived fields if necessary
    const updateData: any = { ...stockCountData };
    if (stockCountData.quantityRemaining !== undefined || stockCountData.quantitySent !== undefined) {
      const quantitySent = stockCountData.quantitySent ?? existing.quantitySent;
      const quantityRemaining = stockCountData.quantityRemaining ?? existing.quantityRemaining;
      const unitPrice = stockCountData.unitPrice ?? existing.unitPrice;
      
      updateData.quantitySold = quantitySent - quantityRemaining;
      updateData.totalSold = (updateData.quantitySold * parseFloat(unitPrice)).toFixed(2);
    }
    
    const [updated] = await db
      .update(stockCounts)
      .set(updateData)
      .where(eq(stockCounts.id, id))
      .returning();
    
    if (!updated) throw new Error("Failed to update stock count");
    return updated;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    // Get total consigned amount
    const [totalConsignedResult] = await db
      .select({ 
        total: sql<string>`COALESCE(SUM(CAST(${consignments.totalValue} AS DECIMAL)), 0)` 
      })
      .from(consignments);

    // Get monthly sales amount
    const [monthlySalesResult] = await db
      .select({ 
        total: sql<string>`COALESCE(SUM(CAST(${stockCounts.totalSold} AS DECIMAL)), 0)` 
      })
      .from(stockCounts);

    // Get active clients count
    const [activeClientsResult] = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.isActive, 1));

    // Get total products count
    const [totalProductsResult] = await db
      .select({ count: count() })
      .from(products);

    const totalConsigned = parseFloat(totalConsignedResult.total)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const monthlySales = parseFloat(monthlySalesResult.total)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return {
      totalConsigned,
      monthlySales,
      activeClients: activeClientsResult.count,
      totalProducts: totalProductsResult.count,
    };
  }

  // Reports
  async getSalesByClient(startDate?: Date, endDate?: Date): Promise<any[]> {
    const baseQuery = db
      .select({
        clientId: stockCounts.clientId,
        client: {
          id: clients.id,
          name: clients.name,
          cnpj: clients.cnpj,
          address: clients.address,
          phone: clients.phone,
          contactName: clients.contactName,
          isActive: clients.isActive,
        },
        totalSales: sql<string>`SUM(CAST(${stockCounts.totalSold} AS DECIMAL))`,
        quantitySold: sql<number>`SUM(${stockCounts.quantitySold})`,
      })
      .from(stockCounts)
      .leftJoin(clients, eq(stockCounts.clientId, clients.id));

    // Apply date filters
    const conditions = [];
    if (startDate) {
      conditions.push(sql`${stockCounts.countDate} >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`${stockCounts.countDate} <= ${endDate}`);
    }
    
    let query = baseQuery;
    if (conditions.length === 1) {
      query = baseQuery.where(conditions[0]);
    } else if (conditions.length === 2) {
      query = baseQuery.where(and(...conditions));
    }

    const result = await query
      .groupBy(stockCounts.clientId, clients.id, clients.name, clients.cnpj, clients.address, clients.phone, clients.contactName, clients.isActive)
      .orderBy(sql`SUM(CAST(${stockCounts.totalSold} AS DECIMAL)) DESC`);
    
    return result
      .filter(row => row.client)
      .map(row => ({
        client: row.client!,
        totalSales: parseFloat(row.totalSales),
        quantitySold: row.quantitySold,
      }));
  }

  async getSalesByProduct(startDate?: Date, endDate?: Date): Promise<any[]> {
    const baseQuery = db
      .select({
        productId: stockCounts.productId,
        product: {
          id: products.id,
          name: products.name,
          country: products.country,
          type: products.type,
          unitPrice: products.unitPrice,
          volume: products.volume,
          photo: products.photo,
        },
        totalSales: sql<string>`SUM(CAST(${stockCounts.totalSold} AS DECIMAL))`,
        quantitySold: sql<number>`SUM(${stockCounts.quantitySold})`,
      })
      .from(stockCounts)
      .leftJoin(products, eq(stockCounts.productId, products.id));

    // Apply date filters
    const conditions = [];
    if (startDate) {
      conditions.push(sql`${stockCounts.countDate} >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`${stockCounts.countDate} <= ${endDate}`);
    }
    
    let query = baseQuery;
    if (conditions.length === 1) {
      query = baseQuery.where(conditions[0]);
    } else if (conditions.length === 2) {
      query = baseQuery.where(and(...conditions));
    }

    const result = await query
      .groupBy(stockCounts.productId, products.id, products.name, products.country, products.type, products.unitPrice, products.volume, products.photo)
      .orderBy(sql`SUM(CAST(${stockCounts.totalSold} AS DECIMAL)) DESC`);
    
    return result
      .filter(row => row.product)
      .map(row => ({
        product: row.product!,
        totalSales: parseFloat(row.totalSales),
        quantitySold: row.quantitySold,
      }));
  }

  async getCurrentStock(): Promise<any[]> {
    // Get all consignment items with product info
    const sentItems = await db
      .select({
        productId: consignmentItems.productId,
        quantity: consignmentItems.quantity,
        clientId: consignments.clientId,
        product: {
          id: products.id,
          name: products.name,
          country: products.country,
          type: products.type,
          unitPrice: products.unitPrice,
          volume: products.volume,
          photo: products.photo,
        }
      })
      .from(consignmentItems)
      .leftJoin(consignments, eq(consignmentItems.consignmentId, consignments.id))
      .leftJoin(products, eq(consignmentItems.productId, products.id));

    // Get all stock counts
    const soldItems = await db.select().from(stockCounts);

    // Calculate current stock
    const stockMap = new Map<number, any>();

    // Process sent items
    for (const item of sentItems) {
      if (!item.product) continue;
      
      const existing = stockMap.get(item.productId) || {
        product: item.product,
        totalSent: 0,
        totalRemaining: 0,
        clientCount: new Set(),
      };
      
      existing.totalSent += item.quantity;
      existing.clientCount.add(item.clientId);
      stockMap.set(item.productId, existing);
    }

    // Subtract sold quantities
    for (const count of soldItems) {
      const existing = stockMap.get(count.productId);
      if (existing) {
        existing.totalRemaining = Math.max(0, existing.totalSent - count.quantitySold);
      }
    }

    return Array.from(stockMap.values()).map(item => ({
      product: item.product,
      totalSent: item.totalSent,
      totalRemaining: item.totalRemaining,
      clientCount: item.clientCount.size,
      value: item.totalRemaining * parseFloat(item.product.unitPrice)
    }));
  }

  // Inventory Management
  async getClientInventory(clientId: number): Promise<any[]> {
    // Get all consignment items for this client with product info
    const sentItems = await db
      .select({
        productId: consignmentItems.productId,
        quantity: consignmentItems.quantity,
        consignmentDate: consignments.date,
        product: {
          id: products.id,
          name: products.name,
          country: products.country,
          type: products.type,
          unitPrice: products.unitPrice,
          volume: products.volume,
          photo: products.photo,
        }
      })
      .from(consignmentItems)
      .leftJoin(consignments, eq(consignmentItems.consignmentId, consignments.id))
      .leftJoin(products, eq(consignmentItems.productId, products.id))
      .where(eq(consignments.clientId, clientId));

    // Get stock counts for this client
    const clientStockCounts = await db
      .select()
      .from(stockCounts)
      .where(eq(stockCounts.clientId, clientId));

    // Process inventory
    const inventory = new Map<number, any>();

    for (const item of sentItems) {
      if (!item.product) continue;

      const existing = inventory.get(item.productId) || {
        product: item.product,
        totalSent: 0,
        totalCounted: 0,
        totalSold: 0,
        lastCountDate: null,
        consignmentDate: item.consignmentDate,
      };

      existing.totalSent += item.quantity;
      inventory.set(item.productId, existing);
    }

    // Add stock count information
    for (const count of clientStockCounts) {
      const existing = inventory.get(count.productId);
      if (existing) {
        existing.totalCounted = count.quantityRemaining;
        existing.totalSold = count.quantitySold;
        existing.lastCountDate = count.countDate;
      }
    }

    return Array.from(inventory.values())
      .sort((a, b) => a.product.name.localeCompare(b.product.name));
  }

  async calculateStockDifference(clientId: number, productId: number): Promise<any> {
    // Get total sent for this client and product
    const [totalSentResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${consignmentItems.quantity}), 0)` 
      })
      .from(consignmentItems)
      .leftJoin(consignments, eq(consignmentItems.consignmentId, consignments.id))
      .where(and(
        eq(consignments.clientId, clientId),
        eq(consignmentItems.productId, productId)
      ));

    const totalSent = totalSentResult.total;

    // Get latest stock count
    const [latestCount] = await db
      .select()
      .from(stockCounts)
      .where(and(
        eq(stockCounts.clientId, clientId),
        eq(stockCounts.productId, productId)
      ))
      .orderBy(desc(stockCounts.countDate))
      .limit(1);

    const remainingStock = latestCount ? latestCount.quantityRemaining : totalSent;
    const soldQuantity = totalSent - remainingStock;

    // Get product and client info
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));

    return {
      client: client || null,
      product: product || null,
      totalSent,
      remainingStock,
      soldQuantity,
      salesValue: soldQuantity * parseFloat(product?.unitPrice || "0"),
      lastCountDate: latestCount?.countDate || null
    };
  }

  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isActive: insertUser.isActive || 1,
        role: insertUser.role || "user",
      })
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!updated) throw new Error("User not found");
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
