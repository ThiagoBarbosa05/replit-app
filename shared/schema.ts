import { pgTable, text, serial, integer, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  contactName: text("contact_name").notNull(),
  isActive: integer("is_active").default(1).notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  type: text("type").notNull(), // tinto, branco, rosé, espumante
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  volume: text("volume").notNull().default("750ml"), // 750ml, 375ml, 187ml
  photo: text("photo"), // Base64 encoded image
});

export const consignments = pgTable("consignments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").default("pending").notNull(), // pending, delivered, completed
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
});

export const consignmentItems = pgTable("consignment_items", {
  id: serial("id").primaryKey(),
  consignmentId: integer("consignment_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
});

export const stockCounts = pgTable("stock_counts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  productId: integer("product_id").notNull(),
  consignmentId: integer("consignment_id").notNull(),
  quantitySent: integer("quantity_sent").notNull(),
  quantityRemaining: integer("quantity_remaining").notNull(),
  quantitySold: integer("quantity_sold").notNull(),
  countDate: timestamp("count_date").defaultNow().notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalSold: decimal("total_sold", { precision: 10, scale: 2 }).notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // admin, manager, user
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  isActive: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertConsignmentSchema = createInsertSchema(consignments).omit({
  id: true,
  date: true,
  status: true,
  totalValue: true,
});

export const insertConsignmentItemSchema = createInsertSchema(consignmentItems).omit({
  id: true,
});

export const insertStockCountSchema = createInsertSchema(stockCounts).omit({
  id: true,
  countDate: true,
  quantitySold: true,
  totalSold: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Consignment = typeof consignments.$inferSelect;
export type InsertConsignment = z.infer<typeof insertConsignmentSchema>;

export type ConsignmentItem = typeof consignmentItems.$inferSelect;
export type InsertConsignmentItem = z.infer<typeof insertConsignmentItemSchema>;

export type StockCount = typeof stockCounts.$inferSelect;
export type InsertStockCount = z.infer<typeof insertStockCountSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Extended types for API responses
export type ConsignmentWithDetails = Consignment & {
  client: Client;
  items: (ConsignmentItem & { product: Product })[];
};

export type DashboardStats = {
  totalConsigned: string;
  monthlySales: string;
  activeClients: number;
  totalProducts: number;
};

// New Schemas
const cellphoneRegex = /^(\(?\d{2}\)?\s?)?(9\d{4})-?(\d{4})$/;

export const createClientSchema = z.object({
  name: z.string().min(1, { message: "Nome dao cliente é obrigatório" }),
  cnpj: z
    .string()
    .min(14, { message: "CNPJ deve ter no mínimo 14 caracteres" }),
  address: z.string().min(1, { message: "Endereço é obrigatório" }),
  phone: z.string().regex(cellphoneRegex, {
    message: "Número de celular inválido. Ex: (11) 91234-5678",
  }),
  contactName: z.string().min(1, { message: "Nome do contato é obrigatório" }),
});