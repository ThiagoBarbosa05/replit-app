import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { Client, Product, ConsignmentWithDetails, InsertConsignmentItem } from "@shared/schema";

interface ConsignmentFormData {
  clientId: number;
  items: InsertConsignmentItem[];
}

interface ConsignmentFormProps {
  consignment?: ConsignmentWithDetails | null;
  onSubmit: (data: ConsignmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConsignmentForm({ consignment, onSubmit, onCancel, isLoading }: ConsignmentFormProps) {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"]
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const form = useForm<ConsignmentFormData>({
    defaultValues: {
      clientId: consignment?.clientId || 0,
      items: consignment?.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) || [{ productId: 0, quantity: 1, unitPrice: "0" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleSubmit = (data: ConsignmentFormData) => {
    onSubmit(data);
  };

  const addItem = () => {
    append({ productId: 0, quantity: 1, unitPrice: "0" });
  };

  const calculateTotal = () => {
    const items = form.watch("items");
    return items.reduce((total, item) => {
      const price = parseFloat(item.unitPrice) || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="clientId">Cliente *</Label>
        <Select 
          onValueChange={(value) => form.setValue("clientId", parseInt(value))}
          defaultValue={consignment?.clientId?.toString()}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.clientId && (
          <p className="text-sm text-red-500 mt-1">Cliente é obrigatório</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>Produtos *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>Produto</Label>
                    <Select 
                      onValueChange={(value) => {
                        const product = products.find(p => p.id === parseInt(value));
                        form.setValue(`items.${index}.productId`, parseInt(value));
                        if (product) {
                          form.setValue(`items.${index}.unitPrice`, product.unitPrice);
                        }
                      }}
                      defaultValue={field.productId?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - {product.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label>Valor Unitário (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register(`items.${index}.unitPrice`)}
                    />
                  </div>

                  <div>
                    {fields.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-right">
          <span className="text-lg font-semibold">
            Valor Total: {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : consignment ? "Atualizar" : "Criar Consignação"}
        </Button>
      </div>
    </form>
  );
}
