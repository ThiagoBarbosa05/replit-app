import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { insertProductSchema } from "@shared/schema";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getProducts = async (req: Request, res: Response) => {
    try {
      const products = await this.productService.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  };

  getProduct = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const product = await this.productService.getProductById(id);
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      if (error instanceof Error && error.message === "Product not found") {
        res.status(404).json({ message: "Product not found" });
      } else {
        res.status(500).json({ message: "Failed to fetch product" });
      }
    }
  };

  createProduct = async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await this.productService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Invalid product data", error });
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await this.productService.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof Error && error.message === "Product not found") {
        res.status(404).json({ message: "Product not found" });
      } else {
        res.status(400).json({ message: "Failed to update product", error });
      }
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await this.productService.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  };
}