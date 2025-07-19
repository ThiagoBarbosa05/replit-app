import { Request, Response } from "express";
import { ClientService } from "../services/client.service";
import { insertClientSchema } from "@shared/schema";
import { createClientSchema } from "@shared/schemas";

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  getClients = async (req: Request, res: Response) => {
    try {
      const searchTerm = req.query.search as string;
      const statusFilter = req.query.status as string;
      
      const clients = await this.clientService.getAllClients(searchTerm, statusFilter);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  };

  getClient = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const client = await this.clientService.getClientById(id);
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      if (error instanceof Error && error.message === "Client not found") {
        res.status(404).json({ message: "Client not found" });
      } else {
        res.status(500).json({ message: "Failed to fetch client" });
      }
    }
  };

  createClient = async (req: Request, res: Response) => {
    try {
      const clientData = createClientSchema.parse(req.body);
      
      // Check if client with CNPJ already exists
      const clients = await this.clientService.getAllClients();
      const existingClient = clients.find(c => c.cnpj === clientData.cnpj);
      
      if (existingClient) {
        return res
          .status(400)
          .send(`Cliente com o CNPJ ${clientData.cnpj} já existe`);
      }
      
      const client = await this.clientService.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Invalid client data", error });
    }
  };

  updateClient = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await this.clientService.updateClient(id, clientData);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      if (error instanceof Error && error.message === "Client not found") {
        res.status(404).json({ message: "Client not found" });
      } else {
        res.status(400).json({ message: "Failed to update client", error });
      }
    }
  };

  deleteClient = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await this.clientService.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  };
}