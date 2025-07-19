import { ProductRepository } from "../repositories/product.repository";
import type { Product, InsertProduct } from "@shared/schema";

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    return await this.productRepository.create(data);
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product> {
    return await this.productRepository.update(id, data);
  }

  async deleteProduct(id: number): Promise<boolean> {
    return await this.productRepository.delete(id);
  }

  async getTotalProductsCount(): Promise<number> {
    return await this.productRepository.countTotal();
  }
}