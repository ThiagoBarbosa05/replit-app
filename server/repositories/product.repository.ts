import { db } from "../db";
import { products } from "@shared/schema";
import { eq, count } from "drizzle-orm";
import type { Product, InsertProduct } from "@shared/schema";

export class ProductRepository {
  async findAll(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async findById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async create(data: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async update(id: number, data: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();
    
    if (!product) throw new Error("Product not found");
    return product;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  async countTotal(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(products);
    return result.count;
  }
}