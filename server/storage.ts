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
  clients as clientsTable,
  DashboardStats
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class MemStorage implements IStorage {
  private clients: Map<number, Client>;
  private products: Map<number, Product>;
  private consignments: Map<number, Consignment>;
  private consignmentItems: Map<number, ConsignmentItem>;
  private stockCounts: Map<number, StockCount>;
  private users: Map<number, User>;
  private currentId: { [key: string]: number };

  constructor() {
    this.clients = new Map();
    this.products = new Map();
    this.consignments = new Map();
    this.consignmentItems = new Map();
    this.stockCounts = new Map();
    this.users = new Map();
    this.currentId = {
      clients: 1,
      products: 1,
      consignments: 1,
      consignmentItems: 1,
      stockCounts: 1,
      users: 1,
    };

    // Create default users
    this.createUser({
      name: "Administrador do Sistema",
      email: "admin@grandcru.com",
      password: "admin123",
      role: "admin",
      isActive: 1,
    });

    this.createUser({
      name: "João Silva",
      email: "joao@grandcru.com", 
      password: "manager123",
      role: "manager",
      isActive: 1,
    });

    this.createUser({
      name: "Maria Santos",
      email: "maria@grandcru.com",
      password: "user123",
      role: "user", 
      isActive: 1,
    });
  }

  // Clients
  async getClients(): Promise<Client[]> {
     return await db.select().from(clientsTable);
    // return Array.from(this.clients.values());
  }

  async getClientByCnpj(cnpj: string): Promise<Client | null> {
    const client = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.cnpj, cnpj))
      .limit(1);

    return client[0] || null;
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    // const id = this.currentId.clients++;
    // const client: Client = { ...insertClient, id, isActive: 1 };
    // this.clients.set(id, client);
    const [client] = await db
    .insert(clientsTable)
    .values(insertClient)
    .returning();
    return client;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client> {
    const existing = this.clients.get(id);
    if (!existing) throw new Error("Client not found");
    
    const updated = { ...existing, ...clientData };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const product: Product = { 
      ...insertProduct, 
      id,
      volume: insertProduct.volume || "750ml",
      photo: insertProduct.photo || null
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) throw new Error("Product not found");
    
    const updated = { ...existing, ...productData };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Consignments
  async getConsignments(): Promise<ConsignmentWithDetails[]> {
    const consignments = Array.from(this.consignments.values());
    const result: ConsignmentWithDetails[] = [];

    for (const consignment of consignments) {
      const client = this.clients.get(consignment.clientId);
      if (!client) continue;

      const items = Array.from(this.consignmentItems.values())
        .filter(item => item.consignmentId === consignment.id)
        .map(item => {
          const product = this.products.get(item.productId);
          return { ...item, product: product! };
        });

      result.push({ ...consignment, client, items });
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getConsignment(id: number): Promise<ConsignmentWithDetails | undefined> {
    const consignment = this.consignments.get(id);
    if (!consignment) return undefined;

    const client = this.clients.get(consignment.clientId);
    if (!client) return undefined;

    const items = Array.from(this.consignmentItems.values())
      .filter(item => item.consignmentId === id)
      .map(item => {
        const product = this.products.get(item.productId);
        return { ...item, product: product! };
      });

    return { ...consignment, client, items };
  }

  async createConsignment(data: InsertConsignment & { items: InsertConsignmentItem[] }): Promise<ConsignmentWithDetails> {
    const id = this.currentId.consignments++;
    
    // Calculate total value
    const totalValue = data.items.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0
    ).toFixed(2);

    const consignment: Consignment = {
      id,
      clientId: data.clientId,
      date: new Date(),
      status: "pending",
      totalValue,
    };

    this.consignments.set(id, consignment);

    // Create consignment items
    for (const itemData of data.items) {
      const itemId = this.currentId.consignmentItems++;
      const item: ConsignmentItem = {
        ...itemData,
        id: itemId,
        consignmentId: id,
      };
      this.consignmentItems.set(itemId, item);
    }

    const result = await this.getConsignment(id);
    if (!result) throw new Error("Failed to create consignment");
    return result;
  }

  async updateConsignment(id: number, consignmentData: Partial<InsertConsignment>): Promise<ConsignmentWithDetails> {
    const existing = this.consignments.get(id);
    if (!existing) throw new Error("Consignment not found");
    
    const updated = { ...existing, ...consignmentData };
    this.consignments.set(id, updated);
    const result = await this.getConsignment(id);
    if (!result) throw new Error("Failed to update consignment");
    return result;
  }

  async deleteConsignment(id: number): Promise<boolean> {
    // Delete associated items
    const items = Array.from(this.consignmentItems.values())
      .filter(item => item.consignmentId === id);
    
    items.forEach(item => this.consignmentItems.delete(item.id));
    
    return this.consignments.delete(id);
  }

  // Stock Counts
  async getStockCounts(clientId?: number): Promise<StockCount[]> {
    const counts = Array.from(this.stockCounts.values());
    if (clientId) {
      return counts.filter(count => count.clientId === clientId);
    }
    return counts;
  }

  async createStockCount(insertStockCount: InsertStockCount): Promise<StockCount> {
    const id = this.currentId.stockCounts++;
    const quantitySold = insertStockCount.quantitySent - insertStockCount.quantityRemaining;
    const totalSold = (quantitySold * parseFloat(insertStockCount.unitPrice)).toFixed(2);
    
    const stockCount: StockCount = {
      ...insertStockCount,
      id,
      countDate: new Date(),
      quantitySold,
      totalSold,
    };
    
    this.stockCounts.set(id, stockCount);
    return stockCount;
  }

  async updateStockCount(id: number, stockCountData: Partial<InsertStockCount>): Promise<StockCount> {
    const existing = this.stockCounts.get(id);
    if (!existing) throw new Error("Stock count not found");
    
    const updated = { ...existing, ...stockCountData };
    
    // Recalculate derived fields
    if (stockCountData.quantityRemaining !== undefined || stockCountData.quantitySent !== undefined) {
      updated.quantitySold = updated.quantitySent - updated.quantityRemaining;
      updated.totalSold = (updated.quantitySold * parseFloat(updated.unitPrice)).toFixed(2);
    }
    
    this.stockCounts.set(id, updated);
    return updated;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const consignments = Array.from(this.consignments.values());
    const stockCounts = Array.from(this.stockCounts.values());
    const clients = Array.from(this.clients.values());
    const products = Array.from(this.products.values());

    const totalConsigned = consignments
      .reduce((sum, c) => sum + parseFloat(c.totalValue), 0)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const monthlySales = stockCounts
      .reduce((sum, sc) => sum + parseFloat(sc.totalSold), 0)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const activeClients = clients.filter(c => c.isActive === 1).length;
    // const [activeClients] = await db
    //   .select({ count: count() })
    //   .from(clientsTable)
    //   .where(eq(clientsTable.isActive, 1));

    const totalProducts = products.length;

    return {
      totalConsigned,
      monthlySales,
      activeClients,
      totalProducts,
    };
  }

  // Reports
  async getSalesByClient(startDate?: Date, endDate?: Date): Promise<any[]> {
    const stockCounts = Array.from(this.stockCounts.values());
    const clientSales = new Map<number, { client: Client, totalSales: number, quantitySold: number }>();

    for (const count of stockCounts) {
      if (startDate && count.countDate < startDate) continue;
      if (endDate && count.countDate > endDate) continue;

      const client = this.clients.get(count.clientId);
      if (!client) continue;

      const existing = clientSales.get(count.clientId) || { client, totalSales: 0, quantitySold: 0 };
      existing.totalSales += parseFloat(count.totalSold);
      existing.quantitySold += count.quantitySold;
      clientSales.set(count.clientId, existing);
    }

    return Array.from(clientSales.values())
      .sort((a, b) => b.totalSales - a.totalSales);
  }

  async getSalesByProduct(startDate?: Date, endDate?: Date): Promise<any[]> {
    const stockCounts = Array.from(this.stockCounts.values());
    const productSales = new Map<number, { product: Product, totalSales: number, quantitySold: number }>();

    for (const count of stockCounts) {
      if (startDate && count.countDate < startDate) continue;
      if (endDate && count.countDate > endDate) continue;

      const product = this.products.get(count.productId);
      if (!product) continue;

      const existing = productSales.get(count.productId) || { product, totalSales: 0, quantitySold: 0 };
      existing.totalSales += parseFloat(count.totalSold);
      existing.quantitySold += count.quantitySold;
      productSales.set(count.productId, existing);
    }

    return Array.from(productSales.values())
      .sort((a, b) => b.totalSales - a.totalSales);
  }

  async getCurrentStock(): Promise<any[]> {
    const consignmentItems = Array.from(this.consignmentItems.values());
    const stockCounts = Array.from(this.stockCounts.values());
    const currentStock = new Map<string, any>();

    for (const item of consignmentItems) {
      const product = this.products.get(item.productId);
      const consignment = this.consignments.get(item.consignmentId);
      if (!product || !consignment) continue;

      const key = `${item.productId}`;
      const existing = currentStock.get(key) || { 
        product, 
        totalSent: 0, 
        totalRemaining: 0, 
        clientCount: new Set() 
      };
      
      existing.totalSent += item.quantity;
      existing.clientCount.add(consignment.clientId);
      currentStock.set(key, existing);
    }

    // Subtract sold quantities
    for (const count of stockCounts) {
      const key = `${count.productId}`;
      const existing = currentStock.get(key);
      if (existing) {
        existing.totalRemaining = existing.totalSent - count.quantitySold;
      }
    }

    return Array.from(currentStock.values()).map(item => ({
      ...item,
      clientCount: item.clientCount.size,
      value: item.totalRemaining * parseFloat(item.product.unitPrice)
    }));
  }

  // Inventory Management
  async getClientInventory(clientId: number): Promise<any[]> {
    // Get all consignment items for this client
    const consignments = Array.from(this.consignments.values())
      .filter(c => c.clientId === clientId);
    
    const inventory = new Map<number, any>();

    for (const consignment of consignments) {
      const items = Array.from(this.consignmentItems.values())
        .filter(item => item.consignmentId === consignment.id);

      for (const item of items) {
        const product = this.products.get(item.productId);
        if (!product) continue;

        const key = item.productId;
        const existing = inventory.get(key) || {
          product,
          totalSent: 0,
          totalCounted: 0,
          totalSold: 0,
          lastCountDate: null,
          consignmentDate: consignment.date
        };

        existing.totalSent += item.quantity;
        inventory.set(key, existing);
      }
    }

    // Add stock count information
    const stockCounts = Array.from(this.stockCounts.values())
      .filter(sc => sc.clientId === clientId);

    for (const count of stockCounts) {
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
    const consignments = Array.from(this.consignments.values())
      .filter(c => c.clientId === clientId);
    
    let totalSent = 0;
    for (const consignment of consignments) {
      const items = Array.from(this.consignmentItems.values())
        .filter(item => item.consignmentId === consignment.id && item.productId === productId);
      
      totalSent += items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Get latest stock count
    const stockCounts = Array.from(this.stockCounts.values())
      .filter(sc => sc.clientId === clientId && sc.productId === productId)
      .sort((a, b) => new Date(b.countDate).getTime() - new Date(a.countDate).getTime());

    const latestCount = stockCounts[0];
    const remainingStock = latestCount ? latestCount.quantityRemaining : totalSent;
    const soldQuantity = totalSent - remainingStock;

    const product = this.products.get(productId);
    const client = this.clients.get(clientId);

    return {
      client,
      product,
      totalSent,
      remainingStock,
      soldQuantity,
      salesValue: soldQuantity * parseFloat(product?.unitPrice || "0"),
      lastCountDate: latestCount?.countDate || null
    };
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { 
      ...insertUser, 
      id,
      isActive: insertUser.isActive || 1,
      role: insertUser.role || "user",
      createdAt: new Date(),
      lastLogin: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error("User not found");
    
    const updated = { ...existing, ...userData };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
}

export const storage = new MemStorage();
